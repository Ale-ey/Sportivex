import { supabaseAdmin as supabase } from '../config/supabase.js';
import { determineTimeSlot, getTodayDate } from '../utils/timeSlotDetermination.js';
import { validateUserEligibility } from '../utils/swimmingValidation.js';

/**
 * Get current attendance count for a time slot
 */
export const getAttendanceCount = async (timeSlotId, sessionDate) => {
  try {
    const { count, error } = await supabase
      .from('swimming_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate);

    if (error) {
      console.error('Error getting attendance count:', error);
      return { success: false, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error in getAttendanceCount:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Check if user has already checked in for a session
 */
export const hasUserCheckedIn = async (userId, timeSlotId, sessionDate) => {
  try {
    const { data, error } = await supabase
      .from('swimming_attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user attendance:', error);
      return { success: false, hasCheckedIn: false };
    }

    return { success: true, hasCheckedIn: !!data };
  } catch (error) {
    console.error('Error in hasUserCheckedIn:', error);
    return { success: false, hasCheckedIn: false };
  }
};

/**
 * Get swimming time slots (optionally filtering active ones)
 */
export const getActiveTimeSlots = async (activeOnly = true) => {
  try {
    let query = supabase
      .from('swimming_time_slots')
      .select('*, trainer:users_metadata(id, name, email)');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching time slots:', error);
      return { success: false, timeSlots: [] };
    }

    return { success: true, timeSlots: data || [] };
  } catch (error) {
    console.error('Error in getActiveTimeSlots:', error);
    return { success: false, timeSlots: [] };
  }
};

/**
 * Process QR code scan and determine appropriate time slot
 */
export const processQRScan = async (qrCodeValue, user) => {
  try {
    // 1. Validate QR code exists and is active
    const { data: qrCode, error: qrError } = await supabase
      .from('swimming_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .single();

    if (qrError || !qrCode) {
      return {
        success: false,
        message: 'Invalid or inactive QR code'
      };
    }

    // 2. Get currently active time slots
    const today = new Date();
    const sessionDate = getTodayDate(today);

    const { success: slotsSuccess, timeSlots } = await getActiveTimeSlots(true);

    if (!slotsSuccess || timeSlots.length === 0) {
      return {
        success: false,
        message: 'No time slots are currently available'
      };
    }

    // 3. Filter time slots by user eligibility first (gender/role)
    const eligibleSlots = timeSlots.filter(slot => {
      const eligibility = validateUserEligibility(user, slot);
      return eligibility.isValid;
    });

    if (eligibleSlots.length === 0) {
      return {
        success: false,
        message: 'No time slots available for your role and gender. Please contact admin.'
      };
    }

    // 4. Determine appropriate time slot from eligible slots only
    const slotDetermination = determineTimeSlot(eligibleSlots, today);

    if (slotDetermination.error) {
      return {
        success: false,
        message: slotDetermination.message || 'No suitable time slot found for current time'
      };
    }

    const { timeSlot, reason, message: slotMessage } = slotDetermination;

    // 5. Check if user already checked in for this session
    const { hasCheckedIn } = await hasUserCheckedIn(user.id, timeSlot.id, sessionDate);

    if (hasCheckedIn) {
      return {
        success: false,
        message: 'You have already checked in for this time slot today',
        alreadyCheckedIn: true
      };
    }

    // 6. Check capacity
    const { count: currentCount } = await getAttendanceCount(timeSlot.id, sessionDate);

    if (currentCount >= timeSlot.max_capacity) {
      return {
        success: false,
        message: 'This time slot has reached maximum capacity',
        capacityExceeded: true,
        timeSlot: {
          id: timeSlot.id,
          startTime: timeSlot.start_time,
          endTime: timeSlot.end_time,
          currentCount,
          maxCapacity: timeSlot.max_capacity
        }
      };
    }

    // 7. Create attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from('swimming_attendance')
      .insert([
        {
          time_slot_id: timeSlot.id,
          user_id: user.id,
          session_date: sessionDate,
          check_in_time: new Date().toISOString(),
          check_in_method: 'qr_scan'
        }
      ])
      .select()
      .single();

    if (attendanceError) {
      console.error('Error creating attendance:', attendanceError);
      return {
        success: false,
        message: 'Failed to record attendance. Please try again.'
      };
    }

    // 8. Return success with details
    return {
      success: true,
      message: 'Check-in successful',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.check_in_time,
        sessionDate: attendance.session_date
      },
        timeSlot: {
          id: timeSlot.id,
        startTime: timeSlot.start_time,
        endTime: timeSlot.end_time,
        genderRestriction: timeSlot.gender_restriction,
        trainerName: timeSlot.trainer?.name || null,
        currentCount: currentCount + 1,
        maxCapacity: timeSlot.max_capacity
      },
      slotDeterminationReason: reason,
      slotMessage
    };
  } catch (error) {
    console.error('Error in processQRScan:', error);
    return {
      success: false,
      message: 'An error occurred during check-in. Please try again.'
    };
  }
};

/**
 * Add user to waitlist
 */
export const addToWaitlist = async (userId, timeSlotId, sessionDate) => {
  try {
    // Check if user is already on waitlist
    const { data: existing } = await supabase
      .from('swimming_waitlist')
      .select('id')
      .eq('user_id', userId)
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .single();

    if (existing) {
      return {
        success: false,
        message: 'You are already on the waitlist for this time slot'
      };
    }

    // Get current waitlist count to determine position
    const { count } = await supabase
      .from('swimming_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .eq('status', 'pending');

    const position = (count || 0) + 1;

    // Insert into waitlist
    const { data, error } = await supabase
      .from('swimming_waitlist')
      .insert([
        {
          user_id: userId,
          time_slot_id: timeSlotId,
          session_date: sessionDate,
          position,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding to waitlist:', error);
      return {
        success: false,
        message: 'Failed to join waitlist'
      };
    }

    return {
      success: true,
      message: 'Successfully added to waitlist',
      waitlist: {
        id: data.id,
        position: data.position,
        status: data.status
      }
    };
  } catch (error) {
    console.error('Error in addToWaitlist:', error);
    return {
      success: false,
      message: 'An error occurred while joining waitlist'
    };
  }
};

/**
 * Remove user from waitlist
 */
export const removeFromWaitlist = async (userId, timeSlotId, sessionDate) => {
  try {
    const { error } = await supabase
      .from('swimming_waitlist')
      .delete()
      .eq('user_id', userId)
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate);

    if (error) {
      console.error('Error removing from waitlist:', error);
      return {
        success: false,
        message: 'Failed to leave waitlist'
      };
    }

    // Reorder remaining waitlist positions
    await reorderWaitlist(timeSlotId, sessionDate);

    return {
      success: true,
      message: 'Successfully removed from waitlist'
    };
  } catch (error) {
    console.error('Error in removeFromWaitlist:', error);
    return {
      success: false,
      message: 'An error occurred while leaving waitlist'
    };
  }
};

/**
 * Reorder waitlist positions after removal
 */
const reorderWaitlist = async (timeSlotId, sessionDate) => {
  try {
    const { data: waitlist } = await supabase
      .from('swimming_waitlist')
      .select('id')
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .eq('status', 'pending')
      .order('position', { ascending: true });

    if (waitlist && waitlist.length > 0) {
      for (let i = 0; i < waitlist.length; i++) {
        await supabase
          .from('swimming_waitlist')
          .update({ position: i + 1 })
          .eq('id', waitlist[i].id);
      }
    }
  } catch (error) {
    console.error('Error reordering waitlist:', error);
  }
};

// ==================== SWIMMING REGISTRATION ====================

/**
 * Get user's swimming registration
 */
export const getUserSwimmingRegistration = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('swimming_registrations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user swimming registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in getUserSwimmingRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Check if user has active swimming registration (paid and not expired)
 */
export const checkSwimmingRegistrationStatus = async (userId) => {
  try {
    const { success, registration } = await getUserSwimmingRegistration(userId);

    if (!success || !registration) {
      return {
        success: false,
        isRegistered: false,
        isActive: false,
        message: 'No swimming registration found. Please register first.',
        registration: null
      };
    }

    // Check if registration is active and payment is up to date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isPaymentDue = registration.payment_due || 
      (registration.next_payment_date && registration.next_payment_date <= todayStr);

    const isActive = registration.status === 'active' && 
                     registration.payment_status === 'succeeded' &&
                     !isPaymentDue;

    return {
      success: true,
      isRegistered: true,
      isActive,
      isPaymentDue,
      message: isActive 
        ? 'Swimming registration is active' 
        : isPaymentDue 
          ? 'Monthly payment is due. Please pay to continue using swimming facilities.'
          : 'Swimming registration is not active',
      registration
    };
  } catch (error) {
    console.error('Error in checkSwimmingRegistrationStatus:', error);
    return {
      success: false,
      isRegistered: false,
      isActive: false,
      message: 'Error checking registration status',
      registration: null
    };
  }
};

/**
 * Calculate next payment date (8th of next month)
 */
const calculateNextSwimmingPaymentDate = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  if (now.getDate() < 8) {
    return new Date(currentYear, currentMonth, 8);
  } else {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return new Date(nextYear, nextMonth, 8);
  }
};

/**
 * Create swimming registration (pending payment)
 */
export const createSwimmingRegistration = async (registrationData) => {
  try {
    // Check if user already has a registration
    const existing = await getUserSwimmingRegistration(registrationData.user_id);
    if (existing.success && existing.registration) {
      return { success: false, registration: null, error: 'User already has a swimming registration' };
    }

    // Set up monthly payment tracking
    const nextPaymentDate = calculateNextSwimmingPaymentDate();
    const registrationWithMonthly = {
      ...registrationData,
      monthly_fee: 1500.00, // Default monthly fee
      next_payment_date: nextPaymentDate.toISOString().split('T')[0],
      payment_due: false,
    };

    const { data, error } = await supabase
      .from('swimming_registrations')
      .insert([registrationWithMonthly])
      .select()
      .single();

    if (error) {
      console.error('Error creating swimming registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in createSwimmingRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Update swimming registration
 */
export const updateSwimmingRegistration = async (registrationId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('swimming_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating swimming registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in updateSwimmingRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Create monthly payment record
 */
export const createSwimmingMonthlyPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('swimming_monthly_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating swimming monthly payment:', error);
      return { success: false, payment: null, error: error.message };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error in createSwimmingMonthlyPayment:', error);
    return { success: false, payment: null, error: error.message };
  }
};

/**
 * Update monthly payment status
 */
export const updateSwimmingMonthlyPayment = async (paymentId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('swimming_monthly_payments')
      .update(paymentData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating swimming monthly payment:', error);
      return { success: false, payment: null, error: error.message };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error in updateSwimmingMonthlyPayment:', error);
    return { success: false, payment: null, error: error.message };
  }
};

/**
 * Get user's monthly payment history
 */
export const getUserSwimmingMonthlyPayments = async (userId, limit = 12) => {
  try {
    const { data, error } = await supabase
      .from('swimming_monthly_payments')
      .select('*')
      .eq('user_id', userId)
      .order('payment_month', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting swimming monthly payments:', error);
      return { success: false, payments: [], error: error.message };
    }

    return { success: true, payments: data || [] };
  } catch (error) {
    console.error('Error in getUserSwimmingMonthlyPayments:', error);
    return { success: false, payments: [], error: error.message };
  }
};

/**
 * Process swimming QR scan with registration check
 */
export const processSwimmingQRScan = async (qrCodeValue, user) => {
  try {
    // 1. Check if user has active swimming registration
    const registrationStatus = await checkSwimmingRegistrationStatus(user.id);
    if (!registrationStatus.isActive) {
      return {
        success: false,
        message: registrationStatus.message || 'Swimming registration is not active. Please complete your monthly payment.',
        requiresPayment: registrationStatus.isPaymentDue
      };
    }

    // 2. Validate QR code exists and is active (swimming QR code)
    const { data: qrCode, error: qrError } = await supabase
      .from('swimming_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .single();

    if (qrError || !qrCode) {
      return {
        success: false,
        message: 'Invalid or inactive swimming QR code'
      };
    }

    // 3. Get currently active time slots
    const today = new Date();
    const sessionDate = getTodayDate(today);

    const { success: slotsSuccess, timeSlots } = await getActiveTimeSlots(true);

    if (!slotsSuccess || timeSlots.length === 0) {
      return {
        success: false,
        message: 'No time slots are currently available'
      };
    }

    // 4. Filter time slots by user eligibility first (gender/role)
    const eligibleSlots = timeSlots.filter(slot => {
      const eligibility = validateUserEligibility(user, slot);
      if (!eligibility.isValid) {
        console.log(`Slot ${slot.start_time}-${slot.end_time} (${slot.gender_restriction}) filtered out: ${eligibility.message}`);
      }
      return eligibility.isValid;
    });

    console.log(`User ${user.id} (role: ${user.role}, gender: ${user.gender}) - Eligible slots: ${eligibleSlots.length} out of ${timeSlots.length}`);
    eligibleSlots.forEach(slot => {
      console.log(`  - ${slot.start_time}-${slot.end_time} (${slot.gender_restriction})`);
    });

    if (eligibleSlots.length === 0) {
      return {
        success: false,
        message: 'No time slots available for your role and gender. Please contact admin.'
      };
    }

    // 5. Determine appropriate time slot from eligible slots only
    const slotDetermination = determineTimeSlot(eligibleSlots, today);
    
    console.log(`Determined slot: ${slotDetermination.timeSlot?.start_time}-${slotDetermination.timeSlot?.end_time} (${slotDetermination.timeSlot?.gender_restriction}), reason: ${slotDetermination.reason}`);

    if (slotDetermination.error) {
      return {
        success: false,
        message: slotDetermination.message || 'No suitable time slot found for current time'
      };
    }

    const { timeSlot, reason, message: slotMessage } = slotDetermination;

    // 6. Check if user already checked in for this session
    const { hasCheckedIn } = await hasUserCheckedIn(user.id, timeSlot.id, sessionDate);

    if (hasCheckedIn) {
      return {
        success: false,
        message: 'You have already checked in for this time slot today',
        alreadyCheckedIn: true
      };
    }

    // 7. Check capacity
    const { count: currentCount } = await getAttendanceCount(timeSlot.id, sessionDate);

    if (currentCount >= timeSlot.max_capacity) {
      return {
        success: false,
        message: 'This time slot has reached maximum capacity',
        capacityExceeded: true,
        timeSlot: {
          id: timeSlot.id,
          startTime: timeSlot.start_time,
          endTime: timeSlot.end_time,
          currentCount,
          maxCapacity: timeSlot.max_capacity
        }
      };
    }

    // 8. Create attendance record with registration_id
    const { data: attendance, error: attendanceError } = await supabase
      .from('swimming_attendance')
      .insert([
        {
          time_slot_id: timeSlot.id,
          user_id: user.id,
          registration_id: registrationStatus.registration.id,
          session_date: sessionDate,
          check_in_time: new Date().toISOString(),
          check_in_method: 'qr_scan'
        }
      ])
      .select()
      .single();

    if (attendanceError) {
      console.error('Error creating swimming attendance:', attendanceError);
      return {
        success: false,
        message: 'Failed to record attendance. Please try again.'
      };
    }

    // 9. Return success with details
    return {
      success: true,
      message: 'Check-in successful',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.check_in_time,
        sessionDate: attendance.session_date
      },
      timeSlot: {
        id: timeSlot.id,
        startTime: timeSlot.start_time,
        endTime: timeSlot.end_time,
        genderRestriction: timeSlot.gender_restriction,
        trainerName: timeSlot.trainer?.name || null,
        currentCount: currentCount + 1,
        maxCapacity: timeSlot.max_capacity
      },
      slotDeterminationReason: reason,
      slotMessage
    };
  } catch (error) {
    console.error('Error in processSwimmingQRScan:', error);
    return {
      success: false,
      message: 'An error occurred during check-in. Please try again.'
    };
  }
};

