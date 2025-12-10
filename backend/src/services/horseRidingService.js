import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Get all time slots
 */
export const getTimeSlots = async (filters = {}) => {
  try {
    let query = supabase
      .from('horse_riding_time_slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (filters.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }

    if (filters.day_of_week !== undefined) {
      query = query.eq('day_of_week', filters.day_of_week);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting time slots:', error);
      return { success: false, timeSlots: [], error: error.message };
    }

    return { success: true, timeSlots: data || [] };
  } catch (error) {
    console.error('Error in getTimeSlots:', error);
    return { success: false, timeSlots: [], error: error.message };
  }
};

/**
 * Get time slot by ID
 */
export const getTimeSlotById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_time_slots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting time slot:', error);
      return { success: false, timeSlot: null, error: error.message };
    }

    return { success: true, timeSlot: data };
  } catch (error) {
    console.error('Error in getTimeSlotById:', error);
    return { success: false, timeSlot: null, error: error.message };
  }
};

/**
 * Create time slot
 */
export const createTimeSlot = async (timeSlotData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_time_slots')
      .insert([timeSlotData])
      .select()
      .single();

    if (error) {
      console.error('Error creating time slot:', error);
      return { success: false, timeSlot: null, error: error.message };
    }

    return { success: true, timeSlot: data };
  } catch (error) {
    console.error('Error in createTimeSlot:', error);
    return { success: false, timeSlot: null, error: error.message };
  }
};

/**
 * Update time slot
 */
export const updateTimeSlot = async (id, timeSlotData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_time_slots')
      .update(timeSlotData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating time slot:', error);
      return { success: false, timeSlot: null, error: error.message };
    }

    if (!data) {
      return { success: false, timeSlot: null, error: 'Time slot not found' };
    }

    return { success: true, timeSlot: data };
  } catch (error) {
    console.error('Error in updateTimeSlot:', error);
    return { success: false, timeSlot: null, error: error.message };
  }
};

/**
 * Delete time slot
 */
export const deleteTimeSlot = async (id) => {
  try {
    const { error } = await supabase
      .from('horse_riding_time_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting time slot:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteTimeSlot:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all rules
 */
export const getRules = async () => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_rules')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error getting rules:', error);
      return { success: false, rules: [], error: error.message };
    }

    // Sort by display_order first, then by created_at if display_order is the same
    const sortedRules = (data || []).sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return { success: true, rules: sortedRules };
  } catch (error) {
    console.error('Error in getRules:', error);
    return { success: false, rules: [], error: error.message };
  }
};

/**
 * Create rule
 */
export const createRule = async (ruleData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_rules')
      .insert([ruleData])
      .select()
      .single();

    if (error) {
      console.error('Error creating rule:', error);
      return { success: false, rule: null, error: error.message };
    }

    return { success: true, rule: data };
  } catch (error) {
    console.error('Error in createRule:', error);
    return { success: false, rule: null, error: error.message };
  }
};

/**
 * Update rule
 */
export const updateRule = async (id, ruleData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_rules')
      .update(ruleData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating rule:', error);
      return { success: false, rule: null, error: error.message };
    }

    if (!data) {
      return { success: false, rule: null, error: 'Rule not found' };
    }

    return { success: true, rule: data };
  } catch (error) {
    console.error('Error in updateRule:', error);
    return { success: false, rule: null, error: error.message };
  }
};

/**
 * Delete rule
 */
export const deleteRule = async (id) => {
  try {
    const { error } = await supabase
      .from('horse_riding_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rule:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteRule:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all equipment
 */
export const getEquipment = async () => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting equipment:', error);
      return { success: false, equipment: [], error: error.message };
    }

    return { success: true, equipment: data || [] };
  } catch (error) {
    console.error('Error in getEquipment:', error);
    return { success: false, equipment: [], error: error.message };
  }
};

/**
 * Create equipment
 */
export const createEquipment = async (equipmentData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment')
      .insert([equipmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating equipment:', error);
      return { success: false, equipment: null, error: error.message };
    }

    return { success: true, equipment: data };
  } catch (error) {
    console.error('Error in createEquipment:', error);
    return { success: false, equipment: null, error: error.message };
  }
};

