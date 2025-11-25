import axiosInstance from '@/lib/axiosInstance';

// ==================== TYPES ====================

export interface Player {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  cms_id: number;
  role: string;
  gender: string | null;
  initials: string;
  available: boolean;
}

export interface Court {
  id: string;
  court_number: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  court_id: string;
  team1_player1_id: string;
  team1_player2_id?: string | null;
  team2_player1_id: string;
  team2_player2_id?: string | null;
  match_mode: '1v1' | '2v2';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_start_time: string;
  actual_start_time?: string | null;
  scheduled_end_time: string;
  actual_end_time?: string | null;
  created_by: string;
  court?: Court;
  team1_player1?: Player;
  team1_player2?: Player;
  team2_player1?: Player;
  team2_player2?: Player;
  created_at?: string;
  updated_at?: string;
}

export interface AvailablePlayersResponse {
  success: boolean;
  players: Player[];
}

export interface AvailabilityResponse {
  success: boolean;
  isAvailable: boolean;
}

export interface ToggleAvailabilityResponse {
  success: boolean;
  message: string;
  isAvailable: boolean;
}

export interface CourtsResponse {
  success: boolean;
  courts: Court[];
}

export interface CreateMatchRequest {
  courtId: string;
  team1Player1Id: string;
  team1Player2Id?: string;
  team2Player1Id: string;
  team2Player2Id?: string;
  matchMode: '1v1' | '2v2';
}

export interface CreateMatchResponse {
  success: boolean;
  message: string;
  match: Match;
}

export interface MatchResponse {
  success: boolean;
  message: string;
  match: Match;
}

export interface MatchesResponse {
  success: boolean;
  matches: Match[];
}

export interface FindMatchRequest {
  matchMode: '1v1' | '2v2';
  teamNumber: 1 | 2;
}

export interface FindMatchResponse {
  success: boolean;
  player: Player;
}

// ==================== SERVICE ====================

export const badmintonService = {
  /**
   * Get all available players
   */
  getAvailablePlayers: async (): Promise<AvailablePlayersResponse> => {
    const response = await axiosInstance.get('/badminton/players/available');
    return response.data;
  },

  /**
   * Get current user's availability status
   */
  getMyAvailability: async (): Promise<AvailabilityResponse> => {
    const response = await axiosInstance.get('/badminton/availability/me');
    return response.data;
  },

  /**
   * Toggle user availability
   */
  toggleAvailability: async (isAvailable: boolean): Promise<ToggleAvailabilityResponse> => {
    const response = await axiosInstance.post('/badminton/availability/toggle', {
      isAvailable,
    });
    return response.data;
  },

  /**
   * Get all courts
   */
  getCourts: async (): Promise<CourtsResponse> => {
    const response = await axiosInstance.get('/badminton/courts');
    return response.data;
  },

  /**
   * Get available courts at current time
   */
  getAvailableCourts: async (): Promise<CourtsResponse> => {
    const response = await axiosInstance.get('/badminton/courts/available');
    return response.data;
  },

  /**
   * Create a match
   */
  createMatch: async (matchData: CreateMatchRequest): Promise<CreateMatchResponse> => {
    const response = await axiosInstance.post('/badminton/matches', matchData);
    return response.data;
  },

  /**
   * Start a match
   */
  startMatch: async (matchId: string): Promise<MatchResponse> => {
    const response = await axiosInstance.post(`/badminton/matches/${matchId}/start`);
    return response.data;
  },

  /**
   * End a match
   */
  endMatch: async (matchId: string): Promise<MatchResponse> => {
    const response = await axiosInstance.post(`/badminton/matches/${matchId}/end`);
    return response.data;
  },

  /**
   * Get user's active matches
   */
  getMyMatches: async (): Promise<MatchesResponse> => {
    const response = await axiosInstance.get('/badminton/matches/my-matches');
    return response.data;
  },

  /**
   * Find match - auto-select random available player
   */
  findMatch: async (matchMode: '1v1' | '2v2', teamNumber: 1 | 2): Promise<FindMatchResponse> => {
    const response = await axiosInstance.post('/badminton/matches/find', {
      matchMode,
      teamNumber,
    });
    return response.data;
  },
};

