import { supabaseAdmin as supabase } from '../config/supabase.js';
import {
  getExercises,
  getExerciseById,
  getUserWeight,
  createWorkout,
  saveWorkout,
  getUserProgress,
  getUserWorkoutHistory,
  getActiveWorkout,
  getUserGoals,
  saveUserGoal,
  getUserStats,
  getUserGymRegistration,
  checkGymRegistrationStatus,
  createGymRegistration,
  updateGymRegistration,
  createGymMonthlyPayment,
  updateGymMonthlyPayment,
  getUserGymMonthlyPayments,
  processGymQRScan,
  getUserGymAttendance,
  getAllGymAttendanceToday
} from '../services/gymService.js';
import * as stripeService from '../services/stripeService.js';

/**
 * Get all exercises with optional filters
 */
export const getExercisesController = async (req, res) => {
  try {
    const { bodyPart, equipment, difficulty, search, isActive } = req.query;

    const filters = {};
    if (bodyPart) filters.bodyPart = bodyPart;
    if (equipment) filters.equipment = equipment;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const result = await getExercises(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exercises',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        exercises: result.exercises,
        count: result.exercises.length
      }
    });
  } catch (error) {
    console.error('Error in getExercisesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getExerciseById(id);

    if (!result.success || !result.exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        exercise: result.exercise
      }
    });
  } catch (error) {
    console.error('Error in getExerciseByIdController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Start a new workout session
 */
export const startWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has an active workout
    const activeResult = await getActiveWorkout(userId);
    if (activeResult.success && activeResult.workout) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active workout. Please finish it first.'
      });
    }

    const result = await createWorkout(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start workout',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Workout started successfully',
      data: {
        workout: result.workout
      }
    });
  } catch (error) {
    console.error('Error in startWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Save workout with exercises
 */
export const saveWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutId, exercises } = req.body;

    if (!workoutId || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Workout ID and exercises array are required'
      });
    }

    // Get user weight for calorie calculation
    const weightResult = await getUserWeight(userId);
    const userWeight = weightResult.weight;

    const result = await saveWorkout(userId, {
      workoutId,
      exercises,
      userWeight
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to save workout'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout saved successfully',
      data: {
        workout: result.workout,
        totalCalories: result.totalCalories,
        totalExercises: result.totalExercises,
        exerciseLogs: result.exerciseLogs
      }
    });
  } catch (error) {
    console.error('Error in saveWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's workout progress
 */
export const getProgressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    const result = await getUserProgress(userId, period);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch progress',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        progress: result.progress,
        period,
        count: result.progress.length
      }
    });
  } catch (error) {
    console.error('Error in getProgressController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's workout history
 */
export const getWorkoutHistoryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const result = await getUserWorkoutHistory(userId, parseInt(limit, 10));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch workout history',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        workouts: result.workouts,
        count: result.workouts.length
      }
    });
  } catch (error) {
    console.error('Error in getWorkoutHistoryController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's active workout
 */
export const getActiveWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getActiveWorkout(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch active workout',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        workout: result.workout
      }
    });
  } catch (error) {
    console.error('Error in getActiveWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Finish/abandon active workout
 */
export const finishWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutId, status = 'completed' } = req.body;

    if (!workoutId) {
      return res.status(400).json({
        success: false,
        message: 'Workout ID is required'
      });
    }

    // Verify workout belongs to user
    const { data: workout, error: workoutError } = await supabase
      .from('user_workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (workoutError || !workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const endTime = new Date();
    const startTime = new Date(workout.start_time);
    const totalDurationMinutes = Math.round((endTime - startTime) / 60000);

    const { data: updatedWorkout, error: updateError } = await supabase
      .from('user_workouts')
      .update({
        end_time: endTime.toISOString(),
        status: status === 'abandoned' ? 'abandoned' : 'completed',
        total_duration_minutes: totalDurationMinutes
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workout:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to finish workout'
      });
    }

    res.status(200).json({
      success: true,
      message: `Workout ${status === 'abandoned' ? 'abandoned' : 'completed'} successfully`,
      data: {
        workout: updatedWorkout
      }
    });
  } catch (error) {
    console.error('Error in finishWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user goals
 */
export const getGoalsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserGoals(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch goals',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        goals: result.goals,
        count: result.goals.length
      }
    });
  } catch (error) {
    console.error('Error in getGoalsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create or update user goal
 */
export const saveGoalController = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalData = req.body;

    // Validate required fields
    if (!goalData.goal_type || goalData.target_value === undefined || goalData.target_value === null || !goalData.start_date) {
      return res.status(400).json({
        success: false,
        message: 'Goal type, target value, and start date are required',
        received: {
          goal_type: goalData.goal_type,
          target_value: goalData.target_value,
          start_date: goalData.start_date
        }
      });
    }

    // Validate goal_type is in allowed values
    const allowedGoalTypes = ['calories_per_day', 'calories_per_week', 'workouts_per_week', 'weight_loss', 'muscle_gain', 'endurance', 'strength', 'custom'];
    if (!allowedGoalTypes.includes(goalData.goal_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid goal_type. Must be one of: ${allowedGoalTypes.join(', ')}`
      });
    }

    const result = await saveUserGoal(userId, goalData);

    if (!result.success) {
      console.error('Failed to save goal:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save goal',
        error: result.error
      });
    }

    res.status(goalData.id ? 200 : 201).json({
      success: true,
      message: goalData.id ? 'Goal updated successfully' : 'Goal created successfully',
      data: {
        goal: result.goal
      }
    });
  } catch (error) {
    console.error('Error in saveGoalController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 */
export const getStatsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserStats(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: result.stats
      }
    });
  } catch (error) {
    console.error('Error in getStatsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== GYM REGISTRATION ====================

/**
 * Get user's gym registration
 */
export const getGymRegistrationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserGymRegistration(userId);

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
    console.error('Error in getGymRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Check gym registration status
 */
export const checkGymRegistrationStatusController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkGymRegistrationStatus(userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in checkGymRegistrationStatusController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create gym registration (initiate payment)
 */
export const createGymRegistrationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { registration_fee } = req.body;

    // Default registration fee is 2000 PKR (can be overridden)
    const fee = registration_fee !== undefined ? registration_fee : 2000;

    // Check if user already has a registration
    const existing = await getUserGymRegistration(userId);
    if (existing.success && existing.registration) {
      return res.status(400).json({
        success: false,
        message: 'User already has a gym registration'
      });
    }

    // Create registration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const registrationResult = await createGymRegistration({
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

    // If fee is 0, mark as active immediately
    if (fee === 0) {
      const updateResult = await updateGymRegistration(registrationResult.registration.id, {
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

    // Create Stripe checkout session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/gym?payment=success&registrationId=${registrationResult.registration.id}`;
    const cancelUrl = `${baseUrl}/dashboard/gym?payment=cancelled`;

    const stripeResult = await stripeService.createGymRegistrationCheckoutSession(
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

    // Update registration with Stripe session ID
    await updateGymRegistration(registrationResult.registration.id, {
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
    console.error('Error in createGymRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify payment and update registration
 */
export const verifyGymRegistrationPaymentController = async (req, res) => {
  try {
    const { registrationId, sessionId } = req.body;
    const userId = req.user.id;

    if (!registrationId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId and sessionId are required'
      });
    }

    // Get registration
    const { data: registration, error: regError } = await supabase
      .from('gym_registrations')
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

    // Verify Stripe session
    const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      console.error('Stripe session verification failed:', stripeResult.error);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment session',
        error: stripeResult.error
      });
    }

    const session = stripeResult.session;
    console.log('Gym Registration Payment - Stripe session details:', {
      sessionId: session.id,
      status: session.status,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      mode: session.mode,
      amount_total: session.amount_total
    });

    // Check if payment is complete
    // Stripe checkout sessions use status='complete' and payment_status='paid'
    const isPaymentComplete = session.status === 'complete' && 
                             (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

    console.log('Gym Registration Payment - Payment complete check:', { 
      isPaymentComplete, 
      sessionStatus: session.status, 
      paymentStatus: session.payment_status 
    });

    if (isPaymentComplete) {
      const updateResult = await updateGymRegistration(registrationId, {
        payment_status: 'succeeded',
        status: 'active',
        amount_paid: registration.registration_fee,
        stripe_payment_intent_id: session.payment_intent || null,
        activated_at: new Date().toISOString(),
      });

      console.log('Gym Registration Payment - Registration updated successfully:', updateResult.registration?.id);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          registration: updateResult.registration
        }
      });
    }

    console.warn('Gym Registration Payment - Payment not completed:', {
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      sessionId: session.id
    });

    res.status(200).json({
      success: false,
      message: `Payment not completed. Session status: ${session.status}, Payment status: ${session.payment_status}`,
      data: {
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
        sessionId: session.id
      }
    });
  } catch (error) {
    console.error('Error in verifyGymRegistrationPaymentController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create monthly payment (initiate payment for monthly fee)
 */
export const createGymMonthlyPaymentController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'registrationId is required'
      });
    }

    // Get registration
    const registrationResult = await getUserGymRegistration(userId);
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

    // Calculate payment month (current month)
    const now = new Date();
    const paymentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check if payment already exists for this month
    const { data: existingPayment } = await supabase
      .from('gym_monthly_payments')
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

    // Create or update monthly payment record
    let monthlyPayment;
    if (existingPayment) {
      monthlyPayment = existingPayment;
    } else {
      const paymentResult = await createGymMonthlyPayment({
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

    // Create Stripe checkout session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${baseUrl}/dashboard/gym?payment=success&paymentId=${monthlyPayment.id}`;
    const cancelUrl = `${baseUrl}/dashboard/gym?payment=cancelled`;

    const stripeResult = await stripeService.createGymMonthlyPaymentCheckoutSession(
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

    // Update monthly payment with Stripe session ID
    await updateGymMonthlyPayment(monthlyPayment.id, {
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
    console.error('Error in createGymMonthlyPaymentController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify monthly payment
 */
export const verifyGymMonthlyPaymentController = async (req, res) => {
  try {
    const { paymentId, sessionId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId and sessionId are required'
      });
    }

    // Get monthly payment
    const { data: payment, error: paymentError } = await supabase
      .from('gym_monthly_payments')
      .select('*, registration:gym_registrations(*)')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
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

    // Check if payment is complete
    // Stripe checkout sessions use status='complete' and payment_status='paid'
    const isPaymentComplete = session.status === 'complete' && 
                             (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

    if (isPaymentComplete) {
      await updateGymMonthlyPayment(paymentId, {
        payment_status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent || null,
        paid_at: new Date().toISOString(),
      });

      // Update registration: set next payment date, clear payment_due, update last_payment_date
      const nextPaymentDate = new Date(payment.payment_month);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      nextPaymentDate.setDate(8); // 8th of next month

      await updateGymRegistration(payment.registration_id, {
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
    console.error('Error in verifyGymMonthlyPaymentController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get monthly payment history
 */
export const getGymMonthlyPaymentsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 12 } = req.query;

    const result = await getUserGymMonthlyPayments(userId, parseInt(limit, 10));

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
    console.error('Error in getGymMonthlyPaymentsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Process gym QR code scan for attendance
 */
export const processGymQRScanController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { qrCodeValue } = req.body;

    if (!qrCodeValue) {
      return res.status(400).json({
        success: false,
        message: 'QR code value is required'
      });
    }

    const result = await processGymQRScan(qrCodeValue, req.user);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        requiresPayment: result.requiresPayment || false
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        attendance: result.attendance
      }
    });
  } catch (error) {
    console.error('Error in processGymQRScanController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get gym attendance history
 */
export const getGymAttendanceController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const result = await getUserGymAttendance(userId, parseInt(limit, 10));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attendance: result.attendance,
        count: result.attendance.length
      }
    });
  } catch (error) {
    console.error('Error in getGymAttendanceController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all gym attendance for today (admin only)
 */
export const getAllGymAttendanceTodayController = async (req, res) => {
  try {
    const { limit = 100, showAll = false } = req.query;
    const showAllBool = showAll === 'true' || showAll === true;
    
    const result = await getAllGymAttendanceToday(parseInt(limit, 10), showAllBool);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch gym attendance',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attendance: result.attendance,
        count: result.attendance.length
      }
    });
  } catch (error) {
    console.error('Error in getAllGymAttendanceTodayController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==================== GYM QR CODES ====================

/**
 * Get all gym QR codes (admin only)
 */
export const getGymQRCodesController = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gym_qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gym QR codes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch gym QR codes'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qrCodes: data || [],
        count: data?.length || 0
      }
    });
  } catch (error) {
    console.error('Error in getGymQRCodesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new gym QR code (admin only)
 */
export const createGymQRCodeController = async (req, res) => {
  try {
    const { description, location } = req.body;
    const userId = req.user.id;

    // Validate location name for gym QR codes
    if (location && location.toLowerCase().includes('swimming')) {
      console.warn('Warning: Gym QR code created with location containing "swimming":', location);
    }

    // Generate unique QR code value
    const qrCodeValue = `GYM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log('Creating GYM QR code:', { location, description, qrCodeValue });

    const { data, error } = await supabase
      .from('gym_qr_codes')
      .insert([
        {
          qr_code_value: qrCodeValue,
          description: description || null,
          location: location || null,
          is_active: true,
          created_by: userId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating gym QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create gym QR code'
      });
    }

    console.log('Gym QR code created successfully. This QR code will route to gym attendance.');
    res.status(201).json({
      success: true,
      message: 'Gym QR code created successfully. This QR code will scan for gym attendance.',
      data: {
        qrCode: data
      }
    });
  } catch (error) {
    console.error('Error in createGymQRCodeController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update gym QR code (admin only)
 */
export const updateGymQRCodeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, location, isActive } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('gym_qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gym QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update gym QR code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gym QR code updated successfully',
      data: {
        qrCode: data
      }
    });
  } catch (error) {
    console.error('Error in updateGymQRCodeController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete gym QR code (admin only)
 */
export const deleteGymQRCodeController = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('gym_qr_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting gym QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete gym QR code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gym QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteGymQRCodeController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  getExercisesController,
  getExerciseByIdController,
  startWorkoutController,
  saveWorkoutController,
  getProgressController,
  getWorkoutHistoryController,
  getActiveWorkoutController,
  finishWorkoutController,
  getGoalsController,
  saveGoalController,
  getStatsController,
  getGymRegistrationController,
  checkGymRegistrationStatusController,
  createGymRegistrationController,
  verifyGymRegistrationPaymentController,
  createGymMonthlyPaymentController,
  verifyGymMonthlyPaymentController,
  getGymMonthlyPaymentsController,
  processGymQRScanController,
  getGymAttendanceController,
  getAllGymAttendanceTodayController,
  getGymQRCodesController,
  createGymQRCodeController,
  updateGymQRCodeController,
  deleteGymQRCodeController
};

