import axiosInstance from '@/lib/axiosInstance';

// ==================== TYPES ====================

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  repetitions: number;
  gif_link?: string;
  met_value: number;
  body_part?: string;
  equipment?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscle_groups?: string[];
  instructions?: string;
  tips?: string;
  is_active: boolean;
  created_at?: string;  
  updated_at?: string;
}

export interface ExerciseFilters {
  bodyPart?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
  isActive?: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  duration: number; // in minutes
}

export interface UserWorkout {
  id: string;
  user_id: string;
  workout_date: string;
  start_time: string;
  end_time?: string;
  total_calories: number;
  total_exercises: number;
  total_duration_minutes: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  logs?: WorkoutLog[];
}

export interface WorkoutLog {
  id: string;
  user_workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  duration_minutes: number;
  calories: number;
  rest_seconds?: number;
  notes?: string;
  exercise?: Exercise;
  created_at?: string;
  updated_at?: string;
}

export interface UserGoal {
  id?: string;
  user_id: string;
  goal_type: 'calories_per_day' | 'calories_per_week' | 'workouts_per_week' | 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
  target_value: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressData {
  workout_date: string;
  total_calories: number;
  total_exercises: number;
  total_duration_minutes: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalCalories: number;
  weekCalories: number;
  weekWorkouts: number;
  todayCalories: number;
  todayExercises: number;
}

export interface GymRegistration {
  id: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  amount_paid: number;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  registration_fee: number;
  monthly_fee: number;
  status: 'pending' | 'active' | 'suspended' | 'cancelled' | 'expired';
  registered_at: string;
  activated_at?: string;
  expires_at?: string;
  next_payment_date?: string;
  last_payment_date?: string;
  payment_due: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GymMonthlyPayment {
  id: string;
  registration_id: string;
  user_id: string;
  amount: number;
  payment_month: string;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GymAttendance {
  id: string;
  user_id: string;
  registration_id: string;
  check_in_time: string;
  check_in_method: 'qr_scan' | 'manual' | 'app';
  session_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GymRegistrationStatus {
  success: boolean;
  isRegistered: boolean;
  isActive: boolean;
  isPaymentDue?: boolean;
  message: string;
  registration: GymRegistration | null;
}

// ==================== API RESPONSES ====================

export interface ExercisesResponse {
  success: boolean;
  data: {
    exercises: Exercise[];
    count: number;
  };
}

export interface ExerciseResponse {
  success: boolean;
  data: {
    exercise: Exercise;
  };
}

export interface WorkoutResponse {
  success: boolean;
  message: string;
  data: {
    workout: UserWorkout;
    totalCalories?: number;
    totalExercises?: number;
    exerciseLogs?: WorkoutLog[];
  };
}

export interface ProgressResponse {
  success: boolean;
  data: {
    progress: ProgressData[];
    period: string;
    count: number;
  };
}

export interface WorkoutHistoryResponse {
  success: boolean;
  data: {
    workouts: UserWorkout[];
    count: number;
  };
}

export interface GoalsResponse {
  success: boolean;
  data: {
    goals: UserGoal[];
    count: number;
  };
}

export interface StatsResponse {
  success: boolean;
  data: {
    stats: UserStats;
  };
}

// ==================== SERVICE ====================

class GymService {
  private baseUrl = '/gym';

  /**
   * Get all exercises with optional filters
   */
  async getExercises(filters?: ExerciseFilters): Promise<ExercisesResponse> {
    const params = new URLSearchParams();
    if (filters?.bodyPart) params.append('bodyPart', filters.bodyPart);
    if (filters?.equipment) params.append('equipment', filters.equipment);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/exercises?${queryString}` : `${this.baseUrl}/exercises`;

    const response = await axiosInstance.get<ExercisesResponse>(url);
    return response.data;
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: string): Promise<ExerciseResponse> {
    const response = await axiosInstance.get<ExerciseResponse>(`${this.baseUrl}/exercises/${id}`);
    return response.data;
  }

  /**
   * Start a new workout session
   */
  async startWorkout(): Promise<WorkoutResponse> {
    const response = await axiosInstance.post<WorkoutResponse>(`${this.baseUrl}/workouts/start`);
    return response.data;
  }

  /**
   * Save workout with exercises
   */
  async saveWorkout(workoutId: string, exercises: WorkoutExercise[]): Promise<WorkoutResponse> {
    const response = await axiosInstance.post<WorkoutResponse>(`${this.baseUrl}/workouts/save`, {
      workoutId,
      exercises
    });
    return response.data;
  }

  /**
   * Get active workout
   */
  async getActiveWorkout(): Promise<{ success: boolean; data: { workout: UserWorkout | null } }> {
    const response = await axiosInstance.get<{ success: boolean; data: { workout: UserWorkout | null } }>(
      `${this.baseUrl}/workouts/active`
    );
    return response.data;
  }

  /**
   * Finish workout
   */
  async finishWorkout(workoutId: string, status: 'completed' | 'abandoned' = 'completed'): Promise<WorkoutResponse> {
    const response = await axiosInstance.post<WorkoutResponse>(`${this.baseUrl}/workouts/finish`, {
      workoutId,
      status
    });
    return response.data;
  }

  /**
   * Get workout history
   */
  async getWorkoutHistory(limit: number = 50): Promise<WorkoutHistoryResponse> {
    const response = await axiosInstance.get<WorkoutHistoryResponse>(
      `${this.baseUrl}/workouts/history?limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get user progress
   */
  async getProgress(period: 'day' | 'week' | 'month' = 'week'): Promise<ProgressResponse> {
    const response = await axiosInstance.get<ProgressResponse>(`${this.baseUrl}/progress?period=${period}`);
    return response.data;
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<StatsResponse> {
    const response = await axiosInstance.get<StatsResponse>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get user goals
   */
  async getGoals(): Promise<GoalsResponse> {
    const response = await axiosInstance.get<GoalsResponse>(`${this.baseUrl}/goals`);
    return response.data;
  }

  /**
   * Create or update goal
   */
  async saveGoal(goal: UserGoal): Promise<{ success: boolean; message: string; data: { goal: UserGoal } }> {
    if (goal.id) {
      const response = await axiosInstance.put<{ success: boolean; message: string; data: { goal: UserGoal } }>(
        `${this.baseUrl}/goals/${goal.id}`,
        goal
      );
      return response.data;
    } else {
      const response = await axiosInstance.post<{ success: boolean; message: string; data: { goal: UserGoal } }>(
        `${this.baseUrl}/goals`,
        goal
      );
      return response.data;
    }
  }

  // ==================== GYM REGISTRATION ====================

  /**
   * Get user's gym registration
   */
  async getRegistration(): Promise<{ success: boolean; data: { registration: GymRegistration | null } }> {
    const response = await axiosInstance.get<{ success: boolean; data: { registration: GymRegistration | null } }>(
      `${this.baseUrl}/registration`
    );
    return response.data;
  }

  /**
   * Check gym registration status
   */
  async checkRegistrationStatus(): Promise<{ success: boolean; data: GymRegistrationStatus }> {
    const response = await axiosInstance.get<{ success: boolean; data: GymRegistrationStatus }>(
      `${this.baseUrl}/registration/status`
    );
    return response.data;
  }

  /**
   * Create gym registration
   */
  async createRegistration(registrationFee?: number): Promise<{
    success: boolean;
    message: string;
    data: {
      registration: GymRegistration;
      requiresPayment: boolean;
      checkoutUrl?: string;
      sessionId?: string;
    };
  }> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: {
        registration: GymRegistration;
        requiresPayment: boolean;
        checkoutUrl?: string;
        sessionId?: string;
      };
    }>(`${this.baseUrl}/registration`, {
      registration_fee: registrationFee
    });
    return response.data;
  }

  /**
   * Verify registration payment
   */
  async verifyRegistrationPayment(registrationId: string, sessionId: string): Promise<{
    success: boolean;
    message: string;
    data?: { registration: GymRegistration };
  }> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data?: { registration: GymRegistration };
    }>(`${this.baseUrl}/registration/verify-payment`, {
      registrationId,
      sessionId
    });
    return response.data;
  }

  /**
   * Create monthly payment
   */
  async createMonthlyPayment(registrationId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payment: GymMonthlyPayment;
      checkoutUrl: string;
      sessionId: string;
    };
  }> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: {
        payment: GymMonthlyPayment;
        checkoutUrl: string;
        sessionId: string;
      };
    }>(`${this.baseUrl}/registration/monthly-payment`, {
      registrationId
    });
    return response.data;
  }

