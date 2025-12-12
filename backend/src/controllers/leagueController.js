import {
  getLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague,
  toggleLeagueRegistration,
  registerUserForLeague,
  getLeagueRegistrations,
  getUserLeagueRegistration,
  cancelLeagueRegistration,
  updateLeagueRegistrationPayment,
  getLeagueRegistrationById,
} from '../services/leagueService.js';
import { createLeagueCheckoutSession, verifyCheckoutSession } from '../services/stripeService.js';

/**
 * Get all leagues
 */
export const getLeaguesController = async (req, res) => {
  try {
    const result = await getLeagues();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leagues',
        details: result.error?.includes('does not exist') ? 'Database table not found. Please run the migration.' : undefined
      });
    }

    res.json({
      success: true,
      data: {
        leagues: result.leagues,
        count: result.leagues.length
      }
    });
  } catch (error) {
    console.error('Error in getLeaguesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get league by ID
 */
export const getLeagueByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getLeagueById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'League not found'
      });
    }

    res.json({
      success: true,
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in getLeagueByIdController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create league (admin only)
 */
export const createLeagueController = async (req, res) => {
  try {
    const user = req.user;
    const { name, description, sport_type, start_date, end_date, registration_deadline, max_participants, prize, registration_fee, status } = req.body;

    // Validation
    if (!name || !sport_type || !start_date || !end_date || !registration_deadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sport_type, start_date, end_date, registration_deadline'
      });
    }

    // Date validation
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const registrationDeadline = new Date(registration_deadline);

    // Check if registration_deadline is before or equal to start_date
    if (registrationDeadline > startDate) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline must be before or equal to the start date'
      });
    }

    // Check if end_date is after or equal to start_date
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or equal to the start date'
      });
    }

    const result = await createLeague(
      {
        name,
        description,
        sport_type,
        start_date,
        end_date,
        registration_deadline,
        max_participants,
        prize,
        registration_fee,
        status,
      },
      user.id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create league'
      });
    }

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in createLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update league (admin only)
 */
export const updateLeagueController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sport_type, start_date, end_date, registration_deadline, max_participants, prize, registration_fee, status } = req.body;

    const result = await updateLeague(id, {
      name,
      description,
      sport_type,
      start_date,
      end_date,
      registration_deadline,
      max_participants,
      prize,
      registration_fee,
      status,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update league'
      });
    }

    res.json({
      success: true,
      message: 'League updated successfully',
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in updateLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete league (admin only)
 */
export const deleteLeagueController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteLeague(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete league'
      });
    }

    res.json({
      success: true,
      message: 'League deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Toggle registration enabled/disabled for a league (admin only)
 */
export const toggleLeagueRegistrationController = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be a boolean value'
      });
    }

    const result = await toggleLeagueRegistration(id, enabled);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to toggle registration'
      });
    }

    res.json({
      success: true,
      message: `Registration ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in toggleLeagueRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Register user for a league
 */
export const registerForLeagueController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await registerUserForLeague(id, user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to register for league'
      });
    }

    // If payment is required, create Stripe checkout session
    if (result.requiresPayment && result.fee > 0) {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const successUrl = `${baseUrl}/dashboard/leagues?payment=success&registrationId=${result.registration.id}`;
      const cancelUrl = `${baseUrl}/dashboard/leagues?payment=cancelled`;

      // Get league name for checkout session
      const leagueResult = await getLeagueById(id);
      const leagueName = leagueResult.league?.name || 'League';

      const stripeResult = await createLeagueCheckoutSession(
        result.fee,
        user.id,
        result.registration.id,
        leagueName,
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
      await updateLeagueRegistrationPayment(result.registration.id, {
        stripe_session_id: stripeResult.session.id,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration created. Please complete payment.',
        data: {
          registration: result.registration,
          requiresPayment: true,
          checkoutUrl: stripeResult.session.url,
          sessionId: stripeResult.session.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for league',
      data: {
        registration: result.registration,
        requiresPayment: false
      }
    });
  } catch (error) {
    console.error('Error in registerForLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all registrations for a league (admin only)
 */
export const getLeagueRegistrationsController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getLeagueRegistrations(id);

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
    console.error('Error in getLeagueRegistrationsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's registration status for a league
 */
export const getUserLeagueRegistrationController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await getUserLeagueRegistration(id, user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch registration status'
      });
    }

    res.json({
      success: true,
      data: {
        registration: result.registration
      }
    });
  } catch (error) {
    console.error('Error in getUserLeagueRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify league registration payment
 */
export const verifyLeaguePaymentController = async (req, res) => {
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
    const registrationResult = await getLeagueRegistrationById(registrationId);
    if (!registrationResult.success || !registrationResult.registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrationResult.registration;

    // Verify user owns this registration
    if (registration.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Verify Stripe session
    const stripeResult = await verifyCheckoutSession(sessionId);
    if (!stripeResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment session',
        error: stripeResult.error
      });
    }

    const session = stripeResult.session;

    // Update registration based on payment status
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const league = registration.league || {};
      const fee = league.registration_fee || 0;

      const updateResult = await updateLeagueRegistrationPayment(registrationId, {
        payment_status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent || null,
        amount_paid: fee,
        paid_at: new Date().toISOString(),
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
    console.error('Error in verifyLeaguePaymentController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Cancel user's registration for a league
 */
export const cancelLeagueRegistrationController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await cancelLeagueRegistration(id, user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to cancel registration'
      });
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error in cancelLeagueRegistrationController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



