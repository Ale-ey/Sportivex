import axiosInstance from '@/lib/axiosInstance';

// ==================== TYPES ====================

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  gender_restriction: string;
  trainer_id?: string | null;
  trainer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  max_capacity: number;
  is_active: boolean;
  currentCount?: number;
  availableSpots?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlotsResponse {
  success: boolean;
  data: {
    timeSlots: TimeSlot[];
    count: number;
  };
}

export interface TimeSlotResponse {
  success: boolean;
  data: {
    timeSlot: TimeSlot;
  };
}

export interface QRScanResponse {
  success: boolean;
  message: string;
  attendance?: {
    id: string;
    checkInTime: string;
    sessionDate: string;
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    genderRestriction: string;
    trainerName?: string;
    currentCount: number;
    maxCapacity: number;
  };
  slotDeterminationReason?: string;
  slotMessage?: string;
  capacityExceeded?: boolean;
  alreadyCheckedIn?: boolean;
}

export interface AttendanceRecord {
  id: string;
  time_slot_id: string;
  user_id: string;
  session_date: string;
  check_in_time: string;
  check_in_method: string;
  user?: {
    id: string;
    name: string;
    email: string;
    cms_id?: number;
    gender?: string;
    role?: string;
  };
  time_slot?: {
    id: string;
    start_time: string;
    end_time: string;
    gender_restriction: string;
    max_capacity: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: {
    attendance: AttendanceRecord[];
    count: number;
    sessionDate?: string;
    timeSlot?: {
      id: string;
      start_time: string;
      end_time: string;
      max_capacity: number;
    };
  };
}

export interface AttendanceCountResponse {
  success: boolean;
  data: {
    currentCount: number;
    maxCapacity: number;
    availableSpots: number;
    sessionDate: string;
  };
}

export interface AttendanceHistoryResponse {
  success: boolean;
  data: {
    history: AttendanceRecord[];
    count: number;
  };
}

export interface WaitlistEntry {
  id: string;
  time_slot_id: string;
  user_id: string;
  session_date: string;
  position: number;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface WaitlistResponse {
  success: boolean;
  message?: string;
  waitlist?: {
    id: string;
    position: number;
    status: string;
  };
  data?: {
    waitlist: WaitlistEntry[];
    count: number;
  };
}

export interface Rule {
  id: string;
  title: string;
  content: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RulesResponse {
  success: boolean;
  data: {
    rules: Rule[];
    count: number;
  };
}

// ==================== SERVICE ====================

export const swimmingService = {
  /**
   * Get all time slots with optional filters
   */
  getTimeSlots: async (params?: {
    gender?: string;
    active?: boolean;
  }): Promise<TimeSlotsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.gender) queryParams.append('gender', params.gender);
    if (params?.active !== undefined) {
      // Convert boolean to string 'true' or 'false'
      queryParams.append('active', params.active ? 'true' : 'false');
    }
    
    const url = `/swimming/time-slots${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get specific time slot by ID
   */
  getTimeSlotById: async (id: string): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.get(`/swimming/time-slots/${id}`);
    return response.data;
  },

  /**
   * Scan QR code for attendance
   */
  scanQRCode: async (qrCodeValue: string): Promise<QRScanResponse> => {
    const response = await axiosInstance.post('/swimming/attendance/scan-qr', {
      qrCodeValue,
    });
    return response.data;
  },

  /**
   * Get attendance for a time slot
   */
  getAttendance: async (
    timeSlotId: string,
    date?: string
  ): Promise<AttendanceResponse> => {
    const url = date
      ? `/swimming/attendance/${timeSlotId}?date=${date}`
      : `/swimming/attendance/${timeSlotId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get current attendance count for a time slot
   */
  getCurrentCount: async (
    timeSlotId: string,
    date?: string
  ): Promise<AttendanceCountResponse> => {
    const url = date
      ? `/swimming/attendance/current-count/${timeSlotId}?date=${date}`
      : `/swimming/attendance/current-count/${timeSlotId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get user's attendance history
   */
  getUserHistory: async (limit?: number): Promise<AttendanceHistoryResponse> => {
    const url = limit
      ? `/swimming/attendance/user/history?limit=${limit}`
      : '/swimming/attendance/user/history';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Join waitlist for a time slot
   */
  joinWaitlist: async (
    timeSlotId: string,
    sessionDate: string
  ): Promise<WaitlistResponse> => {
    const response = await axiosInstance.post('/swimming/waitlist/join', {
      timeSlotId,
      sessionDate,
    });
    return response.data;
  },

  /**
   * Leave waitlist
   */
  leaveWaitlist: async (
    timeSlotId: string,
    sessionDate: string
  ): Promise<WaitlistResponse> => {
    const response = await axiosInstance.delete('/swimming/waitlist/leave', {
      data: {
        timeSlotId,
        sessionDate,
      },
    });
    return response.data;
  },

  /**
   * Get waitlist for a time slot
   */
  getWaitlist: async (
    timeSlotId: string,
    date?: string
  ): Promise<WaitlistResponse> => {
    const url = date
      ? `/swimming/waitlist/${timeSlotId}?date=${date}`
      : `/swimming/waitlist/${timeSlotId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get all rules and regulations
   */
  getRules: async (): Promise<RulesResponse> => {
    const response = await axiosInstance.get('/swimming/rules');
    return response.data;
  },
};
