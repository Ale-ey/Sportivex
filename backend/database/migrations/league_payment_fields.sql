-- Add payment fields to league_registrations table
DO $$ 
BEGIN
  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_registrations' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE league_registrations ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' 
      CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'));
  END IF;

  -- Add stripe_session_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_registrations' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE league_registrations ADD COLUMN stripe_session_id VARCHAR(255) UNIQUE;
  END IF;

  -- Add stripe_payment_intent_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_registrations' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE league_registrations ADD COLUMN stripe_payment_intent_id VARCHAR(255) UNIQUE;
  END IF;

  -- Add amount_paid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_registrations' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE league_registrations ADD COLUMN amount_paid NUMERIC(10, 2) DEFAULT 0.00 CHECK (amount_paid >= 0);
  END IF;

  -- Add paid_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'league_registrations' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE league_registrations ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index for payment_status
CREATE INDEX IF NOT EXISTS idx_league_registrations_payment_status ON league_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_league_registrations_stripe_session ON league_registrations(stripe_session_id);

