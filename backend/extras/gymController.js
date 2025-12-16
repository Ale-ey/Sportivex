import { supabaseAdmin } from "../src/config/supabase.js";
import { GYM_QR_CODE, GymCheckinStatus, GYM_EXERCISE_CATEGORIES, ActiveStatus } from "../src/utils/enums.js";

/**
 * Handle Gym Check-in/Check-out via QR Code scan
 * The user scans a static QR code at the gym entrance.
 */
const scanQR = async (req, res) => {
  try {
    const userId = req.user.id;
    const { qrCode } = req.body;

    // Validate the scanned QR code (In a real app, this might be dynamic or rotated)
    // For this requirement "one qr code for both", we assume a static code.
    if (qrCode !== GYM_QR_CODE.VALID_CODE) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR Code'
      });
    }

    // Check for an active check-in for this user
    const { data: activeCheckin, error: checkError } = await supabaseAdmin
      .from('gym_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('status', GymCheckinStatus.ACTIVE)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking active status:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Error checking status'
      });
    }

    if (activeCheckin) {
      // User is currently checked in -> Perform Check-out
      const { error: updateError } = await supabaseAdmin
        .from('gym_checkins')
        .update({
          check_out_time: new Date().toISOString(),
          status: GymCheckinStatus.COMPLETED
        })
        .eq('id', activeCheckin.id);

      if (updateError) {
        console.error('Error checking out:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to check out'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Checked out successfully',
        data: { status: 'checked_out' }
      });

    } else {
      // User is not checked in -> Perform Check-in
      const { data: newCheckin, error: insertError } = await supabaseAdmin
        .from('gym_checkins')
        .insert([{
          user_id: userId,
          check_in_time: new Date().toISOString(),
          status: GymCheckinStatus.ACTIVE
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error checking in:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to check in'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Checked in successfully',
        data: { status: 'checked_in', checkin: newCheckin }
      });
    }

  } catch (error) {
    console.error('QR Scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all workout categories
 */
const getCategories = async (req, res) => {
  try {
    // Filter out 'other' category from the main list
    const categories = GYM_EXERCISE_CATEGORIES.filter(cat => cat !== 'other');
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get exercises, optionally filtered by category
 */
const getExercises = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabaseAdmin.from('gym_exercises').select('*');
    
    if (category) {
      query = query.eq('category', category.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching exercises'
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get machines details
 */
const getMachines = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gym_machines')
      .select('*');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching machines'
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Gym Rules
 */
const getRules = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gym_rules')
      .select('*')
      .eq('is_active', ActiveStatus.ACTIVE)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching rules'
      });
    }

    res.status(200).json({
      success: true,
      data: data
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
 * Get Realtime User Count
 */
const getRealtimeCount = async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('gym_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('status', GymCheckinStatus.ACTIVE);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching count'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activeCheckins: count
      }
    });

  } catch (error) {
    console.error('Get count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin/Seeding endpoints (Optional but helpful for Postman testing)

const addExercise = async (req, res) => {
    try {
        const { name, description, category, area_affected, image_url } = req.body;
        const { data, error } = await supabaseAdmin.from('gym_exercises').insert([{
            name, description, category, area_affected, image_url
        }]).select().single();
        
        if(error) throw error;
        res.status(201).json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

const addMachine = async (req, res) => {
    try {
        const { name, description, area_affected, image_url } = req.body;
        const { data, error } = await supabaseAdmin.from('gym_machines').insert([{
            name, description, area_affected, image_url
        }]).select().single();
        
        if(error) throw error;
        res.status(201).json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

const addRule = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const { data, error } = await supabaseAdmin.from('gym_rules').insert([{
            title, content, category
        }]).select().single();
        
        if(error) throw error;
        res.status(201).json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

export default {
  scanQR,
  getCategories,
  getExercises,
  getMachines,
  getRules,
  getRealtimeCount,
  addExercise,
  addMachine,
  addRule
};