/**
 * Update equipment
 */
export const updateEquipment = async (id, equipmentData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment')
      .update(equipmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating equipment:', error);
      return { success: false, equipment: null, error: error.message };
    }

    if (!data) {
      return { success: false, equipment: null, error: 'Equipment not found' };
    }

    return { success: true, equipment: data };
  } catch (error) {
    console.error('Error in updateEquipment:', error);
    return { success: false, equipment: null, error: error.message };
  }
};

/**
 * Delete equipment
 */
export const deleteEquipment = async (id) => {
  try {
    const { error } = await supabase
      .from('horse_riding_equipment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting equipment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteEquipment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all registrations (admin only)
 */
export const getAllRegistrations = async () => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_registrations')
      .select(`
        *,
        user:users_metadata(
          id,
          name,
          email,
          cms_id,
          role,
          institution,
          phone,
          profile_picture_url,
          gender,
          date_of_birth,
          address,
          bio
        )
      `)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error getting all registrations:', error);
      return { success: false, registrations: [], error: error.message };
    }

    return { success: true, registrations: data || [] };
  } catch (error) {
    console.error('Error in getAllRegistrations:', error);
    return { success: false, registrations: [], error: error.message };
  }
};

/**
 * Get user registration
 */
export const getUserRegistration = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_registrations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in getUserRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Calculate next payment date (8th of next month)
 */
const calculateNextPaymentDate = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // If today is before the 8th, payment is due on the 8th of current month
  // Otherwise, payment is due on the 8th of next month
  if (now.getDate() < 8) {
    return new Date(currentYear, currentMonth, 8);
  } else {
    // Next month, 8th day
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return new Date(nextYear, nextMonth, 8);
  }
};

/**
 * Create registration (pending payment)
 */
