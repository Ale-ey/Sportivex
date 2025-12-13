import axiosInstance from '@/lib/axiosInstance';

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
  participant_count?: number; // Number of registered participants
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
}

export interface LeaguesResponse {
  success: boolean;
  data: {
    leagues: League[];
    count: number;
  };
}

export interface LeagueResponse {
  success: boolean;
  data: {
    league: League;
  };
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  data: {
    registration: LeagueRegistration;
    requiresPayment?: boolean;
    checkoutUrl?: string;
    sessionId?: string;
  };
}

export interface UserRegistrationResponse {
  success: boolean;
  data: {
    registration: LeagueRegistration | null;
  };
}

export const leagueService = {
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
   * Register for a league
   */
  registerForLeague: async (leagueId: string): Promise<RegistrationResponse> => {
    const response = await axiosInstance.post(`/leagues/${leagueId}/register`);
    return response.data;
  },

  /**
   * Get user's registration status for a league
   */
  getUserRegistration: async (leagueId: string): Promise<UserRegistrationResponse> => {
    const response = await axiosInstance.get(`/leagues/${leagueId}/registration`);
    return response.data;
  },

  /**
   * Cancel registration for a league
   */
  cancelRegistration: async (leagueId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/leagues/${leagueId}/registration`);
    return response.data;
  },

  /**
   * Verify league registration payment
   */
  verifyLeaguePayment: async (data: { registrationId: string; sessionId: string }): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.post('/leagues/verify-payment', data);
    return response.data;
  },
};

