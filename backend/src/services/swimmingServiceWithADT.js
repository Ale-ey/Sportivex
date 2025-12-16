/**
 * SWIMMING SERVICE WITH ADT AND CONCURRENCY CONTROL
 * 
 * This service demonstrates the integration of:
 * 1. Abstract Data Types (ADTs) for domain modeling
 * 2. Concurrency control for thread-safe operations
 * 3. Message passing via Socket.IO for real-time updates
 * 
 * IMPROVEMENTS OVER ORIGINAL:
 * - Type safety and invariant enforcement via ADTs
 * - Race condition prevention via locks
 * - Real-time updates via message passing
 * - Better error handling and debugging
 */

import { supabaseAdmin as supabase } from '../config/supabase.js';
import SwimmingRegistrationADT from '../models/SwimmingRegistrationADT.js';
import AttendanceADT from '../models/AttendanceADT.js';
import { withLock, withOptimisticLock, broadcastToRoom, notifyUser } from '../utils/ConcurrencyManager.js';
import { determineTimeSlot, getTodayDate } from '../utils/timeSlotDetermination.js';

/**
 * Process QR scan with concurrency control
 * BEFORE: Could allow over-capacity check-ins due to race conditions
 * AFTER: Uses pessimistic locking to prevent race conditions
 * 
 * SPECIFICATION:
 * PRECONDITION: qrCodeValue valid, user authenticated
 * POSTCONDITION: If successful, attendance recorded and capacity updated atomically
 * 
 * @param {string} qrCodeValue - QR code scanned
 * @param {Object} user - User object with id, gender, role
 * @returns {Promise<Object>}
 */
