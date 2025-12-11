-- Swimming Registration Module Database Migration
-- This file contains all table definitions for swimming registration and monthly payments

-- 1. Create swimming_registrations table (payment required for swimming access)
CREATE TABLE IF NOT EXISTS swimming_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
  monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 1500.00 CHECK (monthly_fee >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'expired')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  next_payment_date DATE,
  last_payment_date DATE,
  payment_due BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_swimming_registration UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_swimming_registrations_user ON swimming_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_status ON swimming_registrations(status);
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_payment_status ON swimming_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_stripe_payment ON swimming_registrations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_next_payment ON swimming_registrations(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_payment_due ON swimming_registrations(payment_due);

-- 2. Create swimming_monthly_payments table (tracks monthly payment history)
CREATE TABLE IF NOT EXISTS swimming_monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES swimming_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_month DATE NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_swimming_registration_month'
  ) THEN
    ALTER TABLE swimming_monthly_payments 
    ADD CONSTRAINT unique_swimming_registration_month UNIQUE (registration_id, payment_month);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_swimming_monthly_payments_registration ON swimming_monthly_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_swimming_monthly_payments_user ON swimming_monthly_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_monthly_payments_status ON swimming_monthly_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_swimming_monthly_payments_month ON swimming_monthly_payments(payment_month);

-- 3. Add registration_id to swimming_attendance table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'swimming_attendance' AND column_name = 'registration_id'
  ) THEN
    ALTER TABLE swimming_attendance 
    ADD COLUMN registration_id UUID REFERENCES swimming_registrations(id) ON DELETE CASCADE;
    
    -- Update existing records (set to NULL for now, will be set when user registers)
    UPDATE swimming_attendance SET registration_id = NULL WHERE registration_id IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_swimming_attendance_registration ON swimming_attendance(registration_id);

-- 4. Add type field to gym_qr_codes and swimming_qr_codes to identify QR code type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gym_qr_codes' AND column_name = 'qr_type'
  ) THEN
    ALTER TABLE gym_qr_codes 
    ADD COLUMN qr_type VARCHAR(50) DEFAULT 'gym' CHECK (qr_type IN ('gym'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'swimming_qr_codes' AND column_name = 'qr_type'
  ) THEN
    ALTER TABLE swimming_qr_codes 
    ADD COLUMN qr_type VARCHAR(50) DEFAULT 'swimming' CHECK (qr_type IN ('swimming'));
  END IF;
END $$;

-- 5. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_swimming_registration_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for each table
DROP TRIGGER IF EXISTS update_swimming_registrations_updated_at ON swimming_registrations;
CREATE TRIGGER update_swimming_registrations_updated_at 
BEFORE UPDATE ON swimming_registrations 
FOR EACH ROW 
EXECUTE FUNCTION update_swimming_registration_updated_at_column();

DROP TRIGGER IF EXISTS update_swimming_monthly_payments_updated_at ON swimming_monthly_payments;
CREATE TRIGGER update_swimming_monthly_payments_updated_at 
BEFORE UPDATE ON swimming_monthly_payments 
FOR EACH ROW 
EXECUTE FUNCTION update_swimming_registration_updated_at_column();