export const createRegistration = async (registrationData) => {
  try {
    // Check if user already has a registration
    const existing = await getUserRegistration(registrationData.user_id);
    if (existing.success && existing.registration) {
      return { success: false, registration: null, error: 'User already has a registration' };
    }

    // Set up monthly payment tracking
    const nextPaymentDate = calculateNextPaymentDate();
    const registrationWithMonthly = {
      ...registrationData,
      monthly_fee: 2000.00, // Default monthly fee
      next_payment_date: nextPaymentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      payment_due: false, // Will be checked later
    };

    const { data, error } = await supabase
      .from('horse_riding_registrations')
      .insert([registrationWithMonthly])
      .select()
      .single();

    if (error) {
      console.error('Error creating registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in createRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Check and update payment due status for all registrations
 */
export const checkPaymentDueStatus = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all active registrations
    const { data: registrations, error } = await supabase
      .from('horse_riding_registrations')
      .select('id, next_payment_date, payment_due, status')
      .in('status', ['paid', 'enrolled']);

    if (error) {
      console.error('Error checking payment due status:', error);
      return { success: false, error: error.message };
    }

    // Update payment_due for registrations where next_payment_date has passed
    const overdueRegistrations = registrations.filter(
      (reg) => reg.next_payment_date && reg.next_payment_date <= todayStr && !reg.payment_due
    );

    if (overdueRegistrations.length > 0) {
      const ids = overdueRegistrations.map((reg) => reg.id);
      const { error: updateError } = await supabase
        .from('horse_riding_registrations')
        .update({ payment_due: true })
        .in('id', ids);

      if (updateError) {
        console.error('Error updating payment due status:', updateError);
        return { success: false, error: updateError.message };
      }
    }

    return { success: true, overdueCount: overdueRegistrations.length };
  } catch (error) {
    console.error('Error in checkPaymentDueStatus:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create monthly payment record
 */
export const createMonthlyPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_monthly_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating monthly payment:', error);
      return { success: false, payment: null, error: error.message };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error in createMonthlyPayment:', error);
    return { success: false, payment: null, error: error.message };
  }
};

/**
 * Update monthly payment status
 */
export const updateMonthlyPayment = async (paymentId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_monthly_payments')
      .update(paymentData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating monthly payment:', error);
      return { success: false, payment: null, error: error.message };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error('Error in updateMonthlyPayment:', error);
    return { success: false, payment: null, error: error.message };
  }
};

/**
 * Get user's monthly payment history
 */
export const getUserMonthlyPayments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_monthly_payments')
      .select('*')
      .eq('user_id', userId)
      .order('payment_month', { ascending: false });

    if (error) {
      console.error('Error getting monthly payments:', error);
      return { success: false, payments: [], error: error.message };
    }

    return { success: true, payments: data || [] };
  } catch (error) {
    console.error('Error in getUserMonthlyPayments:', error);
    return { success: false, payments: [], error: error.message };
  }
};

/**
 * Update registration (e.g., after payment)
 */
export const updateRegistration = async (id, registrationData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_registrations')
      .update(registrationData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    if (!data) {
      return { success: false, registration: null, error: 'Registration not found' };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in updateRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Get user enrollments
 */
export const getUserEnrollments = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('horse_riding_enrollments')
      .select(`
        *,
        time_slot:horse_riding_time_slots(*)
      `)
      .eq('user_id', userId)
      .order('session_date', { ascending: true });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.session_date) {
      query = query.eq('session_date', filters.session_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting enrollments:', error);
      return { success: false, enrollments: [], error: error.message };
    }

    return { success: true, enrollments: data || [] };
  } catch (error) {
    console.error('Error in getUserEnrollments:', error);
    return { success: false, enrollments: [], error: error.message };
  }
};

/**
 * Create enrollment
 */
export const createEnrollment = async (enrollmentData) => {
  try {
    // Check if user is registered and paid
    const registration = await getUserRegistration(enrollmentData.user_id);
    if (!registration.success || !registration.registration) {
      return { success: false, enrollment: null, error: 'User must be registered first' };
    }

    if (registration.registration.status !== 'paid' && registration.registration.status !== 'enrolled') {
      return { success: false, enrollment: null, error: 'User must complete payment before enrolling' };
    }

    // Check if already enrolled for this time slot and date
    const { data: existing } = await supabase
      .from('horse_riding_enrollments')
      .select('id')
      .eq('time_slot_id', enrollmentData.time_slot_id)
      .eq('user_id', enrollmentData.user_id)
      .eq('session_date', enrollmentData.session_date)
      .maybeSingle();

    if (existing) {
      return { success: false, enrollment: null, error: 'Already enrolled for this session' };
    }

    const { data, error } = await supabase
      .from('horse_riding_enrollments')
      .insert([{
        ...enrollmentData,
        registration_id: registration.registration.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating enrollment:', error);
      return { success: false, enrollment: null, error: error.message };
    }

    return { success: true, enrollment: data };
  } catch (error) {
    console.error('Error in createEnrollment:', error);
    return { success: false, enrollment: null, error: error.message };
  }
};

/**
 * Get user equipment purchases
 */
export const getUserEquipmentPurchases = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment_purchases')
      .select(`
        *,
        equipment:horse_riding_equipment(*)
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Error getting equipment purchases:', error);
      return { success: false, purchases: [], error: error.message };
    }

    return { success: true, purchases: data || [] };
  } catch (error) {
    console.error('Error in getUserEquipmentPurchases:', error);
    return { success: false, purchases: [], error: error.message };
  }
};

/**
 * Create equipment purchase (pending payment)
 */
export const createEquipmentPurchase = async (purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment_purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating equipment purchase:', error);
      return { success: false, purchase: null, error: error.message };
    }

    return { success: true, purchase: data };
  } catch (error) {
    console.error('Error in createEquipmentPurchase:', error);
    return { success: false, purchase: null, error: error.message };
  }
};

/**
 * Update equipment purchase (e.g., after payment)
 */
export const updateEquipmentPurchase = async (id, purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('horse_riding_equipment_purchases')
      .update(purchaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating equipment purchase:', error);
      return { success: false, purchase: null, error: error.message };
    }

    if (!data) {
      return { success: false, purchase: null, error: 'Purchase not found' };
    }

    return { success: true, purchase: data };
  } catch (error) {
    console.error('Error in updateEquipmentPurchase:', error);
    return { success: false, purchase: null, error: error.message };
  }
};