export async function processQRScanWithConcurrency(qrCodeValue, user) {
  try {
    // 1. Validate QR code (non-blocking read)
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

    // 2. Get active time slots
    const today = new Date();
    const sessionDate = getTodayDate(today);

    const { data: timeSlots, error: slotsError } = await supabase
      .from('swimming_time_slots')
      .select('*')
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (slotsError || !timeSlots || timeSlots.length === 0) {
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

    const { timeSlot } = slotDetermination;

    // ==================== CONCURRENCY-SAFE SECTION ====================
    // Use pessimistic lock for critical section (capacity check + attendance creation)
    // Resource key: "attendance:{timeSlotId}:{sessionDate}"
    const resourceKey = `attendance:${timeSlot.id}:${sessionDate}`;

    const lockResult = await withLock(resourceKey, async (version) => {
      // Within lock: Get current attendance and check capacity

      // Create AttendanceADT instance
      const { data: existingAttendance, error: attendanceError } = await supabase
        .from('swimming_attendance')
        .select('user_id, check_in_time, check_in_method')
        .eq('time_slot_id', timeSlot.id)
        .eq('session_date', sessionDate);

      if (attendanceError) {
        throw new Error('Failed to fetch attendance data');
      }

      const attendance = AttendanceADT.fromExistingData({
        timeSlotId: timeSlot.id,
        sessionDate: sessionDate,
        maxCapacity: timeSlot.max_capacity,
        currentCount: existingAttendance ? existingAttendance.length : 0,
        attendeeIds: existingAttendance ? existingAttendance.map(a => a.user_id) : [],
        attendanceRecords: existingAttendance ? existingAttendance.map(a => ({
          userId: a.user_id,
          checkInTime: a.check_in_time,
          checkInMethod: a.check_in_method
        })) : [],
        genderRestriction: timeSlot.gender_restriction
      });

      // Use ADT method to check in (enforces all invariants)
      const checkInResult = attendance.checkIn(user.id, user.gender, user.role, 'qr_scan');

      if (!checkInResult.success) {
        return checkInResult;
      }

      // Persist to database
      const { data: newAttendance, error: insertError } = await supabase
        .from('swimming_attendance')
        .insert([{
          time_slot_id: timeSlot.id,
          user_id: user.id,
          session_date: sessionDate,
          check_in_time: checkInResult.attendance.checkInTime,
          check_in_method: checkInResult.attendance.checkInMethod
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error('Failed to record attendance');
      }

      // Return success with ADT-validated data
      return {
        success: true,
        message: 'Check-in successful',
        attendance: {
          id: newAttendance.id,
          checkInTime: newAttendance.check_in_time,
          sessionDate: newAttendance.session_date
        },
        timeSlot: {
          id: timeSlot.id,
          startTime: timeSlot.start_time,
          endTime: timeSlot.end_time,
          genderRestriction: timeSlot.gender_restriction,
          currentCount: checkInResult.currentCount,
          maxCapacity: timeSlot.max_capacity,
          availableSpots: checkInResult.availableSpots
        },
        concurrency: {
          lockVersion: version,
          resourceKey: resourceKey
        }
      };
    }, 5000); // 5 second timeout

    if (!lockResult.success) {
      return lockResult; // Return error from locked operation
    }

    // ==================== MESSAGE PASSING (CONCURRENCY MODEL 1) ====================
    // Notify all users in swimming room about capacity change
    broadcastToRoom('swimming', 'attendance:updated', {
      timeSlotId: timeSlot.id,
      sessionDate: sessionDate,
      currentCount: lockResult.data.timeSlot.currentCount,
      availableSpots: lockResult.data.timeSlot.availableSpots,
      isFull: lockResult.data.timeSlot.availableSpots === 0
    });

    // Notify specific user about successful check-in
    notifyUser(user.id, 'checkin:success', {
      timeSlot: lockResult.data.timeSlot,
      attendance: lockResult.data.attendance
    });

    return lockResult.data;

  } catch (error) {
    console.error('Error in processQRScanWithConcurrency:', error);
    return {
      success: false,
      message: 'An error occurred during check-in. Please try again.',
      error: error.message
    };
  }
}

/**
 * Get registration with ADT
 * BEFORE: Raw database object with no validation
 * AFTER: Returns ADT instance with enforced invariants
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getRegistrationADT(userId) {
  try {
    const { data, error } = await supabase
      .from('swimming_registrations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { success: false, registration: null, error: error.message };
    }

    if (!data) {
      return { success: true, registration: null };
    }

    // Create ADT instance (will validate all invariants)
    const registration = SwimmingRegistrationADT.fromDatabase(data);

    return {
      success: true,
      registration: registration.toJSON(), // Return safe JSON representation
      isActive: registration.isActive(),
      isPaymentDue: registration.isPaymentDue()
    };
  } catch (error) {
    console.error('Error in getRegistrationADT:', error);
    return {
      success: false,
      registration: null,
      error: error.message
    };
  }
}

/**
 * Create registration with ADT
 * BEFORE: Manual field construction with possible invariant violations
 * AFTER: Uses ADT factory method ensuring all invariants hold
 * 
 * @param {string} userId - User ID
 * @param {number} registrationFee - Registration fee
 * @returns {Promise<Object>}
 */
export async function createRegistrationWithADT(userId, registrationFee = 1500.00) {
  try {
    // Check for existing registration
    const existing = await getRegistrationADT(userId);
    if (existing.success && existing.registration) {
      return {
        success: false,
        error: 'User already has a swimming registration'
      };
    }

    // Create new registration using ADT factory method
    const registration = SwimmingRegistrationADT.createNew(userId, registrationFee);

    // Convert to database format
    const dbData = registration.toDatabase();

    // Persist to database
    const { data, error } = await supabase
      .from('swimming_registrations')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Return ADT instance with database ID
    const savedRegistration = SwimmingRegistrationADT.fromDatabase(data);

    return {
      success: true,
      registration: savedRegistration.toJSON()
    };
  } catch (error) {
    console.error('Error in createRegistrationWithADT:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify payment with optimistic locking
 * BEFORE: Possible race condition if multiple payment verifications happen
 * AFTER: Uses optimistic locking to ensure consistent state
 * 
 * @param {string} registrationId - Registration ID
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>}
 */
export async function verifyPaymentWithConcurrency(registrationId, paymentIntentId) {
  const resourceKey = `registration:${registrationId}`;

  const result = await withOptimisticLock(
    resourceKey,
    // Read operation
    async () => {
      const { data, error } = await supabase
        .from('swimming_registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (error || !data) {
        throw new Error('Registration not found');
      }

      return data;
    },
    // Write operation
    async (currentData) => {
      // Create ADT from current data
      const registration = SwimmingRegistrationADT.fromDatabase(currentData);

      // Check if already paid
      if (registration.getPaymentStatus() === 'succeeded') {
        return {
          alreadyPaid: true,
          registration: registration.toJSON()
        };
      }

      // Mark payment as succeeded (ADT enforces invariants)
      registration.markPaymentSucceeded(paymentIntentId);
      registration.activate();

      // Persist changes
      const updateData = registration.toDatabase();
      const { data, error } = await supabase
        .from('swimming_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update registration');
      }

      return {
        alreadyPaid: false,
        registration: SwimmingRegistrationADT.fromDatabase(data).toJSON()
      };
    },
    3 // Max 3 retries
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      reason: result.reason
    };
  }

  // Notify user via message passing
  const userId = result.data.registration.userId;
  notifyUser(userId, 'payment:verified', {
    registrationId,
    status: 'active'
  });

  return {
    success: true,
    message: result.data.alreadyPaid ? 'Payment already verified' : 'Payment verified successfully',
    registration: result.data.registration,
    concurrency: {
      attempts: result.attempts,
      version: result.version
    }
  };
}

/**
 * Get attendance statistics with ADT
 * @param {string} timeSlotId - Time slot ID
 * @param {string} sessionDate - Session date
 * @returns {Promise<Object>}
 */
export async function getAttendanceStats(timeSlotId, sessionDate) {
  try {
    // Get time slot details
    const { data: timeSlot, error: slotError } = await supabase
      .from('swimming_time_slots')
      .select('*')
      .eq('id', timeSlotId)
      .single();

    if (slotError || !timeSlot) {
      return {
        success: false,
        error: 'Time slot not found'
      };
    }

    // Get attendance records
    const { data: records, error: recordsError } = await supabase
      .from('swimming_attendance')
      .select('user_id, check_in_time, check_in_method')
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate);

    if (recordsError) {
      return {
        success: false,
        error: 'Failed to fetch attendance records'
      };
    }

    // Create AttendanceADT instance
    const attendance = AttendanceADT.fromExistingData({
      timeSlotId: timeSlot.id,
      sessionDate: sessionDate,
      maxCapacity: timeSlot.max_capacity,
      currentCount: records ? records.length : 0,
      attendeeIds: records ? records.map(r => r.user_id) : [],
      attendanceRecords: records ? records.map(r => ({
        userId: r.user_id,
        checkInTime: r.check_in_time,
        checkInMethod: r.check_in_method
      })) : [],
      genderRestriction: timeSlot.gender_restriction
    });

    return {
      success: true,
      stats: attendance.toJSON()
    };
  } catch (error) {
    console.error('Error in getAttendanceStats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  processQRScanWithConcurrency,
  getRegistrationADT,
  createRegistrationWithADT,
  verifyPaymentWithConcurrency,
  getAttendanceStats
};

