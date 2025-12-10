-- Leagues Module Database Migration
-- This file contains table definitions for the leagues module

-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sport_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE NOT NULL,
  max_participants INTEGER,
  prize VARCHAR(255),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_end_after_start CHECK (end_date >= start_date),
  CONSTRAINT check_registration_before_start CHECK (registration_deadline <= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leagues_status ON leagues(status);
CREATE INDEX IF NOT EXISTS idx_leagues_sport_type ON leagues(sport_type);
CREATE INDEX IF NOT EXISTS idx_leagues_start_date ON leagues(start_date);
CREATE INDEX IF NOT EXISTS idx_leagues_created_by ON leagues(created_by);

-- Create trigger for auto-updating updated_at timestamp
CREATE TRIGGER update_leagues_updated_at 
BEFORE UPDATE ON leagues 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();

-- Add registration_enabled field to leagues table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leagues' AND column_name = 'registration_enabled'
  ) THEN
    ALTER TABLE leagues ADD COLUMN registration_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add registration_fee field to leagues table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leagues' AND column_name = 'registration_fee'
  ) THEN
    ALTER TABLE leagues ADD COLUMN registration_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (registration_fee >= 0);
  END IF;
END $$;

-- Create league_registrations table
CREATE TABLE IF NOT EXISTS league_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'withdrawn')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_league_user_registration UNIQUE (league_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_league_registrations_league_id ON league_registrations(league_id);
CREATE INDEX IF NOT EXISTS idx_league_registrations_user_id ON league_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_league_registrations_status ON league_registrations(status);

-- Create trigger for auto-updating updated_at timestamp for league_registrations
CREATE TRIGGER update_league_registrations_updated_at 
BEFORE UPDATE ON league_registrations 
FOR EACH ROW 
EXECUTE FUNCTION update_badminton_updated_at_column();



