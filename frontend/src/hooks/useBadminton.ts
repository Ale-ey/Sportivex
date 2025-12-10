import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import useBadmintonStore from '@/stores/badmintonStore';
import {
  badmintonService,
  type Player,
  type Court,
} from '@/services/badmintonService';
import { socketService } from '@/services/socketService';
import { useGetProfile } from '@/hooks/useAuth';

/**
 * Custom hook for badminton module operations
 * Provides all user-side badminton functionality with state management
 */
export const useBadminton = () => {
  const { user } = useGetProfile();

  const {
    // State - Players
    availablePlayers,
    loadingPlayers,
    playersError,

    // State - Availability
    myAvailability,
    loadingAvailability,
    availabilityError,

    // State - Courts
    courts,
    availableCourts,
    selectedCourt,
    loadingCourts,
    courtsError,

    // State - Matches
    currentMatch,
    myMatches,
    loadingMatches,
    matchesError,

    // State - Match Setup
    matchMode,
    team1,
    team2,
    timeRemaining,

    // Actions - Players
    setAvailablePlayers,
    setLoadingPlayers,
    setPlayersError,

    // Actions - Availability
    setMyAvailability,
    setLoadingAvailability,
    setAvailabilityError,

    // Actions - Courts
    setCourts,
    setAvailableCourts,
    setSelectedCourt,
    setLoadingCourts,
    setCourtsError,

    // Actions - Matches
    setCurrentMatch,
    setMyMatches,
    setLoadingMatches,
    setMatchesError,

    // Actions - Match Setup
    setMatchMode: setMatchModeState,

    setTimeRemaining,
    addPlayerToTeam,
    removePlayerFromTeam,
    clearTeams,

    // Helper actions
    updateCourtStatus,
    clearAll,
  } = useBadmintonStore();

  // ==================== PLAYERS ====================

  /**
   * Fetch all available players
   */
  const fetchAvailablePlayers = useCallback(async () => {
    setLoadingPlayers(true);
    setPlayersError(null);
    try {
      const response = await badmintonService.getAvailablePlayers();
      if (response.success) {
        setAvailablePlayers(response.players);
        return { success: true, players: response.players };
      } else {
        throw new Error('Failed to fetch available players');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch available players';
      setPlayersError(errorMessage);
      console.error('Error fetching available players:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingPlayers(false);
    }
  }, [setAvailablePlayers, setLoadingPlayers, setPlayersError]);

  // ==================== AVAILABILITY ====================

  /**
   * Fetch current user's availability status
   */
  const fetchMyAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    setAvailabilityError(null);
    try {
      const response = await badmintonService.getMyAvailability();
      if (response.success) {
        setMyAvailability(response.isAvailable);
        return { success: true, isAvailable: response.isAvailable };
      } else {
        throw new Error('Failed to fetch availability status');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch availability status';
      setAvailabilityError(errorMessage);
      console.error('Error fetching availability:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingAvailability(false);
    }
  }, [setMyAvailability, setLoadingAvailability, setAvailabilityError]);

  /**
   * Toggle user availability
   */
  const toggleAvailability = useCallback(
    async (isAvailable: boolean) => {
      setLoadingAvailability(true);
      setAvailabilityError(null);
      try {
        const response = await badmintonService.toggleAvailability(isAvailable);
        if (response.success) {
          setMyAvailability(response.isAvailable);
          toast.success(response.message);
          
          // Refresh available players list
          await fetchAvailablePlayers();
          
          return { success: true, isAvailable: response.isAvailable };
        } else {
          throw new Error('Failed to update availability');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to update availability';
        setAvailabilityError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingAvailability(false);
      }
    },
    [setMyAvailability, setLoadingAvailability, setAvailabilityError, fetchAvailablePlayers]
  );

  // ==================== COURTS ====================

  /**
   * Fetch all courts
   */
  const fetchCourts = useCallback(async () => {
    setLoadingCourts(true);
    setCourtsError(null);
    try {
      const response = await badmintonService.getCourts();
      if (response.success) {
        setCourts(response.courts);
        return { success: true, courts: response.courts };
      } else {
        throw new Error('Failed to fetch courts');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch courts';
      setCourtsError(errorMessage);
      console.error('Error fetching courts:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingCourts(false);
    }
  }, [setCourts, setLoadingCourts, setCourtsError]);

  /**
   * Fetch available courts at current time
   */
  const fetchAvailableCourts = useCallback(async () => {
    setLoadingCourts(true);
    setCourtsError(null);
    try {
      const response = await badmintonService.getAvailableCourts();
      if (response.success) {
        setAvailableCourts(response.courts);
        return { success: true, courts: response.courts };
      } else {
        throw new Error('Failed to fetch available courts');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch available courts';
      setCourtsError(errorMessage);
      console.error('Error fetching available courts:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingCourts(false);
    }
  }, [setAvailableCourts, setLoadingCourts, setCourtsError]);

  /**
   * Select a court
   */
  const selectCourt = useCallback(
    (court: Court | null) => {
      setSelectedCourt(court);
    },
    [setSelectedCourt]
  );

  // ==================== MATCHES ====================

  /**
   * Fetch user's active matches
   */
  const fetchMyMatches = useCallback(async () => {
    setLoadingMatches(true);
    setMatchesError(null);
    try {
      const response = await badmintonService.getMyMatches();
      if (response.success) {
        setMyMatches(response.matches);
        
        // Set current match if there's an active one (prioritize in_progress over scheduled)
        const inProgressMatch = response.matches.find(
          (m) => m.status === 'in_progress'
        );
        const scheduledMatch = response.matches.find(
          (m) => m.status === 'scheduled'
        );
        const activeMatch = inProgressMatch || scheduledMatch;
        
        if (activeMatch) {
          setCurrentMatch(activeMatch);
          
          // Calculate and set time remaining for in-progress matches
          if (activeMatch.status === 'in_progress' && activeMatch.actual_start_time) {
            const startTime = new Date(activeMatch.actual_start_time).getTime();
            const endTime = startTime + 30 * 60 * 1000;
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
          } else {
            setTimeRemaining(0);
          }
        } else {
          setCurrentMatch(null);
          setTimeRemaining(0);
        }
        
        return { success: true, matches: response.matches };
      } else {
        throw new Error('Failed to fetch matches');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch matches';
      setMatchesError(errorMessage);
      console.error('Error fetching matches:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingMatches(false);
    }
  }, [setMyMatches, setCurrentMatch, setLoadingMatches, setMatchesError, setTimeRemaining]);

  /**
   * Create a match
   */
  const createMatch = useCallback(
    async (matchData: {
      courtId: string;
      team1Player1Id: string;
      team1Player2Id?: string;
      team2Player1Id: string;
      team2Player2Id?: string;
      matchMode: '1v1' | '2v2';
    }) => {
      setLoadingMatches(true);
      setMatchesError(null);
      try {
        const response = await badmintonService.createMatch(matchData);
        if (response.success) {
          setCurrentMatch(response.match);
          updateCourtStatus(response.match.court_id, 'occupied');
          toast.success(response.message || 'Match created successfully');
          return { success: true, match: response.match };
        } else {
          throw new Error('Failed to create match');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to create match';
        setMatchesError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingMatches(false);
      }
    },
    [setCurrentMatch, setLoadingMatches, setMatchesError, updateCourtStatus]
  );

  /**
   * Start a match
   */
  const startMatch = useCallback(
    async (matchId: string) => {
      setLoadingMatches(true);
      setMatchesError(null);
      try {
        const response = await badmintonService.startMatch(matchId);
        if (response.success) {
          setCurrentMatch(response.match);
          // Calculate time remaining from actual start time
          if (response.match.actual_start_time) {
            const startTime = new Date(response.match.actual_start_time).getTime();
            const endTime = startTime + 30 * 60 * 1000;
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
          } else {
            setTimeRemaining(30 * 60); // Fallback: 30 minutes in seconds
          }
          toast.success(response.message || 'Match started');
          return { success: true, match: response.match };
        } else {
          throw new Error('Failed to start match');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to start match';
        setMatchesError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingMatches(false);
      }
    },
    [setCurrentMatch, setLoadingMatches, setMatchesError, setTimeRemaining]
  );

  /**
   * End a match
   */
  const endMatch = useCallback(
    async (matchId: string) => {
      setLoadingMatches(true);
      setMatchesError(null);
      try {
        const response = await badmintonService.endMatch(matchId);
        if (response.success) {
          // Update court status if match had a court
          if (currentMatch?.court_id) {
            updateCourtStatus(currentMatch.court_id, 'available');
          }
          
          setCurrentMatch(null);
          setTimeRemaining(0);
          clearTeams();
          setSelectedCourt(null);
          
          // Refresh courts and matches
          await Promise.all([
            fetchAvailableCourts(),
            fetchMyMatches(),
          ]);
          
          toast.success(response.message || 'Match ended successfully');
          return { success: true, match: response.match };
        } else {
          throw new Error('Failed to end match');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to end match';
        setMatchesError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingMatches(false);
      }
    },
    [
      setCurrentMatch,
      setLoadingMatches,
      setMatchesError,
      setTimeRemaining,
      clearTeams,
      setSelectedCourt,
      updateCourtStatus,
      currentMatch,
      fetchAvailableCourts,
      fetchMyMatches,
    ]
  );

  /**
   * Find match - auto-select random available player
   */
  const findMatch = useCallback(
    async (matchMode: '1v1' | '2v2', teamNumber: 1 | 2) => {
      try {
        const response = await badmintonService.findMatch(matchMode, teamNumber);
        if (response.success) {
          return { success: true, player: response.player };
        } else {
          throw new Error('No available players found');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to find match';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // ==================== MATCH SETUP ====================

  /**
   * Set match mode
   */
  const setMatchMode = useCallback(
    (mode: '1v1' | '2v2') => {
      setMatchModeState(mode);
      // Clear teams when mode changes
      clearTeams();
    },
    [setMatchModeState, clearTeams]
  );

  /**
   * Add player to team
   */
  const addPlayer = useCallback(
    (player: Player, team: 1 | 2) => {
      addPlayerToTeam(player, team);
    },
    [addPlayerToTeam]
  );

  /**
   * Remove player from team
   */
  const removePlayer = useCallback(
    (playerId: string, team: 1 | 2) => {
      removePlayerFromTeam(playerId, team);
    },
    [removePlayerFromTeam]
  );

  /**
   * Check if teams are ready to start match
   */
  const areTeamsReady = useCallback((): boolean => {
    const playersPerTeam = matchMode === '1v1' ? 1 : 2;
    return (
      team1.length === playersPerTeam &&
      team2.length === playersPerTeam &&
      selectedCourt !== null
    );
  }, [matchMode, team1.length, team2.length, selectedCourt]);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format time remaining (seconds to MM:SS)
   */
  const formatTimeRemaining = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Check if match is in progress
   */
  const isMatchInProgress = useCallback((): boolean => {
    return currentMatch?.status === 'in_progress' || false;
  }, [currentMatch]);

  /**
   * Check if user is in current match
   */
  const isUserInMatch = useCallback(
    (userId: string): boolean => {
      if (!currentMatch) return false;
      return (
        currentMatch.team1_player1_id === userId ||
        currentMatch.team1_player2_id === userId ||
        currentMatch.team2_player1_id === userId ||
        currentMatch.team2_player2_id === userId
      );
    },
    [currentMatch]
  );

  // ==================== REAL-TIME WEBSOCKET ====================

  /**
   * Set up WebSocket connection for real-time updates
   */
  useEffect(() => {
    if (!user?.id) return;

    // Initialize socket connection
    socketService.initialize();

    // Register event handlers
    socketService.on({
      onAvailabilityChanged: async (data) => {
        console.log('Availability changed:', data);
        
        // Refresh available players list
        await fetchAvailablePlayers();
        
        // If it's the current user, update their availability
        if (data.userId === user.id) {
          setMyAvailability(data.isAvailable);
        }
      },

      onMatchChanged: async (data) => {
        console.log('Match changed:', data);
        
        // Check if current user is involved in this match
        const isInvolved = 
          data.team1Player1Id === user.id ||
          data.team1Player2Id === user.id ||
          data.team2Player1Id === user.id ||
          data.team2Player2Id === user.id;

        if (isInvolved) {
          // Refresh user's matches to get updated match data
          await fetchMyMatches();
        }

        // Always refresh available players (to remove/add players from list)
        await fetchAvailablePlayers();
        
        // Refresh available courts if match status changed
        if (data.status === 'completed' || data.status === 'cancelled') {
          await fetchAvailableCourts();
        }
      },

      onMatchUpdated: async (data) => {
        console.log('Match updated for user:', data);
        
        const match = data.match;
        
        // Check if current user is involved in this match
        const isInvolved = 
          match.team1_player1_id === user.id ||
          match.team1_player2_id === user.id ||
          match.team2_player1_id === user.id ||
          match.team2_player2_id === user.id;

        if (isInvolved) {
          // Always update current match if user is involved (even if not set before)
          setCurrentMatch(match);
          
          // Update time remaining if match is in progress
          if (match.status === 'in_progress' && match.actual_start_time) {
            const startTime = new Date(match.actual_start_time).getTime();
            const endTime = startTime + 30 * 60 * 1000;
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
          } else if (match.status === 'completed' || match.status === 'cancelled') {
            // Clear match state if completed or cancelled
            setCurrentMatch(null);
            setTimeRemaining(0);
            clearTeams();
            setSelectedCourt(null);
          }
          
          // Refresh available players and courts
          await Promise.all([
            fetchAvailablePlayers(),
            fetchAvailableCourts()
          ]);
        }
      },

      onConnect: () => {
        console.log('Socket connected for badminton module');
      },

      onDisconnect: (reason) => {
        console.log('Socket disconnected:', reason);
      },

      onError: (error) => {
        console.error('Socket error:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      socketService.off();
    };
  }, [
    user?.id, 
    currentMatch?.id, 
    fetchAvailablePlayers, 
    fetchMyMatches, 
    fetchAvailableCourts, 
    setMyAvailability, 
    setCurrentMatch, 
    setTimeRemaining,
    clearTeams,
    setSelectedCourt
  ]);

  return {
    // State - Players
    availablePlayers,
    loadingPlayers,
    playersError,

    // State - Availability
    myAvailability,
    loadingAvailability,
    availabilityError,

    // State - Courts
    courts,
    availableCourts,
    selectedCourt,
    loadingCourts,
    courtsError,

    // State - Matches
    currentMatch,
    myMatches,
    loadingMatches,
    matchesError,

    // State - Match Setup
    matchMode,
    team1,
    team2,
    timeRemaining,

    // Actions - Players
    fetchAvailablePlayers,

    // Actions - Availability
    fetchMyAvailability,
    toggleAvailability,

    // Actions - Courts
    fetchCourts,
    fetchAvailableCourts,
    selectCourt,

    // Actions - Matches
    createMatch,
    startMatch,
    endMatch,
    fetchMyMatches,
    findMatch,

    // Actions - Match Setup
    setMatchMode,
    addPlayer,
    removePlayer,
    clearTeams,
    areTeamsReady,

    // Utilities
    formatTimeRemaining,
    isMatchInProgress,
    isUserInMatch,
    clearAll,
    setTimeRemaining,
  };
};

