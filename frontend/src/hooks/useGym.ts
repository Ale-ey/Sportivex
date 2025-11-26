import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import useGymStore from '@/stores/gymStore';
import {
  gymService,
  type Exercise,
  type ExerciseFilters,
  type WorkoutExercise,
  type UserGoal,
} from '@/services/gymService';

/**
 * Custom hook for gym module operations
 * Provides all user-side gym functionality with state management
 */
export const useGym = () => {
  const {
    // State
    exercises,
    selectedExercise,
    loadingExercises,
    exercisesError,
    activeWorkout,
    workoutHistory,
    loadingWorkout,
    workoutError,
    progress,
    loadingProgress,
    progressError,
    progressPeriod,
    stats,
    loadingStats,
    statsError,
    goals,
    loadingGoals,
    goalsError,

    // Actions
    setExercises,
    setSelectedExercise,
    setLoadingExercises,
    setExercisesError,
    setActiveWorkout,
    setWorkoutHistory,
    setLoadingWorkout,
    setWorkoutError,
    addExerciseToWorkout,
    updateWorkoutExercise,
    removeExerciseFromWorkout,
    setProgress,
    setLoadingProgress,
    setProgressError,
    setProgressPeriod,
    setStats,
    setLoadingStats,
    setStatsError,
    setGoals,
    setLoadingGoals,
    setGoalsError,
    addGoal,
    updateGoal,
    removeGoal,
    clearAll,
  } = useGymStore();

  // ==================== EXERCISES ====================

  /**
   * Fetch all exercises with optional filters
   */
  const fetchExercises = useCallback(
    async (filters?: ExerciseFilters) => {
      setLoadingExercises(true);
      setExercisesError(null);
      try {
        const response = await gymService.getExercises(filters);
        if (response.success) {
          setExercises(response.data.exercises);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch exercises');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to fetch exercises';
        setExercisesError(errorMessage);
        console.error('Error fetching exercises:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingExercises(false);
      }
    },
    [setExercises, setLoadingExercises, setExercisesError]
  );

  /**
   * Fetch exercise by ID
   */
  const fetchExerciseById = useCallback(
    async (id: string) => {
      try {
        const response = await gymService.getExerciseById(id);
        if (response.success) {
          setSelectedExercise(response.data.exercise);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch exercise');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to fetch exercise';
        console.error('Error fetching exercise:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [setSelectedExercise]
  );

  // ==================== WORKOUT ====================

  /**
   * Start a new workout session
   */
  const startWorkout = useCallback(async () => {
    setLoadingWorkout(true);
    setWorkoutError(null);
    try {
      const response = await gymService.startWorkout();
      if (response.success) {
        setActiveWorkout(response.data.workout);
        toast.success('Workout started!');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to start workout');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data?.error || error.message
          : 'Failed to start workout';
      setWorkoutError(errorMessage);
      console.error('Error starting workout:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingWorkout(false);
    }
  }, [setActiveWorkout, setLoadingWorkout, setWorkoutError]);

  /**
   * Save workout with exercises
   */
  const saveWorkout = useCallback(
    async (exercises: WorkoutExercise[]) => {
      if (!activeWorkout) {
        toast.error('No active workout found');
        return { success: false, error: 'No active workout' };
      }

      setLoadingWorkout(true);
      setWorkoutError(null);
      try {
        const response = await gymService.saveWorkout(activeWorkout.id, exercises);
        if (response.success) {
          setActiveWorkout(response.data.workout);
          toast.success(`Workout saved! ${response.data.totalCalories} calories burned.`);
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Failed to save workout');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to save workout';
        setWorkoutError(errorMessage);
        console.error('Error saving workout:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWorkout(false);
      }
    },
    [activeWorkout, setActiveWorkout, setLoadingWorkout, setWorkoutError]
  );

  /**
   * Finish workout
   */
  const finishWorkout = useCallback(
    async (status: 'completed' | 'abandoned' = 'completed') => {
      if (!activeWorkout) {
        toast.error('No active workout found');
        return { success: false, error: 'No active workout' };
      }

      setLoadingWorkout(true);
      setWorkoutError(null);
      try {
        const response = await gymService.finishWorkout(activeWorkout.id, status);
        if (response.success) {
          setActiveWorkout(null);
          toast.success(status === 'completed' ? 'Workout completed!' : 'Workout abandoned');
          // Refresh history
          fetchWorkoutHistory();
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Failed to finish workout');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to finish workout';
        setWorkoutError(errorMessage);
        console.error('Error finishing workout:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWorkout(false);
      }
    },
    [activeWorkout, setActiveWorkout, setLoadingWorkout, setWorkoutError]
  );

  /**
   * Fetch active workout
   */
  const fetchActiveWorkout = useCallback(async () => {
    setLoadingWorkout(true);
    setWorkoutError(null);
    try {
      const response = await gymService.getActiveWorkout();
      if (response.success) {
        setActiveWorkout(response.data.workout);
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to fetch active workout');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data?.error || error.message
          : 'Failed to fetch active workout';
      setWorkoutError(errorMessage);
      console.error('Error fetching active workout:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingWorkout(false);
    }
  }, [setActiveWorkout, setLoadingWorkout, setWorkoutError]);

  /**
   * Fetch workout history
   */
  const fetchWorkoutHistory = useCallback(
    async (limit: number = 50) => {
      setLoadingWorkout(true);
      setWorkoutError(null);
      try {
        const response = await gymService.getWorkoutHistory(limit);
        if (response.success) {
          setWorkoutHistory(response.data.workouts);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch workout history');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to fetch workout history';
        setWorkoutError(errorMessage);
        console.error('Error fetching workout history:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWorkout(false);
      }
    },
    [setWorkoutHistory, setLoadingWorkout, setWorkoutError]
  );

  // ==================== PROGRESS ====================

  /**
   * Fetch user progress
   */
  const fetchProgress = useCallback(
    async (period: 'day' | 'week' | 'month' = 'week') => {
      setLoadingProgress(true);
      setProgressError(null);
      setProgressPeriod(period);
      try {
        const response = await gymService.getProgress(period);
        if (response.success) {
          setProgress(response.data.progress);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch progress');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to fetch progress';
        setProgressError(errorMessage);
        console.error('Error fetching progress:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingProgress(false);
      }
    },
    [setProgress, setLoadingProgress, setProgressError, setProgressPeriod]
  );

  // ==================== STATS ====================

  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const response = await gymService.getStats();
      if (response.success) {
        setStats(response.data.stats);
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data?.error || error.message
          : 'Failed to fetch statistics';
      setStatsError(errorMessage);
      console.error('Error fetching stats:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingStats(false);
    }
  }, [setStats, setLoadingStats, setStatsError]);

  // ==================== GOALS ====================

  /**
   * Fetch user goals
   */
  const fetchGoals = useCallback(async () => {
    setLoadingGoals(true);
    setGoalsError(null);
    try {
      const response = await gymService.getGoals();
      if (response.success) {
        setGoals(response.data.goals);
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data?.error || error.message
          : 'Failed to fetch goals';
      setGoalsError(errorMessage);
      console.error('Error fetching goals:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingGoals(false);
    }
  }, [setGoals, setLoadingGoals, setGoalsError]);

  /**
   * Save goal (create or update)
   */
  const saveGoal = useCallback(
    async (goal: UserGoal) => {
      setLoadingGoals(true);
      setGoalsError(null);
      try {
        const response = await gymService.saveGoal(goal);
        if (response.success) {
          if (goal.id) {
            updateGoal(goal.id, response.data.goal);
            toast.success('Goal updated successfully');
          } else {
            addGoal(response.data.goal);
            toast.success('Goal created successfully');
          }
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Failed to save goal');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message
            : 'Failed to save goal';
        setGoalsError(errorMessage);
        console.error('Error saving goal:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingGoals(false);
      }
    },
    [addGoal, updateGoal, setLoadingGoals, setGoalsError]
  );

  return {
    // Exercises
    exercises,
    selectedExercise,
    loadingExercises,
    exercisesError,
    fetchExercises,
    fetchExerciseById,

    // Workout
    activeWorkout,
    workoutHistory,
    loadingWorkout,
    workoutError,
    startWorkout,
    saveWorkout,
    finishWorkout,
    fetchActiveWorkout,
    fetchWorkoutHistory,
    addExerciseToWorkout,
    updateWorkoutExercise,
    removeExerciseFromWorkout,

    // Progress
    progress,
    loadingProgress,
    progressError,
    progressPeriod,
    fetchProgress,

    // Stats
    stats,
    loadingStats,
    statsError,
    fetchStats,

    // Goals
    goals,
    loadingGoals,
    goalsError,
    fetchGoals,
    saveGoal,
    removeGoal,

    // Clear
    clearAll,
  };
};

