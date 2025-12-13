import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY not found in environment variables.');
  console.error('   Please add STRIPE_SECRET_KEY to your .env file');
  console.error('   Get it from: https://dashboard.stripe.com/test/apikeys');
} else if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is invalid!');
  console.error('   Stripe secret keys must start with "sk_test_" (test) or "sk_live_" (production)');
  console.error('   Your key starts with:', stripeSecretKey.substring(0, 10) + '...');
  console.error('   This is NOT a valid Stripe key format.');
  console.error('   Get your key from: https://dashboard.stripe.com/test/apikeys');
  console.error('');
  console.error('   Common mistakes:');
  console.error('   - Using webhook secret (whsec_...) as secret key');
  console.error('   - Using publishable key (pk_...) as secret key');
  console.error('   - Using a key from a different service');
}

const stripe = stripeSecretKey && (stripeSecretKey.startsWith('sk_test_') || stripeSecretKey.startsWith('sk_live_'))
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

if (!stripe) {
  console.error('⚠️  Stripe client not initialized. Payment features will not work.');
}

/**
 * Create a payment intent for registration
 */
export const createRegistrationPaymentIntent = async (amount, userId, registrationId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'pkr',
      metadata: {
        userId,
        registrationId,
        type: 'horse_riding_registration',
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for registration
 */
export const createRegistrationCheckoutSession = async (amount, userId, registrationId, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Horse Riding Registration',
              description: 'Registration fee for horse riding program',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'horse_riding_registration',
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for league registration
 */
export const createLeagueCheckoutSession = async (amount, userId, registrationId, leagueName, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: `League Registration: ${leagueName}`,
              description: `Registration fee for ${leagueName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'league_registration',
        leagueName,
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating league checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for monthly horse riding payment
 */
export const createMonthlyPaymentCheckoutSession = async (amount, userId, registrationId, paymentMonth, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const monthName = new Date(paymentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Horse Riding Monthly Fee',
              description: `Monthly subscription fee for ${monthName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'horse_riding_monthly_payment',
        paymentMonth,
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating monthly payment checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for gym registration
 */
export const createGymRegistrationCheckoutSession = async (amount, userId, registrationId, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Gym Registration',
              description: 'Registration fee for gym access',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'gym_registration',
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating gym registration checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for gym monthly payment
 */
export const createGymMonthlyPaymentCheckoutSession = async (amount, userId, registrationId, paymentMonth, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const monthName = new Date(paymentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Gym Monthly Fee',
              description: `Monthly subscription fee for ${monthName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'gym_monthly_payment',
        paymentMonth,
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating gym monthly payment checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for swimming registration
 */
export const createSwimmingRegistrationCheckoutSession = async (amount, userId, registrationId, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    // Ensure success URL includes session_id parameter for Stripe to append
    const successUrlWithSession = successUrl.includes('?') 
      ? `${successUrl}&session_id={CHECKOUT_SESSION_ID}`
      : `${successUrl}?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Swimming Registration',
              description: 'Registration fee for swimming access',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrlWithSession,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'swimming_registration',
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating swimming registration checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for swimming monthly payment
 */
export const createSwimmingMonthlyPaymentCheckoutSession = async (amount, userId, registrationId, paymentMonth, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const monthName = new Date(paymentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Swimming Monthly Fee',
              description: `Monthly subscription fee for ${monthName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        registrationId,
        type: 'swimming_monthly_payment',
        paymentMonth,
      },
      client_reference_id: registrationId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating swimming monthly payment checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a payment intent for equipment purchase
 */
export const createEquipmentPaymentIntent = async (amount, userId, purchaseId, equipmentName, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'pkr',
      metadata: {
        userId,
        purchaseId,
        type: 'horse_riding_equipment',
        equipmentName,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error creating equipment payment intent:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a checkout session for equipment purchase
 */
export const createEquipmentCheckoutSession = async (amount, userId, purchaseId, equipmentName, quantity, successUrl, cancelUrl) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file with a valid key (sk_test_... or sk_live_...)' };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: equipmentName,
              description: `Horse riding equipment: ${equipmentName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        purchaseId,
        type: 'horse_riding_equipment',
        equipmentName,
      },
      client_reference_id: purchaseId,
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error creating equipment checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify payment intent status
 */
export const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify checkout session status
 */
export const verifyCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return { success: true, session };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get checkout session URL (for redirecting to payment)
 */
export const getCheckoutSessionUrl = async (sessionId) => {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' };
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.url) {
      return { success: true, url: session.url };
    } else {
      // If session is expired, we might need to create a new one
      return { success: false, error: 'Session URL not available. Session may be expired.' };
    }
  } catch (error) {
    console.error('Error getting checkout session URL:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle webhook event
 */
export const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return { success: true, type: 'payment_succeeded', data: event.data.object };
      case 'payment_intent.payment_failed':
        return { success: true, type: 'payment_failed', data: event.data.object };
      case 'checkout.session.completed':
        return { success: true, type: 'checkout_completed', data: event.data.object };
      default:
        return { success: true, type: 'unknown', data: event.data.object };
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { success: false, error: error.message };
  }
};

export { stripe };
export default stripe;

