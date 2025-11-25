-- Update Swimming Module Schema
-- Run this to add missing constraints, indexes, and triggers

-- 1. Add UNIQUE constraint to swimming_attendance (prevents duplicate check-ins)
-- This ensures a user can only check in once per time slot per day
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

-- 2. Add UNIQUE constraint to swimming_waitlist (prevents duplicate waitlist entries)
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

-- 3. Add check_time_order constraint to swimming_time_slots (ensures end_time > start_time)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_time_order'
  ) THEN
    ALTER TABLE swimming_time_slots 
    ADD CONSTRAINT check_time_order CHECK (end_time > start_time);
  END IF;
END $$;

-- 4. Add missing indexes for better query performance

-- Indexes for swimming_attendance
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_time_slot ON swimming_attendance(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_user ON swimming_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_session_date ON swimming_attendance(session_date);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_date_slot ON swimming_attendance(session_date, time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_check_in_time ON swimming_attendance(check_in_time);

-- Indexes for swimming_waitlist
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_time_slot ON swimming_waitlist(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_user ON swimming_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_session_date ON swimming_waitlist(session_date);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_status ON swimming_waitlist(status);

-- Indexes for swimming_time_slots
CREATE INDEX IF NOT EXISTS idx_swimming_time_slots_trainer ON swimming_time_slots(trainer_id);
CREATE INDEX IF NOT EXISTS idx_swimming_time_slots_active ON swimming_time_slots(is_active);

-- Indexes for swimming_qr_codes
CREATE INDEX IF NOT EXISTS idx_swimming_qr_codes_value ON swimming_qr_codes(qr_code_value);
CREATE INDEX IF NOT EXISTS idx_swimming_qr_codes_active ON swimming_qr_codes(is_active);

-- Indexes for swimming_rules_regulations
CREATE INDEX IF NOT EXISTS idx_swimming_rules_active ON swimming_rules_regulations(is_active);
CREATE INDEX IF NOT EXISTS idx_swimming_rules_order ON swimming_rules_regulations(display_order);

-- Index for users_metadata gender (for filtering)
CREATE INDEX IF NOT EXISTS idx_users_metadata_gender ON users_metadata(gender);

-- 5. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_swimming_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for each table (only if they don't exist)
DO $$ 
BEGIN
  -- swimming_time_slots trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_swimming_time_slots_updated_at'
  ) THEN
    CREATE TRIGGER update_swimming_time_slots_updated_at 
    BEFORE UPDATE ON swimming_time_slots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swimming_updated_at_column();
  END IF;

  -- swimming_attendance trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_swimming_attendance_updated_at'
  ) THEN
    CREATE TRIGGER update_swimming_attendance_updated_at 
    BEFORE UPDATE ON swimming_attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swimming_updated_at_column();
  END IF;

  -- swimming_qr_codes trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_swimming_qr_codes_updated_at'
  ) THEN
    CREATE TRIGGER update_swimming_qr_codes_updated_at 
    BEFORE UPDATE ON swimming_qr_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swimming_updated_at_column();
  END IF;

  -- swimming_waitlist trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_swimming_waitlist_updated_at'
  ) THEN
    CREATE TRIGGER update_swimming_waitlist_updated_at 
    BEFORE UPDATE ON swimming_waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swimming_updated_at_column();
  END IF;

  -- swimming_rules_regulations trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_swimming_rules_regulations_updated_at'
  ) THEN
    CREATE TRIGGER update_swimming_rules_regulations_updated_at 
    BEFORE UPDATE ON swimming_rules_regulations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_swimming_updated_at_column();
  END IF;
END $$;

-- 7. Verify gender field exists in users_metadata (add if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_metadata' AND column_name = 'gender'
  ) THEN
    ALTER TABLE users_metadata 
    ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
    
    CREATE INDEX IF NOT EXISTS idx_users_metadata_gender ON users_metadata(gender);
  END IF;
END $$;

-- Summary message
DO $$ 
BEGIN
  RAISE NOTICE 'Schema update completed. Check the following:';
  RAISE NOTICE '1. UNIQUE constraints on swimming_attendance and swimming_waitlist';
  RAISE NOTICE '2. check_time_order constraint on swimming_time_slots';
  RAISE NOTICE '3. All indexes created';
  RAISE NOTICE '4. Triggers for updated_at columns';
  RAISE NOTICE '5. Gender field in users_metadata';
END $$;

