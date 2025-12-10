import axiosInstance from '@/lib/axiosInstance';
import type { TimeSlot } from './swimmingService';
import type { Court } from './badmintonService';

// ==================== TYPES ====================

export interface CreateTimeSlotRequest {
  startTime: string;
  endTime: string;
  genderRestriction: 'male' | 'female' | 'faculty_pg' | 'mixed';
  trainerId?: string;
  maxCapacity: number;
}

export interface UpdateTimeSlotRequest {
  startTime?: string;
  endTime?: string;
  genderRestriction?: 'male' | 'female' | 'faculty_pg' | 'mixed';
  trainerId?: string;
  maxCapacity?: number;
  isActive?: boolean;
}

export interface TimeSlotResponse {
  success: boolean;
  message?: string;
  data: {
    timeSlot: TimeSlot;
  };
}

export interface UpdateCourtRequest {
  status: 'available' | 'occupied' | 'maintenance';
}

export interface CourtResponse {
  success: boolean;
  message?: string;
  court?: Court;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  sport_type: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  prize?: string;
  registration_fee?: number;
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
  registration_enabled?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeagueRegistration {
  id: string;
  league_id: string;
  user_id: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'withdrawn';
  registered_at: string;
  confirmed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  payment_status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  amount_paid?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    cms_id: number;
    role: string;
    institution?: string;
    phone?: string;
    gender?: string;
    profile_picture_url?: string;
  };
}

export interface LeagueRegistrationsResponse {
  success: boolean;
  data: {
    registrations: LeagueRegistration[];
    count: number;
  };
}

export interface CreateLeagueRequest {
  name: string;
  description?: string;
  sport_type: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  prize?: string;
  registration_fee?: number;
}

export interface UpdateLeagueRequest {
  name?: string;
  description?: string;
  sport_type?: string;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  max_participants?: number;
  prize?: string;
  registration_fee?: number;
  status?: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
}

export interface LeagueResponse {
  success: boolean;
  message?: string;
  data: {
    league: League;
  };
}

export interface LeaguesResponse {
  success: boolean;
  data: {
    leagues: League[];
    count: number;
  };
}

export interface QRCode {
  id: string;
  qr_code_value: string;
  location_name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QRCodesResponse {
  success: boolean;
  data: {
    qrCodes: QRCode[];
    count: number;
  };
}

export interface CreateQRCodeRequest {
  qrCodeValue: string;
  locationName: string;
  description?: string;
}

export interface QRCodeResponse {
  success: boolean;
  message?: string;
  data: {
    qrCode: QRCode;
  };
}

// ==================== SERVICE ====================

export const adminService = {
  // ==================== SWIMMING SLOTS ====================
  
  /**
   * Create swimming time slot
   */
  createTimeSlot: async (data: CreateTimeSlotRequest): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.post('/swimming/time-slots', data);
    return response.data;
  },

  /**
   * Update swimming time slot
   */
  updateTimeSlot: async (id: string, data: UpdateTimeSlotRequest): Promise<TimeSlotResponse> => {
    const response = await axiosInstance.put(`/swimming/time-slots/${id}`, data);
    return response.data;
  },

  /**
   * Delete swimming time slot
   */
  deleteTimeSlot: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/swimming/time-slots/${id}`);
    return response.data;
  },

  // ==================== BADMINTON COURTS ====================
  
  /**
   * Update court status (close/open)
   */
  updateCourtStatus: async (courtId: string, status: 'available' | 'occupied' | 'maintenance'): Promise<CourtResponse> => {
    const response = await axiosInstance.put(`/badminton/courts/${courtId}/status`, { status });
    return response.data;
  },

  // ==================== LEAGUES ====================
  
  /**
   * Get all leagues
   */
  getLeagues: async (): Promise<LeaguesResponse> => {
    const response = await axiosInstance.get('/leagues');
    return response.data;
  },

  /**
   * Get league by ID
   */
  getLeagueById: async (id: string): Promise<LeagueResponse> => {
    const response = await axiosInstance.get(`/leagues/${id}`);
    return response.data;
  },

  /**
   * Create league
   */
  createLeague: async (data: CreateLeagueRequest): Promise<LeagueResponse> => {
    const response = await axiosInstance.post('/leagues', data);
    return response.data;
  },

  /**
   * Update league
   */
  updateLeague: async (id: string, data: UpdateLeagueRequest): Promise<LeagueResponse> => {
    const response = await axiosInstance.put(`/leagues/${id}`, data);
    return response.data;
  },

  /**
   * Delete league
   */
  deleteLeague: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/leagues/${id}`);
    return response.data;
  },

  /**
   * Toggle registration enabled/disabled for a league
   */
  toggleLeagueRegistration: async (id: string, enabled: boolean): Promise<LeagueResponse> => {
    const response = await axiosInstance.put(`/leagues/${id}/registration-status`, { enabled });
    return response.data;
  },

  /**
   * Get all registrations for a league
   */
  getLeagueRegistrations: async (id: string): Promise<LeagueRegistrationsResponse> => {
    const response = await axiosInstance.get(`/leagues/${id}/registrations`);
    return response.data;
  },

  // ==================== QR CODES ====================
  
  /**
   * Get all QR codes
   */
  getQRCodes: async (): Promise<QRCodesResponse> => {
    const response = await axiosInstance.get('/swimming/qr-codes');
    return response.data;
  },

  /**
   * Create QR code
   */
  createQRCode: async (data: CreateQRCodeRequest): Promise<QRCodeResponse> => {
    const response = await axiosInstance.post('/swimming/qr-codes', data);
    return response.data;
  },

  /**
   * Update QR code
   */
  updateQRCode: async (id: string, data: Partial<CreateQRCodeRequest>): Promise<QRCodeResponse> => {
    const response = await axiosInstance.put(`/swimming/qr-codes/${id}`, data);
    return response.data;
  },

  /**
   * Delete QR code
   */
  deleteQRCode: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/swimming/qr-codes/${id}`);
    return response.data;
  },
};








