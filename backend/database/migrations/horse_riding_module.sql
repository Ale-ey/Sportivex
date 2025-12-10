-- Horse Riding Module Database Migration
-- This file contains all table definitions for the horse riding module

-- 1. Create horse_riding_time_slots table
CREATE TABLE IF NOT EXISTS horse_riding_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday, NULL = all days
  max_capacity INTEGER NOT NULL DEFAULT 5 CHECK (max_capacity > 0),
  instructor_id UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_time_slots_instructor ON horse_riding_time_slots(instructor_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_time_slots_active ON horse_riding_time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_horse_riding_time_slots_day ON horse_riding_time_slots(day_of_week);

-- 2. Create horse_riding_rules table
CREATE TABLE IF NOT EXISTS horse_riding_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_rules_category ON horse_riding_rules(category);
CREATE INDEX IF NOT EXISTS idx_horse_riding_rules_active ON horse_riding_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_horse_riding_rules_display_order ON horse_riding_rules(display_order);

-- 3. Create horse_riding_equipment table
CREATE TABLE IF NOT EXISTS horse_riding_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_available ON horse_riding_equipment(is_available);
CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_name ON horse_riding_equipment(name);

-- 4. Create horse_riding_registrations table (payment required)
CREATE TABLE IF NOT EXISTS horse_riding_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid >= 0),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'enrolled', 'cancelled', 'expired')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enrolled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Registration expires if not paid within timeframe
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_registration UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_user ON horse_riding_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_status ON horse_riding_registrations(status);
CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_payment_status ON horse_riding_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_horse_riding_registrations_stripe_payment ON horse_riding_registrations(stripe_payment_intent_id);

-- 5. Create horse_riding_enrollments table (after payment, user can enroll in time slots)
CREATE TABLE IF NOT EXISTS horse_riding_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES horse_riding_registrations(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES horse_riding_time_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_enrollment UNIQUE (time_slot_id, user_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_enrollments_registration ON horse_riding_enrollments(registration_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_enrollments_time_slot ON horse_riding_enrollments(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_enrollments_user ON horse_riding_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_enrollments_session_date ON horse_riding_enrollments(session_date);
CREATE INDEX IF NOT EXISTS idx_horse_riding_enrollments_status ON horse_riding_enrollments(status);

-- 6. Create horse_riding_equipment_purchases table
CREATE TABLE IF NOT EXISTS horse_riding_equipment_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES horse_riding_equipment(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_purchases_user ON horse_riding_equipment_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_purchases_equipment ON horse_riding_equipment_purchases(equipment_id);
CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_purchases_payment_status ON horse_riding_equipment_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_horse_riding_equipment_purchases_status ON horse_riding_equipment_purchases(status);

-- Create triggers for auto-updating updated_at timestamp
CREATE TRIGGER update_horse_riding_time_slots_updated_at 
BEFORE UPDATE ON horse_riding_time_slots 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

CREATE TRIGGER update_horse_riding_rules_updated_at 
BEFORE UPDATE ON horse_riding_rules 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

CREATE TRIGGER update_horse_riding_equipment_updated_at 
BEFORE UPDATE ON horse_riding_equipment 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

CREATE TRIGGER update_horse_riding_registrations_updated_at 
BEFORE UPDATE ON horse_riding_registrations 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

CREATE TRIGGER update_horse_riding_enrollments_updated_at 
BEFORE UPDATE ON horse_riding_enrollments 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

CREATE TRIGGER update_horse_riding_equipment_purchases_updated_at 
BEFORE UPDATE ON horse_riding_equipment_purchases 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

