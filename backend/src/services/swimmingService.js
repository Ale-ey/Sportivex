import { supabase } from '../config/supabase.js';
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

    // 3. Determine appropriate time slot
    const slotDetermination = determineTimeSlot(timeSlots, today);

    if (slotDetermination.error) {
      return {
        success: false,
        message: slotDetermination.message
      };
    }

    const { timeSlot, reason, message: slotMessage } = slotDetermination;

    // 4. Validate user eligibility (gender/role)
    const eligibility = validateUserEligibility(user, timeSlot);

    if (!eligibility.isValid) {
      return {
        success: false,
        message: eligibility.message
      };
    }

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

