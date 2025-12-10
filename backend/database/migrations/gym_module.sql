-- Gym Module Database Migration
-- This file contains all table definitions for the gym module

-- 1. Create exercises table (master exercises catalog)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sets INTEGER DEFAULT 3,
  repetitions INTEGER DEFAULT 12,
  gif_link TEXT,
  met_value DECIMAL(4, 2) NOT NULL DEFAULT 6.0, -- MET (Metabolic Equivalent of Task) value for calorie calculation
  body_part VARCHAR(100), -- e.g., 'chest', 'back', 'legs', 'arms', 'shoulders', 'core', 'full_body'
  equipment VARCHAR(100), -- e.g., 'dumbbell', 'barbell', 'bodyweight', 'machine', 'cable'
  difficulty VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  muscle_groups TEXT[], -- Array of muscle groups targeted
  instructions TEXT, -- Step-by-step instructions
  tips TEXT, -- Tips for proper form
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises(body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises(is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

-- 2. Create user_workouts table (tracks workout sessions)
CREATE TABLE IF NOT EXISTS user_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  workout_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  total_calories INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0, -- Total workout duration in minutes
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_workouts_user_id ON user_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_workout_date ON user_workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_user_workouts_status ON user_workouts(status);
CREATE INDEX IF NOT EXISTS idx_user_workouts_user_date ON user_workouts(user_id, workout_date);

-- 3. Create user_workout_logs table (tracks exercise-level progress)
CREATE TABLE IF NOT EXISTS user_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_workout_id UUID NOT NULL REFERENCES user_workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER NOT NULL DEFAULT 1,
  weight DECIMAL(6, 2), -- Weight used in kg (optional)
  duration_minutes DECIMAL(5, 2), -- Duration for this exercise in minutes
  calories INTEGER DEFAULT 0, -- Calories burned for this exercise
  rest_seconds INTEGER DEFAULT 60, -- Rest time between sets in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_workout_logs_workout_id ON user_workout_logs(user_workout_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_logs_exercise_id ON user_workout_logs(exercise_id);

-- 4. Create user_goals table (tracks user fitness goals)
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('calories_per_day', 'calories_per_week', 'workouts_per_week', 'weight_loss', 'muscle_gain', 'endurance', 'strength', 'custom')),
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  unit VARCHAR(20), -- e.g., 'calories', 'kg', 'workouts', 'minutes'
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_goal_type ON user_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_active ON user_goals(user_id, is_active);

-- 5. Add weight field to users_metadata for calorie calculations (optional but recommended)
ALTER TABLE users_metadata 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5, 2) CHECK (weight_kg > 0 AND weight_kg < 500);

CREATE INDEX IF NOT EXISTS idx_users_metadata_weight ON users_metadata(weight_kg);

-- 6. Create trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_gym_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for each table
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_gym_updated_at_column();
CREATE TRIGGER update_user_workouts_updated_at BEFORE UPDATE ON user_workouts FOR EACH ROW EXECUTE FUNCTION update_gym_updated_at_column();
CREATE TRIGGER update_user_workout_logs_updated_at BEFORE UPDATE ON user_workout_logs FOR EACH ROW EXECUTE FUNCTION update_gym_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals FOR EACH ROW EXECUTE FUNCTION update_gym_updated_at_column();

-- 8. Insert sample exercises (common gym exercises)
INSERT INTO exercises (name, description, sets, repetitions, met_value, body_part, equipment, difficulty, muscle_groups, instructions, tips, gif_link)
VALUES
  ('Push-ups', 'Classic bodyweight chest exercise', 3, 15, 3.5, 'chest', 'bodyweight', 'beginner', ARRAY['chest', 'shoulders', 'triceps'], 'Start in plank position, lower body until chest nearly touches floor, push back up', 'Keep core tight and body in straight line', NULL),
  ('Bench Press', 'Barbell chest press exercise', 4, 10, 6.0, 'chest', 'barbell', 'intermediate', ARRAY['chest', 'shoulders', 'triceps'], 'Lie on bench, lower barbell to chest, press up', 'Keep feet flat on floor, arch back slightly', NULL),
  ('Squats', 'Fundamental leg exercise', 4, 12, 5.0, 'legs', 'bodyweight', 'beginner', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'Stand with feet shoulder-width, lower as if sitting, return to standing', 'Keep knees aligned with toes, chest up', NULL),
  ('Deadlift', 'Full body strength exercise', 3, 8, 6.0, 'full_body', 'barbell', 'advanced', ARRAY['back', 'glutes', 'hamstrings', 'core'], 'Lift barbell from floor to standing position', 'Keep back straight, drive through heels', NULL),
  ('Pull-ups', 'Upper body pulling exercise', 3, 10, 5.0, 'back', 'bodyweight', 'intermediate', ARRAY['back', 'biceps', 'shoulders'], 'Hang from bar, pull body up until chin over bar', 'Engage lats, avoid swinging', NULL),
  ('Bicep Curls', 'Arm isolation exercise', 3, 12, 3.0, 'arms', 'dumbbell', 'beginner', ARRAY['biceps'], 'Curl dumbbells from hanging position to shoulder', 'Keep elbows stationary, control the weight', NULL),
  ('Shoulder Press', 'Overhead pressing movement', 3, 10, 5.5, 'shoulders', 'dumbbell', 'intermediate', ARRAY['shoulders', 'triceps'], 'Press dumbbells overhead from shoulder height', 'Keep core engaged, avoid arching back excessively', NULL),
  ('Plank', 'Core stability exercise', 3, 1, 3.0, 'core', 'bodyweight', 'beginner', ARRAY['core', 'shoulders'], 'Hold body in straight line on forearms and toes', 'Keep hips level, breathe normally', NULL),
  ('Lunges', 'Unilateral leg exercise', 3, 12, 4.5, 'legs', 'bodyweight', 'beginner', ARRAY['quadriceps', 'glutes'], 'Step forward into lunge position, return to start', 'Keep front knee over ankle, back straight', NULL),
  ('Rows', 'Back pulling exercise', 4, 10, 5.5, 'back', 'barbell', 'intermediate', ARRAY['back', 'biceps'], 'Pull barbell to lower chest/upper abdomen', 'Squeeze shoulder blades together', NULL)
ON CONFLICT DO NOTHING;

-- 9. Enable Row Level Security (RLS) - Optional but recommended
-- Uncomment if you want to use Supabase RLS policies

-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_workouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_workout_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed)
-- CREATE POLICY "Allow public read access to exercises" ON exercises FOR SELECT USING (is_active = true);
-- CREATE POLICY "Allow users to read their own workouts" ON user_workouts FOR SELECT USING (user_id = auth.uid());
-- CREATE POLICY "Allow users to insert their own workouts" ON user_workouts FOR INSERT WITH CHECK (user_id = auth.uid());

