# How to Fix Stripe API Key Error

## Current Error
```
Invalid API Key provided: mk_1Scti...
```

## The Problem
The key starting with `mk_` is **NOT a Stripe key**. Stripe keys have specific formats:
- ✅ Secret Key: `sk_test_...` or `sk_live_...`
- ✅ Publishable Key: `pk_test_...` or `pk_live_...`
- ✅ Webhook Secret: `whsec_...`

## Solution

### Step 1: Get Your Stripe Secret Key

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
2. **Copy the "Secret key"** (it should start with `sk_test_` for test mode)
3. **For Production**: Use https://dashboard.stripe.com/apikeys and get `sk_live_...`

### Step 2: Update Your `.env` File

Open `backend/.env` and update:

```env
# ❌ WRONG - This is not a Stripe key
# STRIPE_SECRET_KEY=mk_1Sctid3FQOA6HU0n21TAzdnm

# ✅ CORRECT - Replace with your actual Stripe secret key
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# Webhook secret (different from secret key!)
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnop

# Frontend URL
FRONTEND_URL=https://sportivex.vercel.app
```

### Step 3: Restart Your Server

After updating `.env`, restart your backend server:
```bash
# Stop the server (Ctrl+C)
# Then start it again
npm run dev
```

## How to Verify

After restarting, check your server logs. You should see:
- ✅ No error messages about invalid keys
- ✅ If there's an error, it will clearly tell you what's wrong

## Common Mistakes

1. **Using webhook secret as secret key**: 
   - ❌ `STRIPE_SECRET_KEY=whsec_...` (WRONG)
   - ✅ `STRIPE_SECRET_KEY=sk_test_...` (CORRECT)

2. **Using publishable key as secret key**:
   - ❌ `STRIPE_SECRET_KEY=pk_test_...` (WRONG)
   - ✅ `STRIPE_SECRET_KEY=sk_test_...` (CORRECT)

3. **Using a key from a different service**:
   - ❌ `STRIPE_SECRET_KEY=mk_...` (This is NOT Stripe)
   - ✅ `STRIPE_SECRET_KEY=sk_test_...` (CORRECT)

## Test Your Setup

After fixing, try purchasing equipment again. The error should be gone!

