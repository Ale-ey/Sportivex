import { supabaseAdmin as supabase } from '../config/supabase.js';
import * as horseRidingService from '../services/horseRidingService.js';
import * as stripeService from '../services/stripeService.js';

// ==================== TIME SLOTS ====================

/**
 * Get all time slots
 */
export const getTimeSlots = async (req, res) => {
  try {
    const { active, day_of_week } = req.query;
    const user = req.user;

    const filters = {};
    if (active !== undefined) {
      filters.active = active === 'true';
    }
    if (day_of_week !== undefined) {
      filters.day_of_week = parseInt(day_of_week);
    }

    // Admin can see all slots, users see only active
    if (user?.role?.toLowerCase() !== 'admin' && filters.active === undefined) {
      filters.active = true;
    }

    const result = await horseRidingService.getTimeSlots(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch time slots',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        timeSlots: result.timeSlots,
        count: result.timeSlots.length
      }
    });
  } catch (error) {
    console.error('Error in getTimeSlots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get time slot by ID
 */
export const getTimeSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await horseRidingService.getTimeSlotById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'Time slot not found'
      });
    }

    res.json({
      success: true,
      data: {
        timeSlot: result.timeSlot
      }
    });
  } catch (error) {
    console.error('Error in getTimeSlotById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create time slot (admin only)
 */
export const createTimeSlot = async (req, res) => {
  try {
    const { start_time, end_time, day_of_week, max_capacity, instructor_id, is_active } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'start_time and end_time are required'
      });
    }

    const result = await horseRidingService.createTimeSlot({
      start_time,
      end_time,
      day_of_week: day_of_week !== undefined ? parseInt(day_of_week) : null,
      max_capacity: max_capacity || 5,
      instructor_id: instructor_id || null,
      is_active: is_active !== undefined ? is_active : true,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create time slot'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      data: {
        timeSlot: result.timeSlot
      }
    });
  } catch (error) {
    console.error('Error in createTimeSlot:', error);
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
    const { start_time, end_time, day_of_week, max_capacity, instructor_id, is_active } = req.body;

    const updateData = {};
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week !== null ? parseInt(day_of_week) : null;
    if (max_capacity !== undefined) updateData.max_capacity = parseInt(max_capacity);
    if (instructor_id !== undefined) updateData.instructor_id = instructor_id || null;
    if (is_active !== undefined) updateData.is_active = is_active;

    const result = await horseRidingService.updateTimeSlot(id, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update time slot'
      });
    }

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: {
        timeSlot: result.timeSlot
      }
    });
  } catch (error) {
    console.error('Error in updateTimeSlot:', error);
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
    const result = await horseRidingService.deleteTimeSlot(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete time slot'
      });
    }

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTimeSlot:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== RULES ====================

/**
 * Get all rules
 */
export const getRules = async (req, res) => {
  try {
    console.log('Fetching horse riding rules...');
    const result = await horseRidingService.getRules();
    console.log('Rules service result:', { success: result.success, count: result.rules?.length || 0 });

    if (!result.success) {
      console.error('Failed to fetch rules:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch rules',
        error: result.error
      });
    }

    console.log('Returning rules:', result.rules.length);
    res.json({
      success: true,
      data: {
        rules: result.rules,
        count: result.rules.length
      }
    });
  } catch (error) {
    console.error('Error in getRules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create rule (admin only)
 */
export const createRule = async (req, res) => {
  try {
    const { title, content, category, display_order, is_active } = req.body;
    const user = req.user;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'title and content are required'
      });
    }

    const result = await horseRidingService.createRule({
      title,
      content,
      category: category || null,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
      created_by: user.id,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create rule'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: {
        rule: result.rule
      }
    });
  } catch (error) {
    console.error('Error in createRule:', error);
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
    const { title, content, category, display_order, is_active } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category || null;
    if (display_order !== undefined) updateData.display_order = parseInt(display_order);
    if (is_active !== undefined) updateData.is_active = is_active;

    const result = await horseRidingService.updateRule(id, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update rule'
      });
    }

    res.json({
      success: true,
      message: 'Rule updated successfully',
      data: {
        rule: result.rule
      }
    });
  } catch (error) {
    console.error('Error in updateRule:', error);
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
    const result = await horseRidingService.deleteRule(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete rule'
      });
    }

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== EQUIPMENT ====================

