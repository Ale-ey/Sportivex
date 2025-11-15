-- Swimming Module Database Migration
-- This file contains all table definitions for the swimming module

-- 1. Add gender field to users_metadata table
ALTER TABLE users_metadata 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));

CREATE INDEX IF NOT EXISTS idx_users_metadata_gender ON users_metadata(gender);

-- 2. Create swimming_time_slots table
CREATE TABLE IF NOT EXISTS swimming_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  gender_restriction VARCHAR(20) NOT NULL CHECK (gender_restriction IN ('male', 'female', 'faculty_pg', 'mixed')),
  trainer_id UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_swimming_time_slots_trainer ON swimming_time_slots(trainer_id);
CREATE INDEX IF NOT EXISTS idx_swimming_time_slots_active ON swimming_time_slots(is_active);

-- 3. Create swimming_attendance table
CREATE TABLE IF NOT EXISTS swimming_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES swimming_time_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_in_method VARCHAR(20) DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(time_slot_id, user_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_swimming_attendance_time_slot ON swimming_attendance(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_user ON swimming_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_session_date ON swimming_attendance(session_date);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_date_slot ON swimming_attendance(session_date, time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_attendance_check_in_time ON swimming_attendance(check_in_time);

-- 4. Create swimming_qr_codes table
CREATE TABLE IF NOT EXISTS swimming_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name VARCHAR(255) NOT NULL DEFAULT 'swimming_pool_reception',
  qr_code_value VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swimming_qr_codes_value ON swimming_qr_codes(qr_code_value);
CREATE INDEX IF NOT EXISTS idx_swimming_qr_codes_active ON swimming_qr_codes(is_active);

-- 5. Create swimming_waitlist table
CREATE TABLE IF NOT EXISTS swimming_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES swimming_time_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  position INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(time_slot_id, user_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_time_slot ON swimming_waitlist(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_user ON swimming_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_session_date ON swimming_waitlist(session_date);
CREATE INDEX IF NOT EXISTS idx_swimming_waitlist_status ON swimming_waitlist(status);

-- 6. Create swimming_rules_regulations table
CREATE TABLE IF NOT EXISTS swimming_rules_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swimming_rules_active ON swimming_rules_regulations(is_active);
CREATE INDEX IF NOT EXISTS idx_swimming_rules_order ON swimming_rules_regulations(display_order);

-- 7. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_swimming_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for each table
CREATE TRIGGER update_swimming_time_slots_updated_at BEFORE UPDATE ON swimming_time_slots FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();
CREATE TRIGGER update_swimming_attendance_updated_at BEFORE UPDATE ON swimming_attendance FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();
CREATE TRIGGER update_swimming_qr_codes_updated_at BEFORE UPDATE ON swimming_qr_codes FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();
CREATE TRIGGER update_swimming_waitlist_updated_at BEFORE UPDATE ON swimming_waitlist FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();
CREATE TRIGGER update_swimming_rules_regulations_updated_at BEFORE UPDATE ON swimming_rules_regulations FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();

-- 9. Insert initial QR code for swimming pool reception
INSERT INTO swimming_qr_codes (location_name, qr_code_value, is_active, description)
VALUES (
  'Swimming Pool Reception',
  'SWIMMING-' || gen_random_uuid()::text,
  true,
  'Main QR code at swimming pool reception desk for attendance check-in'
)
ON CONFLICT (qr_code_value) DO NOTHING;

-- 10. Insert sample rules and regulations
INSERT INTO swimming_rules_regulations (title, content, category, display_order, is_active)
VALUES
  ('Pool Hours', 'The swimming pool is open during designated time slots only. Please check the schedule for your specific time slot.', 'general', 1, true),
  ('Capacity Limits', 'Each time slot has a maximum capacity. Once capacity is reached, you will be added to the waitlist.', 'general', 2, true),
  ('Check-in Requirements', 'All swimmers must check in by scanning the QR code at the reception desk before entering the pool area.', 'checkin', 3, true),
  ('Gender-Specific Slots', 'Some time slots are designated for specific genders or faculty/postgraduate students only. Please respect these restrictions.', 'general', 4, true),
  ('Swimming Attire', 'Proper swimming attire is mandatory. No cotton clothing or jeans allowed in the pool.', 'safety', 5, true),
  ('Shower Before Entry', 'All swimmers must take a shower before entering the pool area.', 'hygiene', 6, true),
  ('No Running', 'Running on the pool deck is strictly prohibited to prevent accidents.', 'safety', 7, true),
  ('Supervision', 'Swimmers who cannot swim must stay in the shallow end or use appropriate flotation devices under trainer supervision.', 'safety', 8, true),
  ('Food and Drinks', 'No food or drinks (except water in closed containers) are allowed in the pool area.', 'hygiene', 9, true),
  ('Emergency Procedures', 'In case of emergency, follow the instructions of the lifeguard or trainer on duty immediately.', 'safety', 10, true)
ON CONFLICT DO NOTHING;

-- 11. Enable Row Level Security (RLS) - Optional but recommended
-- Uncomment if you want to use Supabase RLS policies

-- ALTER TABLE swimming_time_slots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE swimming_attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE swimming_qr_codes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE swimming_waitlist ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE swimming_rules_regulations ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed)
-- CREATE POLICY "Allow public read access to time slots" ON swimming_time_slots FOR SELECT USING (is_active = true);
-- CREATE POLICY "Allow authenticated users to read attendance" ON swimming_attendance FOR SELECT USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow users to read their own attendance" ON swimming_attendance FOR SELECT USING (user_id = auth.uid());

