# Environment Variables Configuration

## Required Environment Variables for Production

Update your `.env` file in the `backend` directory with these values:

```env
# Frontend URL (Production)
FRONTEND_URL=https://sportivex.vercel.app

# Stripe Configuration
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here

# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/webhooks
# Create webhook endpoint: https://your-backend-url/api/horse-riding/webhook
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=production
```

## Stripe Webhook Endpoint for Production

When setting up your Stripe webhook in production:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-backend-url/api/horse-riding/webhook`
   - Replace `your-backend-url` with your actual backend deployment URL
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret" and add it to `STRIPE_WEBHOOK_SECRET`

## Important Notes

- **For Production**: Use `sk_live_...` keys (live mode)
- **For Development**: Use `sk_test_...` keys (test mode)
- Never commit your `.env` file to version control
- The `FRONTEND_URL` is used for Stripe redirect URLs after payment