  /**
   * Verify monthly payment
   */
  async verifyMonthlyPayment(paymentId: string, sessionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`${this.baseUrl}/registration/monthly-payment/verify`, {
      paymentId,
      sessionId
    });
    return response.data;
  }

  /**
   * Get monthly payment history
   */
  async getMonthlyPayments(limit: number = 12): Promise<{
    success: boolean;
    data: {
      payments: GymMonthlyPayment[];
      count: number;
    };
  }> {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        payments: GymMonthlyPayment[];
        count: number;
      };
    }>(`${this.baseUrl}/registration/monthly-payments?limit=${limit}`);
    return response.data;
  }

  /**
   * Process gym QR code scan for attendance
   */
  async scanQRCode(qrCodeValue: string): Promise<{
    success: boolean;
    message: string;
    data?: { attendance: GymAttendance };
    requiresPayment?: boolean;
  }> {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data?: { attendance: GymAttendance };
      requiresPayment?: boolean;
    }>(`${this.baseUrl}/attendance/scan-qr`, {
      qrCodeValue
    });
    return response.data;
  }

  /**
   * Get gym attendance history
   */
  async getAttendance(limit: number = 30): Promise<{
    success: boolean;
    data: {
      attendance: GymAttendance[];
      count: number;
    };
  }> {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        attendance: GymAttendance[];
        count: number;
      };
    }>(`${this.baseUrl}/attendance?limit=${limit}`);
    return response.data;
  }
}

export const gymService = new GymService();