/**
 * Get all equipment
 */
export const getEquipment = async (req, res) => {
  try {
    const result = await horseRidingService.getEquipment();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        equipment: result.equipment,
        count: result.equipment.length
      }
    });
  } catch (error) {
    console.error('Error in getEquipment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create equipment (admin only)
 */
export const createEquipment = async (req, res) => {
  try {
    const { name, description, price, image_url, stock_quantity, is_available } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name and price are required'
      });
    }

    const result = await horseRidingService.createEquipment({
      name,
      description: description || null,
      price: parseFloat(price),
      image_url: image_url || null,
      stock_quantity: stock_quantity || 0,
      is_available: is_available !== undefined ? is_available : true,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create equipment'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: {
        equipment: result.equipment
      }
    });
  } catch (error) {
    console.error('Error in createEquipment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update equipment (admin only)
 */
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, stock_quantity, is_available } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (is_available !== undefined) updateData.is_available = is_available;

    const result = await horseRidingService.updateEquipment(id, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update equipment'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: {
        equipment: result.equipment
      }
    });
  } catch (error) {
    console.error('Error in updateEquipment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete equipment (admin only)
 */
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await horseRidingService.deleteEquipment(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete equipment'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteEquipment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== REGISTRATION ====================

/**
 * Get checkout URL for pending registration
 */
export const getRegistrationCheckoutUrl = async (req, res) => {
  try {
    const user = req.user;
    const { registrationId } = req.params;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId is required'
      });
    }

    // Get registration
    const registrationResult = await horseRidingService.getUserRegistration(user.id);
    if (!registrationResult.success || !registrationResult.registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrationResult.registration;

    // Verify registration ID matches
    if (registration.id !== registrationId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if there's a session ID
    if (!registration.stripe_session_id) {
      return res.status(400).json({
        success: false,
        message: 'No payment session found. Please create a new registration.'
      });
    }

    // Get checkout URL from Stripe
    const stripeResult = await stripeService.getCheckoutSessionUrl(registration.stripe_session_id);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: stripeResult.error || 'Failed to get checkout URL'
      });
    }

    res.json({
      success: true,
      data: {
        checkoutUrl: stripeResult.url
      }
    });
  } catch (error) {
    console.error('Error in getRegistrationCheckoutUrl:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user registration
 */
export const getUserRegistration = async (req, res) => {
  try {
    const user = req.user;
    const result = await horseRidingService.getUserRegistration(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch registration'
      });
    }

    res.json({
      success: true,
      data: {
        registration: result.registration
      }
    });
  } catch (error) {
    console.error('Error in getUserRegistration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create registration (initiate payment)
 */
export const createRegistration = async (req, res) => {
  try {
    const user = req.user;
    const { registration_fee } = req.body;

    // Default registration fee is 2000 PKR (can be overridden)
    const fee = registration_fee !== undefined ? registration_fee : 2000;

    // Check if user already has a registration
    const existing = await horseRidingService.getUserRegistration(user.id);
    if (existing.success && existing.registration) {
      return res.status(400).json({
        success: false,
        message: 'User already has a registration'
      });
    }

    // Create registration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const registrationResult = await horseRidingService.createRegistration({
      user_id: user.id,
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

    // If fee is 0, mark as paid immediately
    if (fee === 0) {
      const updateResult = await horseRidingService.updateRegistration(registrationResult.registration.id, {
        payment_status: 'succeeded',
        status: 'paid',
        amount_paid: 0,
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

    // Create Stripe checkout session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/horse-riding?payment=success&registrationId=${registrationResult.registration.id}`;
    const cancelUrl = `${baseUrl}/dashboard/horse-riding?payment=cancelled`;

    const stripeResult = await stripeService.createRegistrationCheckoutSession(
      fee,
      user.id,
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

    // Update registration with Stripe session ID
    await horseRidingService.updateRegistration(registrationResult.registration.id, {
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
    console.error('Error in createRegistration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify payment and update registration
 */
export const verifyRegistrationPayment = async (req, res) => {
  try {
    const { registrationId, sessionId } = req.body;
    const user = req.user;

    if (!registrationId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId and sessionId are required'
      });
    }

    // Get registration
    const registrationResult = await supabase
      .from('horse_riding_registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('user_id', user.id)
      .single();

    if (registrationResult.error || !registrationResult.data) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrationResult.data;

    // Verify Stripe session
    const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment session'
      });
    }

    const session = stripeResult.session;

    // Update registration based on payment status
    if (session.payment_status === 'paid') {
      const updateResult = await horseRidingService.updateRegistration(registrationId, {
        payment_status: 'succeeded',
        status: 'paid',
        amount_paid: registration.registration_fee,
        stripe_payment_intent_id: session.payment_intent || null,
        enrolled_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          registration: updateResult.registration
        }
      });
    }

    res.json({
      success: false,
      message: 'Payment not completed',
      data: {
        paymentStatus: session.payment_status
      }
    });
  } catch (error) {
    console.error('Error in verifyRegistrationPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create monthly payment (initiate payment for monthly fee)
 */
export const createMonthlyPayment = async (req, res) => {
  try {
    const user = req.user;
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId is required'
      });
    }

    // Get registration
    const registrationResult = await horseRidingService.getUserRegistration(user.id);
    if (!registrationResult.success || !registrationResult.registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrationResult.registration;

    // Verify registration ID matches
    if (registration.id !== registrationId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if payment is due
    if (!registration.payment_due && registration.next_payment_date) {
      const today = new Date();
      const nextPaymentDate = new Date(registration.next_payment_date);
      if (today < nextPaymentDate) {
        return res.status(400).json({
          success: false,
          message: `Payment is not due yet. Next payment date: ${registration.next_payment_date}`
        });
      }
    }

    const monthlyFee = registration.monthly_fee || 2000;
    const paymentMonth = registration.next_payment_date || new Date().toISOString().split('T')[0];

    // Create monthly payment record
    const paymentResult = await horseRidingService.createMonthlyPayment({
      registration_id: registrationId,
      user_id: user.id,
      amount: monthlyFee,
      payment_month: paymentMonth,
      payment_status: 'pending',
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Failed to create monthly payment'
      });
    }

    // Create Stripe checkout session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/horse-riding?payment=success&monthlyPaymentId=${paymentResult.payment.id}`;
    const cancelUrl = `${baseUrl}/dashboard/horse-riding?payment=cancelled`;

    const stripeResult = await stripeService.createMonthlyPaymentCheckoutSession(
      monthlyFee,
      user.id,
      registrationId,
      paymentMonth,
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

    // Update monthly payment with Stripe session ID
    await horseRidingService.updateMonthlyPayment(paymentResult.payment.id, {
      stripe_session_id: stripeResult.session.id,
    });

    res.status(201).json({
      success: true,
      message: 'Monthly payment session created. Please complete payment.',
      data: {
        payment: paymentResult.payment,
        checkoutUrl: stripeResult.session.url,
        sessionId: stripeResult.session.id
      }
    });
  } catch (error) {
    console.error('Error in createMonthlyPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify monthly payment
 */
export const verifyMonthlyPayment = async (req, res) => {
  try {
    const { monthlyPaymentId, sessionId } = req.body;
    const user = req.user;

    if (!monthlyPaymentId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'monthlyPaymentId and sessionId are required'
      });
    }

    // Get monthly payment
    const { data: payment, error: paymentError } = await supabase
      .from('horse_riding_monthly_payments')
      .select('*')
      .eq('id', monthlyPaymentId)
      .eq('user_id', user.id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Monthly payment not found'
      });
    }

    // Verify Stripe session
    const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment session',
        error: stripeResult.error
      });
    }

    const session = stripeResult.session;

    // Update monthly payment based on payment status
    if (session.payment_status === 'paid' || session.status === 'complete') {
      // Update monthly payment
      const updatePaymentResult = await horseRidingService.updateMonthlyPayment(monthlyPaymentId, {
        payment_status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent || null,
        paid_at: new Date().toISOString(),
      });

      // Update registration: calculate next payment date (8th of next month)
      const paymentMonth = new Date(payment.payment_month);
      const nextMonth = paymentMonth.getMonth() === 11 ? 0 : paymentMonth.getMonth() + 1;
      const nextYear = paymentMonth.getMonth() === 11 ? paymentMonth.getFullYear() + 1 : paymentMonth.getFullYear();
      const nextPaymentDate = new Date(nextYear, nextMonth, 8);

      await horseRidingService.updateRegistration(payment.registration_id, {
        last_payment_date: payment.payment_month,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        payment_due: false,
      });

      return res.json({
        success: true,
        message: 'Monthly payment verified successfully',
        data: {
          payment: updatePaymentResult.payment
        }
      });
    }

    res.json({
      success: false,
      message: 'Payment not completed',
      data: {
        paymentStatus: session.payment_status
      }
    });
  } catch (error) {
    console.error('Error in verifyMonthlyPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's monthly payment history
 */
export const getUserMonthlyPayments = async (req, res) => {
  try {
    const user = req.user;

    const result = await horseRidingService.getUserMonthlyPayments(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch monthly payments'
      });
    }

    res.json({
      success: true,
      data: {
        payments: result.payments,
        count: result.payments.length
      }
    });
  } catch (error) {
    console.error('Error in getUserMonthlyPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== ENROLLMENTS ====================

/**
 * Get user enrollments
 */
export const getUserEnrollments = async (req, res) => {
  try {
    const user = req.user;
    const { status, session_date } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (session_date) filters.session_date = session_date;

    const result = await horseRidingService.getUserEnrollments(user.id, filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch enrollments'
      });
    }

    res.json({
      success: true,
      data: {
        enrollments: result.enrollments,
        count: result.enrollments.length
      }
    });
  } catch (error) {
    console.error('Error in getUserEnrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create enrollment
 */
export const createEnrollment = async (req, res) => {
  try {
    const user = req.user;
    const { time_slot_id, session_date, notes } = req.body;

    if (!time_slot_id || !session_date) {
      return res.status(400).json({
        success: false,
        message: 'time_slot_id and session_date are required'
      });
    }

    const result = await horseRidingService.createEnrollment({
      user_id: user.id,
      time_slot_id,
      session_date,
      notes: notes || null,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create enrollment'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: {
        enrollment: result.enrollment
      }
    });
  } catch (error) {
    console.error('Error in createEnrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== EQUIPMENT PURCHASES ====================

/**
 * Get user equipment purchases
 */
export const getUserEquipmentPurchases = async (req, res) => {
  try {
    const user = req.user;
    const result = await horseRidingService.getUserEquipmentPurchases(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch purchases'
      });
    }

    res.json({
      success: true,
      data: {
        purchases: result.purchases,
        count: result.purchases.length
      }
    });
  } catch (error) {
    console.error('Error in getUserEquipmentPurchases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create equipment purchase (initiate payment)
 */
export const createEquipmentPurchase = async (req, res) => {
  try {
    const user = req.user;
    const { equipment_id, quantity } = req.body;

    if (!equipment_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'equipment_id and quantity are required'
      });
    }

    // Get equipment details
    const equipmentResult = await horseRidingService.getEquipment();
    const equipment = equipmentResult.equipment.find(eq => eq.id === equipment_id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (!equipment.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available'
      });
    }

    const totalAmount = equipment.price * quantity;

    // Create purchase record
    const purchaseResult = await horseRidingService.createEquipmentPurchase({
      user_id: user.id,
      equipment_id,
      quantity: parseInt(quantity),
      unit_price: equipment.price,
      total_amount: totalAmount,
      payment_status: 'pending',
      status: 'pending',
    });

    if (!purchaseResult.success) {
      return res.status(400).json({
        success: false,
        message: purchaseResult.error || 'Failed to create purchase'
      });
    }

    // Create Stripe checkout session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/horse-riding?payment=success&purchaseId=${purchaseResult.purchase.id}`;
    const cancelUrl = `${baseUrl}/dashboard/horse-riding?payment=cancelled`;

    const stripeResult = await stripeService.createEquipmentCheckoutSession(
      totalAmount,
      user.id,
      purchaseResult.purchase.id,
      equipment.name,
      quantity,
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

    // Update purchase with Stripe session ID
    await horseRidingService.updateEquipmentPurchase(purchaseResult.purchase.id, {
      stripe_session_id: stripeResult.session.id,
    });

    res.status(201).json({
      success: true,
      message: 'Purchase created. Please complete payment.',
      data: {
        purchase: purchaseResult.purchase,
        checkoutUrl: stripeResult.session.url,
        sessionId: stripeResult.session.id
      }
    });
  } catch (error) {
    console.error('Error in createEquipmentPurchase:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify equipment purchase payment
 */
export const verifyEquipmentPurchasePayment = async (req, res) => {
  try {
    const { purchaseId, sessionId } = req.body;
    const user = req.user;

    if (!purchaseId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'purchaseId and sessionId are required'
      });
    }

    // Get purchase
    const purchaseResult = await supabase
      .from('horse_riding_equipment_purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .single();

    if (purchaseResult.error || !purchaseResult.data) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Verify Stripe session
    const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment session'
      });
    }

    const session = stripeResult.session;
    console.log('Stripe session status:', {
      payment_status: session.payment_status,
      status: session.status,
      payment_intent: session.payment_intent
    });

    // Update purchase based on payment status
    // Check both payment_status and status fields
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const updateResult = await horseRidingService.updateEquipmentPurchase(purchaseId, {
        payment_status: 'succeeded',
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent || null,
        fulfilled_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          purchase: updateResult.purchase
        }
      });
    }

    res.json({
      success: false,
      message: 'Payment not completed',
      data: {
        paymentStatus: session.payment_status,
        sessionStatus: session.status
      }
    });
  } catch (error) {
    console.error('Error in verifyEquipmentPurchasePayment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all registrations with user details (admin only)
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const result = await horseRidingService.getAllRegistrations();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch registrations'
      });
    }

    res.json({
      success: true,
      data: {
        registrations: result.registrations,
        count: result.registrations.length
      }
    });
  } catch (error) {
    console.error('Error in getAllRegistrations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== WEBHOOK ====================

/**
 * Handle Stripe webhook
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    let event;
    try {
      const stripeModule = await import('../services/stripeService.js');
      const stripe = stripeModule.default || stripeModule.stripe;
      if (!stripe) {
        return res.status(500).json({
          success: false,
          message: 'Stripe not configured'
        });
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const result = await stripeService.handleWebhookEvent(event);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata.type === 'horse_riding_registration') {
        // Update registration
        await horseRidingService.updateRegistration(metadata.registrationId, {
          payment_status: 'succeeded',
          status: 'paid',
          amount_paid: session.amount_total / 100,
          stripe_payment_intent_id: session.payment_intent || null,
          enrolled_at: new Date().toISOString(),
        });
      } else if (metadata.type === 'horse_riding_equipment') {
        // Update equipment purchase
        await horseRidingService.updateEquipmentPurchase(metadata.purchaseId, {
          payment_status: 'succeeded',
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent || null,
          fulfilled_at: new Date().toISOString(),
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error in handleStripeWebhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

