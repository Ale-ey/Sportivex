import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Calculate calories burned for an exercise
 * Formula: calories = (MET * 3.5 * weight_kg * duration_minutes) / 200
 */
export const calculateCalories = (metValue, weightKg, durationMinutes) => {
  if (!metValue || !weightKg || !durationMinutes) {
    return 0;
  }
  return Math.round((metValue * 3.5 * weightKg * durationMinutes) / 200);
};

/**
 * Get all exercises with optional filters
 */
export const getExercises = async (filters = {}) => {
  try {
    let query = supabase
      .from('exercises')
      .select('*');

    if (filters.bodyPart) {
      query = query.eq('body_part', filters.bodyPart);
    }

    if (filters.equipment) {
      query = query.eq('equipment', filters.equipment);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    } else {
      query = query.eq('is_active', true);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
      return { success: false, exercises: [], error: error.message };
    }

    return { success: true, exercises: data || [] };
  } catch (error) {
    console.error('Error in getExercises:', error);
    return { success: false, exercises: [], error: error.message };
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (exerciseId) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      return { success: false, exercise: null, error: error.message };
    }

    return { success: true, exercise: data };
  } catch (error) {
    console.error('Error in getExerciseById:', error);
    return { success: false, exercise: null, error: error.message };
  }
};

/**
 * Get user's weight from profile
 */
export const getUserWeight = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users_metadata')
      .select('weight_kg')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { success: false, weight: 70 }; // Default weight if not set
    }

    return { success: true, weight: data.weight_kg || 70 };
  } catch (error) {
    console.error('Error getting user weight:', error);
    return { success: false, weight: 70 };
  }
};

/**
 * Create a new workout session
 */
export const createWorkout = async (userId, startTime = null) => {
  try {
    const workoutData = {
      user_id: userId,
      workout_date: new Date().toISOString(),
      start_time: startTime || new Date().toISOString(),
      status: 'in_progress'
    };

    const { data, error } = await supabase
      .from('user_workouts')
      .insert([workoutData])
      .select()
      .single();

    if (error) {
      console.error('Error creating workout:', error);
      return { success: false, workout: null, error: error.message };
    }

    return { success: true, workout: data };
  } catch (error) {
    console.error('Error in createWorkout:', error);
    return { success: false, workout: null, error: error.message };
  }
};

/**
 * Save workout with exercises and calculate calories
 */
