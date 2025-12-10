import { supabaseAdmin as supabase } from '../config/supabase.js';
import {
  getExercises,
  getExerciseById,
  getUserWeight,
  createWorkout,
  saveWorkout,
  getUserProgress,
  getUserWorkoutHistory,
  getActiveWorkout,
  getUserGoals,
  saveUserGoal,
  getUserStats
} from '../services/gymService.js';

/**
 * Get all exercises with optional filters
 */
export const getExercisesController = async (req, res) => {
  try {
    const { bodyPart, equipment, difficulty, search, isActive } = req.query;

    const filters = {};
    if (bodyPart) filters.bodyPart = bodyPart;
    if (equipment) filters.equipment = equipment;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const result = await getExercises(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exercises',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        exercises: result.exercises,
        count: result.exercises.length
      }
    });
  } catch (error) {
    console.error('Error in getExercisesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getExerciseById(id);

    if (!result.success || !result.exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        exercise: result.exercise
      }
    });
  } catch (error) {
    console.error('Error in getExerciseByIdController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Start a new workout session
 */
export const startWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has an active workout
    const activeResult = await getActiveWorkout(userId);
    if (activeResult.success && activeResult.workout) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active workout. Please finish it first.'
      });
    }

    const result = await createWorkout(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start workout',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Workout started successfully',
      data: {
        workout: result.workout
      }
    });
  } catch (error) {
    console.error('Error in startWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Save workout with exercises
 */
export const saveWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutId, exercises } = req.body;

    if (!workoutId || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Workout ID and exercises array are required'
      });
    }

    // Get user weight for calorie calculation
    const weightResult = await getUserWeight(userId);
    const userWeight = weightResult.weight;

    const result = await saveWorkout(userId, {
      workoutId,
      exercises,
      userWeight
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to save workout'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout saved successfully',
      data: {
        workout: result.workout,
        totalCalories: result.totalCalories,
        totalExercises: result.totalExercises,
        exerciseLogs: result.exerciseLogs
      }
    });
  } catch (error) {
    console.error('Error in saveWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's workout progress
 */
export const getProgressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    const result = await getUserProgress(userId, period);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch progress',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        progress: result.progress,
        period,
        count: result.progress.length
      }
    });
  } catch (error) {
    console.error('Error in getProgressController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's workout history
 */
export const getWorkoutHistoryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const result = await getUserWorkoutHistory(userId, parseInt(limit, 10));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch workout history',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        workouts: result.workouts,
        count: result.workouts.length
      }
    });
  } catch (error) {
    console.error('Error in getWorkoutHistoryController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's active workout
 */
export const getActiveWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getActiveWorkout(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch active workout',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        workout: result.workout
      }
    });
  } catch (error) {
    console.error('Error in getActiveWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Finish/abandon active workout
 */
export const finishWorkoutController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutId, status = 'completed' } = req.body;

    if (!workoutId) {
      return res.status(400).json({
        success: false,
        message: 'Workout ID is required'
      });
    }

    // Verify workout belongs to user
    const { data: workout, error: workoutError } = await supabase
      .from('user_workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (workoutError || !workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const endTime = new Date();
    const startTime = new Date(workout.start_time);
    const totalDurationMinutes = Math.round((endTime - startTime) / 60000);

    const { data: updatedWorkout, error: updateError } = await supabase
      .from('user_workouts')
      .update({
        end_time: endTime.toISOString(),
        status: status === 'abandoned' ? 'abandoned' : 'completed',
        total_duration_minutes: totalDurationMinutes
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workout:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to finish workout'
      });
    }

    res.status(200).json({
      success: true,
      message: `Workout ${status === 'abandoned' ? 'abandoned' : 'completed'} successfully`,
      data: {
        workout: updatedWorkout
      }
    });
  } catch (error) {
    console.error('Error in finishWorkoutController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user goals
 */
export const getGoalsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserGoals(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch goals',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        goals: result.goals,
        count: result.goals.length
      }
    });
  } catch (error) {
    console.error('Error in getGoalsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create or update user goal
 */
export const saveGoalController = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalData = req.body;

    // Validate required fields
    if (!goalData.goal_type || !goalData.target_value || !goalData.start_date) {
      return res.status(400).json({
        success: false,
        message: 'Goal type, target value, and start date are required'
      });
    }

    const result = await saveUserGoal(userId, goalData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save goal',
        error: result.error
      });
    }

    res.status(goalData.id ? 200 : 201).json({
      success: true,
      message: goalData.id ? 'Goal updated successfully' : 'Goal created successfully',
      data: {
        goal: result.goal
      }
    });
  } catch (error) {
    console.error('Error in saveGoalController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user statistics
 */
export const getStatsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserStats(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: result.stats
      }
    });
  } catch (error) {
    console.error('Error in getStatsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  getExercisesController,
  getExerciseByIdController,
  startWorkoutController,
  saveWorkoutController,
  getProgressController,
  getWorkoutHistoryController,
  getActiveWorkoutController,
  finishWorkoutController,
  getGoalsController,
  saveGoalController,
  getStatsController
};

