import { create } from 'zustand';
import type { Exercise, UserWorkout, WorkoutLog, UserGoal, ProgressData, UserStats } from '@/services/gymService';

interface GymState {
  // Exercises
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  loadingExercises: boolean;
  exercisesError: string | null;

  // Workout
  activeWorkout: UserWorkout | null;
  workoutHistory: UserWorkout[];
  loadingWorkout: boolean;
  workoutError: string | null;

  // Progress
  progress: ProgressData[];
  loadingProgress: boolean;
  progressError: string | null;
  progressPeriod: 'day' | 'week' | 'month';

  // Stats
  stats: UserStats | null;
  loadingStats: boolean;
  statsError: string | null;

  // Goals
  goals: UserGoal[];
  loadingGoals: boolean;
  goalsError: string | null;

  // Actions - Exercises
  setExercises: (exercises: Exercise[]) => void;
  setSelectedExercise: (exercise: Exercise | null) => void;
  setLoadingExercises: (loading: boolean) => void;
  setExercisesError: (error: string | null) => void;

  // Actions - Workout
  setActiveWorkout: (workout: UserWorkout | null) => void;
  setWorkoutHistory: (history: UserWorkout[]) => void;
  setLoadingWorkout: (loading: boolean) => void;
  setWorkoutError: (error: string | null) => void;
  addExerciseToWorkout: (log: WorkoutLog) => void;
  updateWorkoutExercise: (logId: string, updates: Partial<WorkoutLog>) => void;
  removeExerciseFromWorkout: (logId: string) => void;

  // Actions - Progress
  setProgress: (progress: ProgressData[]) => void;
  setLoadingProgress: (loading: boolean) => void;
  setProgressError: (error: string | null) => void;
  setProgressPeriod: (period: 'day' | 'week' | 'month') => void;

  // Actions - Stats
  setStats: (stats: UserStats | null) => void;
  setLoadingStats: (loading: boolean) => void;
  setStatsError: (error: string | null) => void;

  // Actions - Goals
  setGoals: (goals: UserGoal[]) => void;
  setLoadingGoals: (loading: boolean) => void;
  setGoalsError: (error: string | null) => void;
  addGoal: (goal: UserGoal) => void;
  updateGoal: (goalId: string, updates: Partial<UserGoal>) => void;
  removeGoal: (goalId: string) => void;

  // Clear all
  clearAll: () => void;
}

const initialState = {
  exercises: [],
  selectedExercise: null,
  loadingExercises: false,
  exercisesError: null,
  activeWorkout: null,
  workoutHistory: [],
  loadingWorkout: false,
  workoutError: null,
  progress: [],
  loadingProgress: false,
  progressError: null,
  progressPeriod: 'week' as const,
  stats: null,
  loadingStats: false,
  statsError: null,
  goals: [],
  loadingGoals: false,
  goalsError: null,
};

const useGymStore = create<GymState>((set) => ({
  ...initialState,

  // Exercises
  setExercises: (exercises) => set({ exercises }),
  setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
  setLoadingExercises: (loading) => set({ loadingExercises: loading }),
  setExercisesError: (error) => set({ exercisesError: error }),

  // Workout
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
  setWorkoutHistory: (history) => set({ workoutHistory: history }),
  setLoadingWorkout: (loading) => set({ loadingWorkout: loading }),
  setWorkoutError: (error) => set({ workoutError: error }),
  addExerciseToWorkout: (log) =>
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            logs: [...(state.activeWorkout.logs || []), log],
          }
        : null,
    })),
  updateWorkoutExercise: (logId, updates) =>
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            logs: state.activeWorkout.logs?.map((log) =>
              log.id === logId ? { ...log, ...updates } : log
            ),
          }
        : null,
    })),
  removeExerciseFromWorkout: (logId) =>
    set((state) => ({
      activeWorkout: state.activeWorkout
        ? {
            ...state.activeWorkout,
            logs: state.activeWorkout.logs?.filter((log) => log.id !== logId),
          }
        : null,
    })),

  // Progress
  setProgress: (progress) => set({ progress }),
  setLoadingProgress: (loading) => set({ loadingProgress: loading }),
  setProgressError: (error) => set({ progressError: error }),
  setProgressPeriod: (period) => set({ progressPeriod: period }),

  // Stats
  setStats: (stats) => set({ stats }),
  setLoadingStats: (loading) => set({ loadingStats: loading }),
  setStatsError: (error) => set({ statsError: error }),

  // Goals
  setGoals: (goals) => set({ goals }),
  setLoadingGoals: (loading) => set({ loadingGoals: loading }),
  setGoalsError: (error) => set({ goalsError: error }),
  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, goal],
    })),
  updateGoal: (goalId, updates) =>
    set((state) => ({
      goals: state.goals.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)),
    })),
  removeGoal: (goalId) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== goalId),
    })),

  // Clear all
  clearAll: () => set(initialState),
}));

export default useGymStore;

