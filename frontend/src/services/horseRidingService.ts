import axiosInstance from '@/lib/axiosInstance';
import type {
  TimeSlot,
  Rule,
  Equipment,
  Registration,
  Enrollment,
  EquipmentPurchase,
} from '@/stores/horseRidingStore';

// ==================== RESPONSE TYPES ====================

export interface TimeSlotsResponse {
  success: boolean;
  data: {
    timeSlots: TimeSlot[];
    count: number;
  };
}

export interface TimeSlotResponse {
  success: boolean;
  message?: string;
  data: {
    timeSlot: TimeSlot;
  };
}

export interface RulesResponse {
  success: boolean;
  data: {
    rules: Rule[];
    count: number;
  };
}

export interface RuleResponse {
  success: boolean;
  message?: string;
  data: {
    rule: Rule;
  };
}

export interface EquipmentResponse {
  success: boolean;
  data: {
    equipment: Equipment[];
    count: number;
  };
}

export interface EquipmentItemResponse {
  success: boolean;
  message?: string;
  data: {
    equipment: Equipment;
  };
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  data: {
    registration: Registration;
    requiresPayment?: boolean;
    checkoutUrl?: string;
    sessionId?: string;
  };
}

export interface EnrollmentsResponse {
  success: boolean;
  data: {
    enrollments: Enrollment[];
    count: number;
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message?: string;
  data: {
    enrollment: Enrollment;
  };
}

export interface EquipmentPurchasesResponse {
  success: boolean;
  data: {
    purchases: EquipmentPurchase[];
    count: number;
  };
}

export interface EquipmentPurchaseResponse {
  success: boolean;
  message?: string;
  data: {
    purchase: EquipmentPurchase;
    checkoutUrl?: string;
    sessionId?: string;
  };
}

// ==================== REQUEST TYPES ====================

export interface CreateTimeSlotRequest {
  start_time: string;
  end_time: string;
  day_of_week?: number | null;
  max_capacity?: number;
  instructor_id?: string | null;
  is_active?: boolean;
}

export interface UpdateTimeSlotRequest {
  start_time?: string;
  end_time?: string;
  day_of_week?: number | null;
  max_capacity?: number;
  instructor_id?: string | null;
  is_active?: boolean;
}

export interface CreateRuleRequest {
  title: string;
  content: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateRuleRequest {
  title?: string;
  content?: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateEquipmentRequest {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  stock_quantity?: number;
  is_available?: boolean;
}

export interface UpdateEquipmentRequest {
  name?: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  stock_quantity?: number;
  is_available?: boolean;
}

export interface CreateRegistrationRequest {
  registration_fee?: number;
}

export interface VerifyPaymentRequest {
  registrationId?: string;
  purchaseId?: string;
  sessionId: string;
}

export interface CreateEnrollmentRequest {
  time_slot_id: string;
  session_date: string;
  notes?: string | null;
}

export interface CreateEquipmentPurchaseRequest {
  equipment_id: string;
  quantity: number;
}

// ==================== SERVICE ====================

export const horseRidingService = {
  // ==================== TIME SLOTS ====================

  /**
   * Get all time slots
   */
  getTimeSlots: async (filters?: { active?: boolean; day_of_week?: number }): Promise<TimeSlotsResponse> => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }
    if (filters?.day_of_week !== undefined) {
      params.append('day_of_week', filters.day_of_week.toString());
    }
    const queryString = params.toString();
    const url = `/horse-riding/time-slots${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get time slot by ID
   */
  getTimeSlotById: async (id: string): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.get(`/horse-riding/time-slots/${id}`);
    return response.data;
  },

  /**
   * Create time slot (admin only)
   */
  createTimeSlot: async (data: CreateTimeSlotRequest): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.post('/horse-riding/time-slots', data);
    return response.data;
  },

  /**
   * Update time slot (admin only)
   */
  updateTimeSlot: async (id: string, data: UpdateTimeSlotRequest): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.put(`/horse-riding/time-slots/${id}`, data);
    return response.data;
  },

  /**
   * Delete time slot (admin only)
   */
  deleteTimeSlot: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/horse-riding/time-slots/${id}`);
    return response.data;
  },

  // ==================== RULES ====================

  /**
   * Get all rules
   */
  getRules: async (): Promise<RulesResponse> => {
    const response = await axiosInstance.get('/horse-riding/rules');
    return response.data;
  },

