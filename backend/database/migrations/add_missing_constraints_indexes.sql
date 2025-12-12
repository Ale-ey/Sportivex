-- Add Missing Constraints and Indexes
-- This migration adds important constraints and indexes that may be missing from the base schema
-- Safe to run multiple times (idempotent)

-- ==================== SWIMMING ATTENDANCE ====================

-- Add UNIQUE constraint to prevent duplicate check-ins per time slot per day
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'swimming_attendance_time_slot_user_session_unique'
  ) THEN
    ALTER TABLE swimming_attendance 
    ADD CONSTRAINT swimming_attendance_time_slot_user_session_unique 
    UNIQUE(time_slot_id, user_id, session_date);
  END IF;
END $$;

-- Add index on registration_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_registration 
ON swimming_attendance(registration_id);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_date_slot 
ON swimming_attendance(session_date, time_slot_id);

-- ==================== GYM ATTENDANCE ====================

-- Add UNIQUE constraint to prevent duplicate check-ins per day
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_date_attendance'
  ) THEN
    ALTER TABLE gym_attendance 
    ADD CONSTRAINT unique_user_date_attendance 
    UNIQUE(user_id, session_date);
  END IF;
END $$;

-- Ensure index on registration_id exists
CREATE INDEX IF NOT EXISTS idx_gym_attendance_registration 
ON gym_attendance(registration_id);

-- ==================== SWIMMING WAITLIST ====================

-- Add UNIQUE constraint to prevent duplicate waitlist entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'swimming_waitlist_time_slot_user_session_unique'
  ) THEN
    ALTER TABLE swimming_waitlist 
    ADD CONSTRAINT swimming_waitlist_time_slot_user_session_unique 
    UNIQUE(time_slot_id, user_id, session_date);
  END IF;
END $$;

-- ==================== QR CODES ====================

-- Ensure indexes exist on QR code values (for fast lookups during scanning)
CREATE INDEX IF NOT EXISTS idx_swimming_qr_codes_value 
ON swimming_qr_codes(qr_code_value) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_gym_qr_codes_value 
ON gym_qr_codes(qr_code_value) 
WHERE is_active = true;

-- ==================== LEAGUES ====================

-- Ensure check constraints exist (they should be in base schema, but verify)
DO $$ 
BEGIN
  -- Check registration_deadline <= start_date
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_registration_before_start'
  ) THEN
    ALTER TABLE leagues 
    ADD CONSTRAINT check_registration_before_start 
    CHECK (registration_deadline <= start_date);
  END IF;

  -- Check end_date >= start_date
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_end_after_start'
  ) THEN
    ALTER TABLE leagues 
    ADD CONSTRAINT check_end_after_start 
    CHECK (end_date >= start_date);
  END IF;
END $$;

-- ==================== SWIMMING TIME SLOTS ====================

-- Ensure time order constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_time_order'
  ) THEN
    ALTER TABLE swimming_time_slots 
    ADD CONSTRAINT check_time_order 
    CHECK (end_time > start_time);
  END IF;
END $$;

-- ==================== PERFORMANCE INDEXES ====================

-- Additional indexes for common query patterns

-- Swimming registrations - payment due queries
CREATE INDEX IF NOT EXISTS idx_swimming_registrations_payment_due_active 
ON swimming_registrations(payment_due, status) 
WHERE payment_due = true AND status = 'active';

-- Gym registrations - payment due queries
CREATE INDEX IF NOT EXISTS idx_gym_registrations_payment_due_active 
ON gym_registrations(payment_due, status) 
WHERE payment_due = true AND status = 'active';

-- League registrations - payment status
CREATE INDEX IF NOT EXISTS idx_league_registrations_payment_status 
ON league_registrations(payment_status) 
WHERE payment_status = 'succeeded';

-- Swimming monthly payments - active payments
CREATE INDEX IF NOT EXISTS idx_swimming_monthly_payments_active 
ON swimming_monthly_payments(registration_id, payment_status) 
WHERE payment_status = 'succeeded';

-- Gym monthly payments - active payments
CREATE INDEX IF NOT EXISTS idx_gym_monthly_payments_active 
ON gym_monthly_payments(registration_id, payment_status) 
WHERE payment_status = 'succeeded';

-- ==================== VERIFICATION ====================

-- Verify constraints were created
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conname IN (
    'swimming_attendance_time_slot_user_session_unique',
    'unique_user_date_attendance',
    'swimming_waitlist_time_slot_user_session_unique',
    'check_registration_before_start',
    'check_end_after_start',
    'check_time_order'
  );
  
  RAISE NOTICE 'Successfully created/verified % constraints', constraint_count;
END $$;

