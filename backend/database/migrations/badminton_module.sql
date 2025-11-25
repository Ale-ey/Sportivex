-- Badminton Module Database Migration
-- This file contains all table definitions for the badminton module

-- 1. Create badminton_courts table (2 courts)
CREATE TABLE IF NOT EXISTS badminton_courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_number INTEGER NOT NULL UNIQUE CHECK (court_number > 0),
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badminton_courts_status ON badminton_courts(status);
CREATE INDEX IF NOT EXISTS idx_badminton_courts_number ON badminton_courts(court_number);

-- 2. Create badminton_availability table (users setting themselves available)
CREATE TABLE IF NOT EXISTS badminton_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_badminton_availability_user ON badminton_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_badminton_availability_status ON badminton_availability(is_available);

-- 3. Create badminton_matches table
CREATE TABLE IF NOT EXISTS badminton_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES badminton_courts(id) ON DELETE RESTRICT,
  team1_player1_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  team1_player2_id UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  team2_player1_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  team2_player2_id UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  match_mode VARCHAR(10) NOT NULL CHECK (match_mode IN ('1v1', '2v2')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_end_after_start CHECK (scheduled_end_time > scheduled_start_time)
);

CREATE INDEX IF NOT EXISTS idx_badminton_matches_court ON badminton_matches(court_id);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_status ON badminton_matches(status);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_start_time ON badminton_matches(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_end_time ON badminton_matches(scheduled_end_time);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_team1_p1 ON badminton_matches(team1_player1_id);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_team1_p2 ON badminton_matches(team1_player2_id);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_team2_p1 ON badminton_matches(team2_player1_id);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_team2_p2 ON badminton_matches(team2_player2_id);
CREATE INDEX IF NOT EXISTS idx_badminton_matches_created_by ON badminton_matches(created_by);

-- 4. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_badminton_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create triggers for each table
CREATE TRIGGER update_badminton_courts_updated_at BEFORE UPDATE ON badminton_courts FOR EACH ROW EXECUTE FUNCTION update_badminton_updated_at_column();
CREATE TRIGGER update_badminton_availability_updated_at BEFORE UPDATE ON badminton_availability FOR EACH ROW EXECUTE FUNCTION update_badminton_updated_at_column();
CREATE TRIGGER update_badminton_matches_updated_at BEFORE UPDATE ON badminton_matches FOR EACH ROW EXECUTE FUNCTION update_badminton_updated_at_column();

-- 6. Insert initial courts (2 courts)
INSERT INTO badminton_courts (court_number, name, status)
VALUES
  (1, 'Court 1', 'available'),
  (2, 'Court 2', 'available')
ON CONFLICT (court_number) DO NOTHING;

-- 7. Create function to check court availability
CREATE OR REPLACE FUNCTION check_court_availability(
  p_court_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
  conflicting_matches INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflicting_matches
  FROM badminton_matches
  WHERE court_id = p_court_id
    AND status IN ('scheduled', 'in_progress')
    AND (
      (scheduled_start_time < p_end_time AND scheduled_end_time > p_start_time)
    );
  
  RETURN conflicting_matches = 0;
END;
$$ LANGUAGE plpgsql;

