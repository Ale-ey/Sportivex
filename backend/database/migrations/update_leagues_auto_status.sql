-- Auto-update League Status Based on Dates
-- This migration creates a function that automatically updates league statuses
-- based on start_date, end_date, and registration_deadline
-- 
-- SAFE TO RUN: This migration only creates functions and triggers, it does NOT modify existing data
-- It uses CREATE OR REPLACE and DROP IF EXISTS to safely update existing objects

-- Function to calculate and update league status
-- This function can be called manually or scheduled to update all league statuses
CREATE OR REPLACE FUNCTION update_league_status()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  league_record RECORD;
  today_date DATE;
  calculated_status VARCHAR(20);
BEGIN
  today_date := CURRENT_DATE;
  
  -- Loop through all non-cancelled leagues
  FOR league_record IN 
    SELECT id, start_date, end_date, registration_deadline, registration_enabled, status
    FROM leagues
    WHERE status != 'cancelled'
  LOOP
    calculated_status := league_record.status; -- Default to current status
    
    -- If start date is in the future
    IF league_record.start_date > today_date THEN
      -- Check if registration is open
      IF league_record.registration_enabled = true 
         AND league_record.registration_deadline IS NOT NULL 
         AND today_date <= league_record.registration_deadline THEN
        calculated_status := 'registration_open';
      ELSE
        calculated_status := 'upcoming';
      END IF;
    -- If start date is today or in the past
    ELSIF league_record.start_date <= today_date THEN
      -- If end date exists and is in the past, league is completed
      IF league_record.end_date IS NOT NULL AND league_record.end_date < today_date THEN
        calculated_status := 'completed';
      -- Otherwise, league is in progress
      ELSE
        calculated_status := 'in_progress';
      END IF;
    END IF;
    
    -- Only update if status has changed
    IF calculated_status != league_record.status THEN
      UPDATE leagues
      SET status = calculated_status,
          updated_at = NOW()
      WHERE id = league_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Create a trigger function that updates status when league dates are modified
CREATE OR REPLACE FUNCTION trigger_update_league_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  today_date DATE;
  calculated_status VARCHAR(20);
BEGIN
  today_date := CURRENT_DATE;
  calculated_status := NEW.status; -- Default to current status
  
  -- Don't change cancelled status
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  
  -- If start date is in the future
  IF NEW.start_date > today_date THEN
    -- Check if registration is open
    IF NEW.registration_enabled = true 
       AND NEW.registration_deadline IS NOT NULL 
       AND today_date <= NEW.registration_deadline THEN
      calculated_status := 'registration_open';
    ELSE
      calculated_status := 'upcoming';
    END IF;
  -- If start date is today or in the past
  ELSIF NEW.start_date <= today_date THEN
    -- If end date exists and is in the past, league is completed
    IF NEW.end_date IS NOT NULL AND NEW.end_date < today_date THEN
      calculated_status := 'completed';
    -- Otherwise, league is in progress
    ELSE
      calculated_status := 'in_progress';
    END IF;
  END IF;
  
  -- Update status if it changed
  IF calculated_status != NEW.status THEN
    NEW.status := calculated_status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that runs before INSERT or UPDATE
-- SAFE: DROP IF EXISTS ensures no error if trigger already exists
DROP TRIGGER IF EXISTS trigger_leagues_auto_status ON leagues;
CREATE TRIGGER trigger_leagues_auto_status
  BEFORE INSERT OR UPDATE OF start_date, end_date, registration_deadline, registration_enabled
  ON leagues
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_league_status();

-- Verify the trigger was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_leagues_auto_status' 
    AND tgrelid = 'leagues'::regclass
  ) THEN
    RAISE NOTICE 'Trigger trigger_leagues_auto_status created successfully';
  ELSE
    RAISE WARNING 'Trigger trigger_leagues_auto_status was not created';
  END IF;
END $$;

-- Create a scheduled job function (requires pg_cron extension)
-- This can be set up to run daily to update all league statuses
-- Note: pg_cron extension must be enabled in your database
-- Example: SELECT cron.schedule('update-league-statuses', '0 0 * * *', 'SELECT update_league_status();');

-- Comment on the function
COMMENT ON FUNCTION update_league_status() IS 'Updates all league statuses based on current date and league dates';
COMMENT ON FUNCTION trigger_update_league_status() IS 'Automatically updates league status when dates are modified';

