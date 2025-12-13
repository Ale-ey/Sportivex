import { supabaseAdmin as supabase } from '../config/supabase.js';
import {
  validateTimeSlot,
  validateQRCode,
  validateRule,
  validateWaitlistJoin
} from '../utils/swimmingValidation.js';
import {
  processQRScan,
  processSwimmingQRScan,
  getAttendanceCount,
  addToWaitlist,
  removeFromWaitlist,
  getUserSwimmingRegistration,
  checkSwimmingRegistrationStatus,
  createSwimmingRegistration,
  updateSwimmingRegistration,
  createSwimmingMonthlyPayment,
  updateSwimmingMonthlyPayment,
  getUserSwimmingMonthlyPayments
} from '../services/swimmingService.js';
import * as stripeService from '../services/stripeService.js';
import { getTodayDate } from '../utils/timeSlotDetermination.js';

/**
 * Get all time slots with optional filters
 */
export const getTimeSlots = async (req, res) => {
  try {
    const { gender, active } = req.query;
    const user = req.user; // Get user from auth middleware

    console.log('Time slots query params:', { gender, active, activeType: typeof active });
    console.log('User info:', { userId: user?.id, userRole: user?.role, userGender: user?.gender });

    // First, get time slots without the join to avoid issues with null trainer_id
    let query = supabase
      .from('swimming_time_slots')
      .select('*');

    // Check if user is admin - admins see ALL slots without any filters
    const userRole = user?.role?.toLowerCase();
    const isAdmin = userRole === 'admin';

    if (isAdmin) {
      // Admin users: No filters applied - show ALL slots (active and inactive)
      // Only apply active filter if explicitly requested via query param
      if (active !== undefined) {
        const isActive = active === 'true' || active === true;
        console.log('Admin filtering by active:', isActive);
        query = query.eq('is_active', isActive);
      }
      // No gender filtering for admin - they see everything
      console.log('Admin user detected - showing all time slots without gender/role filters');
    } else {
      // Non-admin users: Apply filters based on gender and role
      
      // Filter by active status (only for non-admin users, or if admin explicitly requests it)
      if (active !== undefined) {
        const isActive = active === 'true' || active === true;
        console.log('Filtering by active:', isActive);
        query = query.eq('is_active', isActive);
      }

      // Auto-filter based on user's gender and role
      if (user) {
        const userGender = user.gender?.toLowerCase();

        // Build gender restrictions array based on user
        const allowedGenderRestrictions = [];

        if (userGender === 'male') {
          allowedGenderRestrictions.push('male', 'mixed');
        } else if (userGender === 'female') {
          allowedGenderRestrictions.push('female', 'mixed');
        } else if (userGender === 'other') {
          // Other can access mixed slots only
          allowedGenderRestrictions.push('mixed');
        } else {
          // No gender set - can only access mixed slots
          allowedGenderRestrictions.push('mixed');
        }

        // Filter by role - UG students cannot access faculty_pg slots
        if (userRole === 'ug') {
          // UG students: male see [male, mixed], female see [female, mixed]
          // Remove faculty_pg from allowed restrictions for UG students
          const filtered = allowedGenderRestrictions.filter(r => r !== 'faculty_pg');
          if (filtered.length > 0) {
            query = query.in('gender_restriction', filtered);
          } else {
            // If no allowed restrictions, return empty (shouldn't happen)
            query = query.eq('gender_restriction', 'nonexistent');
          }
        } else if (userRole === 'pg' || userRole === 'faculty' || userRole === 'alumni') {
          // PG, Faculty, Alumni: 
          // - Male see [male, mixed, faculty_pg]
          // - Female see [female, mixed, faculty_pg]
          // - Other see [mixed, faculty_pg]
          if (!allowedGenderRestrictions.includes('faculty_pg')) {
            allowedGenderRestrictions.push('faculty_pg');
          }
          query = query.in('gender_restriction', allowedGenderRestrictions);
        } else {
          // Unknown role - only mixed slots
          query = query.eq('gender_restriction', 'mixed');
        }

        console.log('Filtered gender restrictions for user:', {
          userGender,
          userRole,
          allowedRestrictions: allowedGenderRestrictions
        });
      } else if (gender) {
        // Fallback to query param if no user (shouldn't happen with auth middleware)
        query = query.eq('gender_restriction', gender.toLowerCase());
      }
    }

    const { data, error } = await query.order('start_time');

    console.log('Time slots query result:', { 
      dataCount: data?.length || 0, 
      error: error?.message || null,
      errorCode: error?.code || null,
      errorDetails: error?.details || null,
      hasData: !!data,
      firstItem: data?.[0] || null
    });

    if (error) {
      console.error('Error fetching time slots:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch time slots',
        error: error.message,
        errorCode: error.code
      });
    }

    // If no data but no error, log it
    if (!data || data.length === 0) {
      console.log('No time slots found in database.', {
        isAdmin,
        userRole,
        queryParams: { gender, active },
        totalSlotsInDB: 'Check database directly'
      });
    } else {
      console.log(`Found ${data.length} time slot(s) for ${isAdmin ? 'admin' : 'non-admin'} user`);
    }

    // For each time slot, get trainer info and current attendance count for today
    const today = getTodayDate();
    const enrichedData = await Promise.all(
      data.map(async (slot) => {
        // Get trainer info if trainer_id exists
        let trainer = null;
        if (slot.trainer_id) {
          const { data: trainerData, error: trainerError } = await supabase
            .from('users_metadata')
            .select('id, name, email')
            .eq('id', slot.trainer_id)
            .single();
          
          if (!trainerError && trainerData) {
            trainer = trainerData;
          }
        }

        // Get attendance count
        const { count } = await getAttendanceCount(slot.id, today);
        
        return {
          ...slot,
          trainer,
          currentCount: count,
          availableSpots: slot.max_capacity - count
        };
      })
    );

    // Set cache-control headers to prevent caching (especially for admin)
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        timeSlots: enrichedData,
        count: enrichedData.length
      }
    });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get specific time slot by ID
 */
