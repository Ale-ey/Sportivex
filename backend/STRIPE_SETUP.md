# Stripe Setup Guide

## Required Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
# Stripe Secret Key (REQUIRED for payments)
# Get this from: https://dashboard.stripe.com/test/apikeys
# Format: sk_test_... or sk_live_...
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret (REQUIRED for webhook verification)
# Get this from: https://dashboard.stripe.com/test/webhooks
# After creating a webhook endpoint, click on it to see the "Signing secret"
# Format: whsec_...
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirect URLs after payment)
FRONTEND_URL=http://localhost:5173
```

## How to Get Your Stripe Keys

### 1. Get Secret Key (STRIPE_SECRET_KEY)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" (starts with `sk_test_` for test mode)
3. Add it to `.env` as `STRIPE_SECRET_KEY`

### 2. Get Webhook Secret (STRIPE_WEBHOOK_SECRET)
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `http://your-backend-url/api/horse-riding/webhook`
   - For local testing, use: `http://localhost:3000/api/horse-riding/webhook`
   - You can use a tool like ngrok to expose your local server: `ngrok http 3000`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. After creating, click on the webhook to see the "Signing secret"
6. Copy the signing secret (starts with `whsec_`)
7. Add it to `.env` as `STRIPE_WEBHOOK_SECRET`

## Important Notes

- **Never commit your `.env` file** to version control
- Use **test keys** (`sk_test_` and `whsec_`) during development
- Switch to **live keys** (`sk_live_` and `whsec_`) only in production
- The key starting with `mk_` is NOT a Stripe key - it's likely from a different service

## Testing

After setting up your keys:
1. Restart your backend server
2. Try purchasing equipment
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future expiry date and any 3-digit CVC

