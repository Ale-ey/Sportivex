-- Add monthly payment tracking to horse_riding_registrations table
DO $$ 
BEGIN
  -- Add monthly_fee column (default 2000 PKR)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'horse_riding_registrations' AND column_name = 'monthly_fee'
  ) THEN
    ALTER TABLE horse_riding_registrations ADD COLUMN monthly_fee DECIMAL(10, 2) DEFAULT 2000.00 CHECK (monthly_fee >= 0);
  END IF;

  -- Add next_payment_date column (8th of each month)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'horse_riding_registrations' AND column_name = 'next_payment_date'
  ) THEN
    ALTER TABLE horse_riding_registrations ADD COLUMN next_payment_date DATE;
  END IF;

  -- Add last_payment_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'horse_riding_registrations' AND column_name = 'last_payment_date'
  ) THEN
    ALTER TABLE horse_riding_registrations ADD COLUMN last_payment_date DATE;
  END IF;

  -- Add payment_due column (boolean to track if payment is overdue)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'horse_riding_registrations' AND column_name = 'payment_due'
  ) THEN
    ALTER TABLE horse_riding_registrations ADD COLUMN payment_due BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for payment tracking
CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_next_payment ON horse_riding_registrations(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_payment_due ON horse_riding_registrations(payment_due);

-- Create table for monthly payment history
CREATE TABLE IF NOT EXISTS horse_riding_monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES horse_riding_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_month DATE NOT NULL, -- First day of the month being paid for
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_registration_month UNIQUE (registration_id, payment_month)
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_monthly_payments_registration ON horse_riding_monthly_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_monthly_payments_user ON horse_riding_monthly_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_monthly_payments_status ON horse_riding_monthly_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_horse_riding_monthly_payments_month ON horse_riding_monthly_payments(payment_month);

-- Create trigger for auto-updating updated_at timestamp
CREATE TRIGGER update_horse_riding_monthly_payments_updated_at 
BEFORE UPDATE ON horse_riding_monthly_payments 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

