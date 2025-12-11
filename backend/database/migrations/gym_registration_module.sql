-- Gym Registration Module Database Migration
-- This file contains all table definitions for gym registration and monthly payments

-- 1. Create gym_registrations table (payment required for gym access)
CREATE TABLE IF NOT EXISTS gym_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
  monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 2000.00 CHECK (monthly_fee >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'expired')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Registration expires if not paid within timeframe
  next_payment_date DATE, -- Next monthly payment due date (8th of each month)
  last_payment_date DATE,
  payment_due BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_gym_registration'
  ) THEN
    ALTER TABLE gym_registrations 
    ADD CONSTRAINT unique_user_gym_registration UNIQUE (user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gym_registrations_user ON gym_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_registrations_status ON gym_registrations(status);
CREATE INDEX IF NOT EXISTS idx_gym_registrations_payment_status ON gym_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_gym_registrations_stripe_payment ON gym_registrations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_gym_registrations_next_payment ON gym_registrations(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_gym_registrations_payment_due ON gym_registrations(payment_due);

-- 2. Create gym_monthly_payments table (tracks monthly payment history)
CREATE TABLE IF NOT EXISTS gym_monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES gym_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_month DATE NOT NULL, -- First day of the month being paid for
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
    WHERE conname = 'unique_registration_month'
  ) THEN
    ALTER TABLE gym_monthly_payments 
    ADD CONSTRAINT unique_registration_month UNIQUE (registration_id, payment_month);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gym_monthly_payments_registration ON gym_monthly_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_gym_monthly_payments_user ON gym_monthly_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_monthly_payments_status ON gym_monthly_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_gym_monthly_payments_month ON gym_monthly_payments(payment_month);

-- 3. Create gym_attendance table (for QR code attendance tracking)
CREATE TABLE IF NOT EXISTS gym_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES gym_registrations(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  check_in_method VARCHAR(50) DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'manual', 'app')),
  session_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_date_attendance'
  ) THEN
    ALTER TABLE gym_attendance 
    ADD CONSTRAINT unique_user_date_attendance UNIQUE (user_id, session_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gym_attendance_user ON gym_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_attendance_registration ON gym_attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_gym_attendance_session_date ON gym_attendance(session_date);
CREATE INDEX IF NOT EXISTS idx_gym_attendance_check_in_time ON gym_attendance(check_in_time);

-- 4. Create gym_qr_codes table (for QR code management)
CREATE TABLE IF NOT EXISTS gym_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_value VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_qr_codes_value ON gym_qr_codes(qr_code_value);
CREATE INDEX IF NOT EXISTS idx_gym_qr_codes_active ON gym_qr_codes(is_active);

-- 5. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_gym_registration_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for each table (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS update_gym_registrations_updated_at ON gym_registrations;
CREATE TRIGGER update_gym_registrations_updated_at 
BEFORE UPDATE ON gym_registrations 
FOR EACH ROW 
EXECUTE FUNCTION update_gym_registration_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_monthly_payments_updated_at ON gym_monthly_payments;
CREATE TRIGGER update_gym_monthly_payments_updated_at 
BEFORE UPDATE ON gym_monthly_payments 
FOR EACH ROW 
EXECUTE FUNCTION update_gym_registration_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_attendance_updated_at ON gym_attendance;
CREATE TRIGGER update_gym_attendance_updated_at 
BEFORE UPDATE ON gym_attendance 
FOR EACH ROW 
EXECUTE FUNCTION update_gym_registration_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_qr_codes_updated_at ON gym_qr_codes;
CREATE TRIGGER update_gym_qr_codes_updated_at 
BEFORE UPDATE ON gym_qr_codes 
FOR EACH ROW 
EXECUTE FUNCTION update_gym_registration_updated_at_column();

-- 7. Insert default gym QR code (admin should update this)
INSERT INTO gym_qr_codes (qr_code_value, description, location, is_active)
VALUES ('GYM-ENTRANCE-001', 'Main gym entrance QR code', 'Gym Main Entrance', true)
ON CONFLICT (qr_code_value) DO NOTHING;

