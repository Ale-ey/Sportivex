import { supabaseAdmin as supabase } from '../config/supabase.js';
import {
  validateTimeSlot,
  validateQRCode,
  validateRule,
  validateWaitlistJoin
} from '../utils/swimmingValidation.js';
import {
  processQRScan,
  getAttendanceCount,
  addToWaitlist,
  removeFromWaitlist
} from '../services/swimmingService.js';
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

    // Process QR scan
    const result = await processQRScan(qrCodeValue, user);

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
  deleteQRCode
};