export const saveWorkout = async (userId, workoutData) => {
  try {
    const { workoutId, exercises, userWeight } = workoutData;

    // Get workout record
    const { data: workout, error: workoutError } = await supabase
      .from('user_workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (workoutError || !workout) {
      return { success: false, error: 'Workout not found' };
    }

    let totalCalories = 0;
    let totalExercises = exercises.length;
    const exerciseLogs = [];

    // Process each exercise
    for (const exercise of exercises) {
      const { exerciseId, sets, reps, weight, duration } = exercise;

      // Get exercise details for MET value
      const { data: exerciseData, error: exError } = await supabase
        .from('exercises')
        .select('met_value')
        .eq('id', exerciseId)
        .single();

      if (exError || !exerciseData) {
        console.error('Exercise not found:', exerciseId);
        continue;
      }

      // Calculate calories for this exercise
      const calories = calculateCalories(
        exerciseData.met_value,
        userWeight,
        duration || 5 // Default 5 minutes if not provided
      );

      totalCalories += calories;

      // Create workout log entry
      const { data: logData, error: logError } = await supabase
        .from('user_workout_logs')
        .insert([
          {
            user_workout_id: workoutId,
            exercise_id: exerciseId,
            sets: sets || 1,
            reps: reps || 1,
            weight: weight || null,
            duration_minutes: duration || 5,
            calories: calories
          }
        ])
        .select()
        .single();

      if (!logError && logData) {
        exerciseLogs.push(logData);
      }
    }

    // Calculate total duration
    const startTime = new Date(workout.start_time);
    const endTime = new Date();
    const totalDurationMinutes = Math.round((endTime - startTime) / 60000);

    // Update workout with totals
    const { data: updatedWorkout, error: updateError } = await supabase
      .from('user_workouts')
      .update({
        total_calories: totalCalories,
        total_exercises: totalExercises,
        total_duration_minutes: totalDurationMinutes,
        end_time: endTime.toISOString(),
        status: 'completed'
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workout:', updateError);
      return { success: false, error: 'Failed to update workout' };
    }

    return {
      success: true,
      workout: updatedWorkout,
      exerciseLogs,
      totalCalories,
      totalExercises
    };
  } catch (error) {
    console.error('Error in saveWorkout:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's workout progress (daily/weekly/monthly)
 */
export const getUserProgress = async (userId, period = 'week') => {
  try {
    let startDate;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    const { data, error } = await supabase
      .from('user_workouts')
      .select('workout_date, total_calories, total_exercises, total_duration_minutes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('workout_date', startDate.toISOString())
      .lte('workout_date', endDate.toISOString())
      .order('workout_date', { ascending: true });

    if (error) {
      console.error('Error fetching progress:', error);
      return { success: false, progress: [], error: error.message };
    }

    return { success: true, progress: data || [] };
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return { success: false, progress: [], error: error.message };
  }
};

/**
 * Get user's workout history
 */
export const getUserWorkoutHistory = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_workouts')
      .select(`
        *,
        logs:user_workout_logs(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching workout history:', error);
      return { success: false, workouts: [], error: error.message };
    }

    return { success: true, workouts: data || [] };
  } catch (error) {
    console.error('Error in getUserWorkoutHistory:', error);
    return { success: false, workouts: [], error: error.message };
  }
};

/**
 * Get user's active workout (in progress)
 */
export const getActiveWorkout = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_workouts')
      .select(`
        *,
        logs:user_workout_logs(
          *,
          exercise:exercises(*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active workout:', error);
      return { success: false, workout: null, error: error.message };
    }

    return { success: true, workout: data || null };
  } catch (error) {
    console.error('Error in getActiveWorkout:', error);
    return { success: false, workout: null, error: error.message };
  }
};

/**
 * Get user goals
 */
export const getUserGoals = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return { success: false, goals: [], error: error.message };
    }

    return { success: true, goals: data || [] };
  } catch (error) {
    console.error('Error in getUserGoals:', error);
    return { success: false, goals: [], error: error.message };
  }
};

/**
 * Create or update user goal
 */
export const saveUserGoal = async (userId, goalData) => {
  try {
    const { id, ...goalFields } = goalData;

    if (id) {
      // Update existing goal
      const { data, error } = await supabase
        .from('user_goals')
        .update(goalFields)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        return { success: false, goal: null, error: error.message };
      }

      return { success: true, goal: data };
    } else {
      // Create new goal
      const { data, error } = await supabase
        .from('user_goals')
        .insert([
          {
            ...goalFields,
            user_id: userId
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        return { success: false, goal: null, error: error.message };
      }

      return { success: true, goal: data };
    }
  } catch (error) {
    console.error('Error in saveUserGoal:', error);
    return { success: false, goal: null, error: error.message };
  }
};

/**
 * Get workout statistics for user
 */
export const getUserStats = async (userId) => {
  try {
    // Get total workouts
    const { count: totalWorkouts } = await supabase
      .from('user_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get total calories burned (all time)
    const { data: allWorkouts } = await supabase
      .from('user_workouts')
      .select('total_calories')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const totalCalories = allWorkouts?.reduce((sum, w) => sum + (w.total_calories || 0), 0) || 0;

    // Get this week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const { data: weekWorkouts } = await supabase
      .from('user_workouts')
      .select('total_calories, total_exercises')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('workout_date', weekStart.toISOString());

    const weekCalories = weekWorkouts?.reduce((sum, w) => sum + (w.total_calories || 0), 0) || 0;
    const weekWorkoutsCount = weekWorkouts?.length || 0;

    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayWorkouts } = await supabase
      .from('user_workouts')
      .select('total_calories, total_exercises')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('workout_date', todayStart.toISOString());

    const todayCalories = todayWorkouts?.reduce((sum, w) => sum + (w.total_calories || 0), 0) || 0;
    const todayExercises = todayWorkouts?.reduce((sum, w) => sum + (w.total_exercises || 0), 0) || 0;

    return {
      success: true,
      stats: {
        totalWorkouts: totalWorkouts || 0,
        totalCalories,
        weekCalories,
        weekWorkouts: weekWorkoutsCount,
        todayCalories,
        todayExercises
      }
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return { success: false, stats: null, error: error.message };
  }
};