export const getTimeSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('swimming_time_slots')
      .select('*, trainer:users_metadata(id, name, email)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Get current attendance count for today
    const today = getTodayDate();
    const { count } = await getAttendanceCount(data.id, today);

    res.status(200).json({
      success: true,
      data: {
        timeSlot: {
          ...data,
          currentCount: count,
          availableSpots: data.max_capacity - count
        }
      }
    });
  } catch (error) {
    console.error('Get time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new time slot (admin only)
 */
export const createTimeSlot = async (req, res) => {
  try {
    const { startTime, endTime, genderRestriction, trainerId, maxCapacity } = req.body;

    // Validate input
    const validation = validateTimeSlot({
      startTime,
      endTime,
      genderRestriction,
      maxCapacity
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if trainer exists (if provided)
    if (trainerId) {
      const { data: trainer } = await supabase
        .from('users_metadata')
        .select('id, role')
        .eq('id', trainerId)
        .single();

      if (!trainer) {
        return res.status(400).json({
          success: false,
          message: 'Trainer not found'
        });
      }
    }

    // Create time slot
    const { data, error } = await supabase
      .from('swimming_time_slots')
      .insert([
        {
          start_time: startTime,
          end_time: endTime,
          gender_restriction: genderRestriction.toLowerCase(),
          trainer_id: trainerId || null,
          max_capacity: maxCapacity || 20,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating time slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create time slot'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      data: {
        timeSlot: data
      }
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update time slot (admin only)
 */
export const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, genderRestriction, trainerId, maxCapacity, isActive } = req.body;

    // Build update object
    const updateData = {};
    if (startTime !== undefined) updateData.start_time = startTime;
    if (endTime !== undefined) updateData.end_time = endTime;
    if (genderRestriction !== undefined) updateData.gender_restriction = genderRestriction.toLowerCase();
    if (trainerId !== undefined) updateData.trainer_id = trainerId;
    if (maxCapacity !== undefined) updateData.max_capacity = maxCapacity;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Validate if time fields are provided
    if (startTime || endTime || genderRestriction || maxCapacity) {
      const validation = validateTimeSlot({
        startTime: startTime || '00:00',
        endTime: endTime || '23:59',
        genderRestriction: genderRestriction || 'mixed',
        maxCapacity: maxCapacity || 20
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }
    }

    const { data, error } = await supabase
      .from('swimming_time_slots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating time slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update time slot'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Time slot updated successfully',
      data: {
        timeSlot: data
      }
    });
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete time slot (admin only)
 */
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('swimming_time_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete time slot'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Scan QR code to check in
 */
export const scanQRCode = async (req, res) => {
  try {
    const { qrCodeValue } = req.body;
    const user = req.user; // From auth middleware

    // Validate QR code format
    const qrValidation = validateQRCode(qrCodeValue);
    if (!qrValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: qrValidation.message
      });
    }

    // Process QR scan with registration check
    const result = await processSwimmingQRScan(qrCodeValue, user);

    if (!result.success) {
      const statusCode = result.capacityExceeded ? 409 : result.alreadyCheckedIn ? 409 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during check-in'
    });
  }
};

/**
 * Manual check-in (admin only)
 */
export const manualCheckIn = async (req, res) => {
  try {
    const { userId, timeSlotId, sessionDate } = req.body;

    if (!userId || !timeSlotId || !sessionDate) {
      return res.status(400).json({
        success: false,
        message: 'User ID, time slot ID, and session date are required'
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users_metadata')
      .select('id, name, email, gender, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get time slot details
    const { data: timeSlot, error: slotError } = await supabase
      .from('swimming_time_slots')
      .select('*')
      .eq('id', timeSlotId)
      .single();

    if (slotError || !timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Create attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from('swimming_attendance')
      .insert([
        {
          time_slot_id: timeSlotId,
          user_id: userId,
          session_date: sessionDate,
          check_in_time: new Date().toISOString(),
          check_in_method: 'manual'
        }
      ])
      .select()
      .single();

    if (attendanceError) {
      console.error('Error creating attendance:', attendanceError);
      return res.status(500).json({
        success: false,
        message: 'Failed to record attendance'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Manual check-in successful',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('Manual check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get attendance for a specific time slot
 */
export const getAttendance = async (req, res) => {
  try {
    const { timeSlotId } = req.params;
    const { date } = req.query;

    const sessionDate = date || getTodayDate();

    const { data, error } = await supabase
      .from('swimming_attendance')
      .select('*, user:users_metadata(id, name, email, cms_id, gender, role)')
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .order('check_in_time', { ascending: true });

    if (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance'
      });
    }

    // Get time slot details
    const { data: timeSlot } = await supabase
      .from('swimming_time_slots')
      .select('*')
      .eq('id', timeSlotId)
      .single();

    res.status(200).json({
      success: true,
      data: {
        attendance: data,
        count: data.length,
        sessionDate,
        timeSlot
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current attendance count for a time slot
 */
export const getCurrentCount = async (req, res) => {
  try {
    const { timeSlotId } = req.params;
    const { date } = req.query;

    const sessionDate = date || getTodayDate();

    const { count } = await getAttendanceCount(timeSlotId, sessionDate);

    // Get time slot details
    const { data: timeSlot } = await supabase
      .from('swimming_time_slots')
      .select('max_capacity')
      .eq('id', timeSlotId)
      .single();

    res.status(200).json({
      success: true,
      data: {
        currentCount: count,
        maxCapacity: timeSlot?.max_capacity || 0,
        availableSpots: (timeSlot?.max_capacity || 0) - count,
        sessionDate
      }
    });
  } catch (error) {
    console.error('Get current count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's attendance history
 */
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('swimming_attendance')
      .select('*, time_slot:swimming_time_slots(*)')
      .eq('user_id', userId)
      .order('check_in_time', { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) {
      console.error('Error fetching user history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance history'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        history: data,
        count: data.length
      }
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Join waitlist
 */
export const joinWaitlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeSlotId, sessionDate } = req.body;

    const validation = validateWaitlistJoin({ timeSlotId, sessionDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const result = await addToWaitlist(userId, timeSlotId, sessionDate);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Join waitlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Leave waitlist
 */
export const leaveWaitlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeSlotId, sessionDate } = req.body;

    if (!timeSlotId || !sessionDate) {
      return res.status(400).json({
        success: false,
        message: 'Time slot ID and session date are required'
      });
    }

    const result = await removeFromWaitlist(userId, timeSlotId, sessionDate);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Leave waitlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get waitlist for a time slot
 */
export const getWaitlist = async (req, res) => {
  try {
    const { timeSlotId } = req.params;
    const { date } = req.query;

    const sessionDate = date || getTodayDate();

    const { data, error } = await supabase
      .from('swimming_waitlist')
      .select('*, user:users_metadata(id, name, email)')
      .eq('time_slot_id', timeSlotId)
      .eq('session_date', sessionDate)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching waitlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch waitlist'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        waitlist: data,
        count: data.length
      }
    });
  } catch (error) {
    console.error('Get waitlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all rules and regulations
 */
export const getRules = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('swimming_rules_regulations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching rules:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch rules and regulations'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        rules: data,
        count: data.length
      }
    });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new rule (admin only)
 */
export const createRule = async (req, res) => {
  try {
    const { title, content, category, displayOrder } = req.body;
    const createdBy = req.user.id;

    const validation = validateRule({ title, content, displayOrder });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { data, error } = await supabase
      .from('swimming_rules_regulations')
      .insert([
        {
          title,
          content,
          category: category || null,
          display_order: displayOrder || 0,
          is_active: true,
          created_by: createdBy
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating rule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create rule'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: {
        rule: data
      }
    });
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update rule (admin only)
 */
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, displayOrder, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('swimming_rules_regulations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating rule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update rule'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rule updated successfully',
      data: {
        rule: data
      }
    });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete rule (admin only)
 */
export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('swimming_rules_regulations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete rule'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all QR codes (admin only)
 */
export const getQRCodes = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('swimming_qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR codes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch QR codes'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qrCodes: data,
        count: data.length
      }
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new QR code (admin only)
 */
export const createQRCode = async (req, res) => {
  try {
    const { locationName, description } = req.body;

    if (!locationName) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    // Generate unique QR code value
    const qrCodeValue = `SWIMMING-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { data, error } = await supabase
      .from('swimming_qr_codes')
      .insert([
        {
          location_name: locationName,
          qr_code_value: qrCodeValue,
          description: description || null,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create QR code'
      });
    }

    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: {
        qrCode: data
      }
    });
  } catch (error) {
    console.error('Create QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update QR code (admin only)
 */
export const updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, description, isActive } = req.body;

    const updateData = {};
    if (locationName !== undefined) updateData.location_name = locationName;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('swimming_qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update QR code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code updated successfully',
      data: {
        qrCode: data
      }
    });
  } catch (error) {
    console.error('Update QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete QR code (admin only)
 */
export const deleteQRCode = async (_req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('swimming_qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete QR code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== SWIMMING REGISTRATION ====================

/**
 * Get user's swimming registration
 */
export const getSwimmingRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserSwimmingRegistration(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch registration'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        registration: result.registration
      }
    });
  } catch (error) {
    console.error('Error in getSwimmingRegistration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Check swimming registration status
 */
export const checkSwimmingRegistrationStatusController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkSwimmingRegistrationStatus(userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in checkSwimmingRegistrationStatusController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create swimming registration (initiate payment)
 */
export const createSwimmingRegistrationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { registration_fee } = req.body;

    const fee = registration_fee !== undefined ? registration_fee : 1500;

    const existing = await getUserSwimmingRegistration(userId);
    if (existing.success && existing.registration) {
      return res.status(400).json({
        success: false,
        message: 'User already has a swimming registration'
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const registrationResult = await createSwimmingRegistration({
      user_id: userId,
      registration_fee: fee,
      amount_paid: 0,
      payment_status: 'pending',
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    });

    if (!registrationResult.success) {
      return res.status(400).json({
        success: false,
        message: registrationResult.error || 'Failed to create registration'
      });
    }

    if (fee === 0) {
      const updateResult = await updateSwimmingRegistration(registrationResult.registration.id, {
        payment_status: 'succeeded',
        status: 'active',
        amount_paid: 0,
        activated_at: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        message: 'Registration created successfully (free)',
        data: {
          registration: updateResult.registration,
          requiresPayment: false
        }
      });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Stripe service will automatically add {CHECKOUT_SESSION_ID} placeholder
    const successUrl = `${baseUrl}/dashboard/swimming?payment=success&registrationId=${registrationResult.registration.id}`;
    const cancelUrl = `${baseUrl}/dashboard/swimming?payment=cancelled`;

    const stripeResult = await stripeService.createSwimmingRegistrationCheckoutSession(
      fee,
      userId,
      registrationResult.registration.id,
      successUrl,
      cancelUrl
    );

    if (!stripeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment session',
        error: stripeResult.error
      });
    }

    await updateSwimmingRegistration(registrationResult.registration.id, {
      stripe_session_id: stripeResult.session.id,
    });

    res.status(201).json({
      success: true,
      message: 'Registration created. Please complete payment.',
      data: {
        registration: registrationResult.registration,
        requiresPayment: true,
        checkoutUrl: stripeResult.session.url,
        sessionId: stripeResult.session.id
      }
    });
  } catch (error) {
    console.error('Error in createSwimmingRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify payment and update registration
 */
export const verifySwimmingRegistrationPayment = async (req, res) => {
  try {
    const { registrationId, sessionId } = req.body;
    const userId = req.user.id;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId is required'
      });
    }

    const { data: registration, error: regError } = await supabase
      .from('swimming_registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('user_id', userId)
      .single();

    if (regError || !registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if already paid
    if (registration.payment_status === 'succeeded' && registration.status === 'active') {
      console.log('Swimming Registration Payment - Registration already paid and active');
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: {
          registration: registration
        }
      });
    }

    // Use sessionId from request, or fallback to stored stripe_session_id
    const sessionIdToUse = sessionId || registration.stripe_session_id;
    
    if (!sessionIdToUse) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required. Please provide sessionId or ensure registration has stripe_session_id.'
      });
    }

    console.log('Swimming Registration Payment - Verifying session:', {
      sessionIdFromRequest: sessionId,
      sessionIdFromDB: registration.stripe_session_id,
      sessionIdToUse: sessionIdToUse
    });

    const stripeResult = await stripeService.verifyCheckoutSession(sessionIdToUse);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment session'
      });
    }

    const session = stripeResult.session;
    console.log('Swimming Registration Payment - Stripe session details:', {
      sessionId: session.id,
      status: session.status,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      mode: session.mode,
      amount_total: session.amount_total
    });

    // Check payment status - multiple ways to verify payment is complete
    const isPaymentComplete = 
      (session.status === 'complete' && 
       (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')) ||
      (session.payment_status === 'paid') ||
      (session.status === 'complete' && session.payment_intent);

    console.log('Swimming Registration Payment - Payment complete check:', { 
      isPaymentComplete, 
      sessionStatus: session.status, 
      paymentStatus: session.payment_status,
      hasPaymentIntent: !!session.payment_intent
    });

    if (isPaymentComplete) {
      const updateData = {
        payment_status: 'succeeded',
        status: 'active',
        amount_paid: registration.registration_fee || 0,
        stripe_payment_intent_id: session.payment_intent || null,
        activated_at: new Date().toISOString(),
      };

      console.log('Swimming Registration Payment - Updating registration with data:', {
        registrationId,
        updateData
      });

      const updateResult = await updateSwimmingRegistration(registrationId, updateData);

      if (!updateResult.success) {
        console.error('Swimming Registration Payment - Failed to update registration:', updateResult.error);
        return res.status(500).json({
          success: false,
          message: 'Payment verified but failed to update registration',
          error: updateResult.error
        });
      }

      console.log('Swimming Registration Payment - Registration updated successfully:', {
        registrationId: updateResult.registration?.id,
        paymentStatus: updateResult.registration?.payment_status,
        status: updateResult.registration?.status
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          registration: updateResult.registration
        }
      });
    }

    console.warn('Swimming Registration Payment - Payment not completed:', {
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      sessionId: session.id,
      registrationId: registration.id,
      currentPaymentStatus: registration.payment_status,
      currentStatus: registration.status
    });

    res.status(200).json({
      success: false,
      message: `Payment not completed. Session status: ${session.status}, Payment status: ${session.payment_status}. Please try again or contact support.`,
      data: {
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
        sessionId: session.id,
        registration: {
          id: registration.id,
          payment_status: registration.payment_status,
          status: registration.status
        }
      }
    });
  } catch (error) {
    console.error('Error in verifySwimmingRegistrationPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create monthly payment
 */
export const createSwimmingMonthlyPaymentController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId is required'
      });
    }

    const registrationResult = await getUserSwimmingRegistration(userId);
    if (!registrationResult.success || !registrationResult.registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrationResult.registration;

    if (registration.id !== registrationId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const now = new Date();
    const paymentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: existingPayment } = await supabase
      .from('swimming_monthly_payments')
      .select('*')
      .eq('registration_id', registrationId)
      .eq('payment_month', paymentMonth.toISOString().split('T')[0])
      .maybeSingle();

    if (existingPayment && existingPayment.payment_status === 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Monthly payment already completed for this month'
      });
    }

    let monthlyPayment;
    if (existingPayment) {
      monthlyPayment = existingPayment;
    } else {
      const paymentResult = await createSwimmingMonthlyPayment({
        registration_id: registrationId,
        user_id: userId,
        amount: registration.monthly_fee,
        payment_month: paymentMonth.toISOString().split('T')[0],
        payment_status: 'pending',
      });

      if (!paymentResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create monthly payment record'
        });
      }

      monthlyPayment = paymentResult.payment;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/swimming?payment=success&paymentId=${monthlyPayment.id}`;
    const cancelUrl = `${baseUrl}/dashboard/swimming?payment=cancelled`;

    const stripeResult = await stripeService.createSwimmingMonthlyPaymentCheckoutSession(
      registration.monthly_fee,
      userId,
      registrationId,
      paymentMonth.toISOString().split('T')[0],
      successUrl,
      cancelUrl
    );

    if (!stripeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment session',
        error: stripeResult.error
      });
    }

    await updateSwimmingMonthlyPayment(monthlyPayment.id, {
      stripe_session_id: stripeResult.session.id,
    });

    res.status(200).json({
      success: true,
      message: 'Monthly payment session created',
      data: {
        payment: monthlyPayment,
        checkoutUrl: stripeResult.session.url,
        sessionId: stripeResult.session.id
      }
    });
  } catch (error) {
    console.error('Error in createSwimmingMonthlyPaymentController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify monthly payment
 */
export const verifySwimmingMonthlyPayment = async (req, res) => {
  try {
    const { paymentId, sessionId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId and sessionId are required'
      });
    }

    const { data: payment, error: paymentError } = await supabase
      .from('swimming_monthly_payments')
      .select('*, registration:swimming_registrations(*)')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment session'
      });
    }

    const session = stripeResult.session;

    const isPaymentComplete = session.status === 'complete' && 
                             (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

    if (isPaymentComplete) {
      await updateSwimmingMonthlyPayment(paymentId, {
        payment_status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent || null,
        paid_at: new Date().toISOString(),
      });

      const nextPaymentDate = new Date(payment.payment_month);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      nextPaymentDate.setDate(8);

      await updateSwimmingRegistration(payment.registration_id, {
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        last_payment_date: payment.payment_month,
        payment_due: false,
      });

      return res.status(200).json({
        success: true,
        message: 'Monthly payment verified successfully'
      });
    }

    res.status(200).json({
      success: false,
      message: 'Payment not completed',
      data: {
        sessionStatus: session.status,
        paymentStatus: session.payment_status
      }
    });
  } catch (error) {
    console.error('Error in verifySwimmingMonthlyPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get monthly payment history
 */
export const getSwimmingMonthlyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 12 } = req.query;

    const result = await getUserSwimmingMonthlyPayments(userId, parseInt(limit, 10));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly payments',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payments: result.payments,
        count: result.payments.length
      }
    });
  } catch (error) {
    console.error('Error in getSwimmingMonthlyPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  // Time slots
  getTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  // Attendance
  scanQRCode,
  manualCheckIn,
  getAttendance,
  getCurrentCount,
  getUserHistory,
  // Waitlist
  joinWaitlist,
  leaveWaitlist,
  getWaitlist,
  // Rules
  getRules,
  createRule,
  updateRule,
  deleteRule,
  // QR Codes
  getQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  // Registration
  getSwimmingRegistration,
  checkSwimmingRegistrationStatus: checkSwimmingRegistrationStatusController,
  createSwimmingRegistration: createSwimmingRegistrationController,
  verifySwimmingRegistrationPayment,
  createSwimmingMonthlyPayment: createSwimmingMonthlyPaymentController,
  verifySwimmingMonthlyPayment,
  getSwimmingMonthlyPayments
};