  /**
   * Create rule (admin only)
   */
  createRule: async (data: CreateRuleRequest): Promise<RuleResponse> => {
    const response = await axiosInstance.post('/horse-riding/rules', data);
    return response.data;
  },

  /**
   * Update rule (admin only)
   */
  updateRule: async (id: string, data: UpdateRuleRequest): Promise<RuleResponse> => {
    const response = await axiosInstance.put(`/horse-riding/rules/${id}`, data);
    return response.data;
  },

  /**
   * Delete rule (admin only)
   */
  deleteRule: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/horse-riding/rules/${id}`);
    return response.data;
  },

  // ==================== EQUIPMENT ====================

  /**
   * Get all equipment
   */
  getEquipment: async (): Promise<EquipmentResponse> => {
    const response = await axiosInstance.get('/horse-riding/equipment');
    return response.data;
  },

  /**
   * Create equipment (admin only)
   */
  createEquipment: async (data: CreateEquipmentRequest): Promise<EquipmentItemResponse> => {
    const response = await axiosInstance.post('/horse-riding/equipment', data);
    return response.data;
  },

  /**
   * Update equipment (admin only)
   */
  updateEquipment: async (id: string, data: UpdateEquipmentRequest): Promise<EquipmentItemResponse> => {
    const response = await axiosInstance.put(`/horse-riding/equipment/${id}`, data);
    return response.data;
  },

  /**
   * Delete equipment (admin only)
   */
  deleteEquipment: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/horse-riding/equipment/${id}`);
    return response.data;
  },

  // ==================== REGISTRATION ====================

  /**
   * Get user registration
   */
  getUserRegistration: async (): Promise<RegistrationResponse> => {
    const response = await axiosInstance.get('/horse-riding/registration');
    return response.data;
  },

  /**
   * Create registration (initiate payment)
   */
  createRegistration: async (data: CreateRegistrationRequest = {}): Promise<RegistrationResponse> => {
    const response = await axiosInstance.post('/horse-riding/registration', data);
    return response.data;
  },

  /**
   * Verify registration payment
   */
  verifyRegistrationPayment: async (data: VerifyPaymentRequest): Promise<RegistrationResponse> => {
    const response = await axiosInstance.post('/horse-riding/registration/verify-payment', data);
    return response.data;
  },

  /**
   * Get checkout URL for pending registration
   */
  getRegistrationCheckoutUrl: async (registrationId: string): Promise<{ success: boolean; data: { checkoutUrl: string } }> => {
    const response = await axiosInstance.get(`/horse-riding/registration/${registrationId}/checkout-url`);
    return response.data;
  },

  /**
   * Get all registrations with user details (admin only)
   */
  getAllRegistrations: async (): Promise<{ success: boolean; data: { registrations: any[]; count: number } }> => {
    const response = await axiosInstance.get('/horse-riding/registrations');
    return response.data;
  },

  // ==================== ENROLLMENTS ====================

  /**
   * Get user enrollments
   */
  getUserEnrollments: async (filters?: { status?: string; session_date?: string }): Promise<EnrollmentsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.session_date) {
      params.append('session_date', filters.session_date);
    }
    const queryString = params.toString();
    const url = `/horse-riding/enrollments${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Create enrollment
   */
  createEnrollment: async (data: CreateEnrollmentRequest): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.post('/horse-riding/enrollments', data);
    return response.data;
  },

  // ==================== EQUIPMENT PURCHASES ====================

  /**
   * Get user equipment purchases
   */
  getUserEquipmentPurchases: async (): Promise<EquipmentPurchasesResponse> => {
    const response = await axiosInstance.get('/horse-riding/equipment-purchases');
    return response.data;
  },

  /**
   * Create equipment purchase (initiate payment)
   */
  createEquipmentPurchase: async (data: CreateEquipmentPurchaseRequest): Promise<EquipmentPurchaseResponse> => {
    const response = await axiosInstance.post('/horse-riding/equipment-purchases', data);
    return response.data;
  },

  /**
   * Verify equipment purchase payment
   */
  verifyEquipmentPurchasePayment: async (data: VerifyPaymentRequest): Promise<EquipmentPurchaseResponse> => {
    const response = await axiosInstance.post('/horse-riding/equipment-purchases/verify-payment', data);
    return response.data;
  },
};

