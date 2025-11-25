import { create } from 'zustand';
import type {
  Player,
  Court,
  Match,
} from '@/services/badmintonService';

interface BadmintonState {
  // Players
  availablePlayers: Player[];
  loadingPlayers: boolean;
  playersError: string | null;

  // Availability
  myAvailability: boolean;
  loadingAvailability: boolean;
  availabilityError: string | null;

  // Courts
  courts: Court[];
  availableCourts: Court[];
  selectedCourt: Court | null;
  loadingCourts: boolean;
  courtsError: string | null;

  // Matches
  currentMatch: Match | null;
  myMatches: Match[];
  loadingMatches: boolean;
  matchesError: string | null;

  // Match Setup
  matchMode: '1v1' | '2v2';
  team1: Player[];
  team2: Player[];
  timeRemaining: number; // in seconds

  // Actions - Players
  setAvailablePlayers: (players: Player[]) => void;
  setLoadingPlayers: (loading: boolean) => void;
  setPlayersError: (error: string | null) => void;

  // Actions - Availability
  setMyAvailability: (available: boolean) => void;
  setLoadingAvailability: (loading: boolean) => void;
  setAvailabilityError: (error: string | null) => void;

  // Actions - Courts
  setCourts: (courts: Court[]) => void;
  setAvailableCourts: (courts: Court[]) => void;
  setSelectedCourt: (court: Court | null) => void;
  setLoadingCourts: (loading: boolean) => void;
  setCourtsError: (error: string | null) => void;

  // Actions - Matches
  setCurrentMatch: (match: Match | null) => void;
  setMyMatches: (matches: Match[]) => void;
  setLoadingMatches: (loading: boolean) => void;
  setMatchesError: (error: string | null) => void;

  // Actions - Match Setup
  setMatchMode: (mode: '1v1' | '2v2') => void;
  setTeam1: (team: Player[]) => void;
  setTeam2: (team: Player[]) => void;
  setTimeRemaining: (seconds: number) => void;
  addPlayerToTeam: (player: Player, team: 1 | 2) => void;
  removePlayerFromTeam: (playerId: string, team: 1 | 2) => void;
  clearTeams: () => void;

  // Helper actions
  updateCourtStatus: (courtId: string, status: 'available' | 'occupied' | 'maintenance') => void;
  clearAll: () => void;
}

const useBadmintonStore = create<BadmintonState>()(
  (set) => ({
    // Initial state - Players
    availablePlayers: [],
    loadingPlayers: false,
    playersError: null,

    // Initial state - Availability
    myAvailability: false,
    loadingAvailability: false,
    availabilityError: null,

    // Initial state - Courts
    courts: [],
    availableCourts: [],
    selectedCourt: null,
    loadingCourts: false,
    courtsError: null,

    // Initial state - Matches
    currentMatch: null,
    myMatches: [],
    loadingMatches: false,
    matchesError: null,

    // Initial state - Match Setup
    matchMode: '1v1',
    team1: [],
    team2: [],
    timeRemaining: 0,

    // Actions - Players
    setAvailablePlayers: (players) =>
      set({ availablePlayers: players, playersError: null }),
    setLoadingPlayers: (loading) => set({ loadingPlayers: loading }),
    setPlayersError: (error) => set({ playersError: error }),

    // Actions - Availability
    setMyAvailability: (available) => set({ myAvailability: available }),
    setLoadingAvailability: (loading) => set({ loadingAvailability: loading }),
    setAvailabilityError: (error) => set({ availabilityError: error }),

    // Actions - Courts
    setCourts: (courts) => set({ courts, courtsError: null }),
    setAvailableCourts: (courts) => set({ availableCourts: courts }),
    setSelectedCourt: (court) => set({ selectedCourt: court }),
    setLoadingCourts: (loading) => set({ loadingCourts: loading }),
    setCourtsError: (error) => set({ courtsError: error }),

    // Actions - Matches
    setCurrentMatch: (match) => set({ currentMatch: match }),
    setMyMatches: (matches) => set({ myMatches: matches, matchesError: null }),
    setLoadingMatches: (loading) => set({ loadingMatches: loading }),
    setMatchesError: (error) => set({ matchesError: error }),

    // Actions - Match Setup
    setMatchMode: (mode) => set({ matchMode: mode }),
    setTeam1: (team) => set({ team1: team }),
    setTeam2: (team) => set({ team2: team }),
    setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
    
    addPlayerToTeam: (player, team) =>
      set((state) => {
        const targetTeam = team === 1 ? state.team1 : state.team2;
        const maxPlayers = state.matchMode === '1v1' ? 1 : 2;
        
        // Check if player already in any team
        const isInTeam1 = state.team1.some((p) => p.id === player.id);
        const isInTeam2 = state.team2.some((p) => p.id === player.id);
        if (isInTeam1 || isInTeam2) {
          return state; // Don't add if already in a team
        }

        // Check if team is full
        if (targetTeam.length >= maxPlayers) {
          return state; // Don't add if team is full
        }

        const newTeam = [...targetTeam, player];
        return team === 1 ? { team1: newTeam } : { team2: newTeam };
      }),

    removePlayerFromTeam: (playerId, team) =>
      set((state) => {
        const targetTeam = team === 1 ? state.team1 : state.team2;
        const newTeam = targetTeam.filter((p) => p.id !== playerId);
        return team === 1 ? { team1: newTeam } : { team2: newTeam };
      }),

    clearTeams: () => set({ team1: [], team2: [] }),

    // Helper actions
    updateCourtStatus: (courtId, status) =>
      set((state) => ({
        courts: state.courts.map((court) =>
          court.id === courtId ? { ...court, status } : court
        ),
        availableCourts: state.availableCourts.map((court) =>
          court.id === courtId ? { ...court, status } : court
        ),
        selectedCourt:
          state.selectedCourt?.id === courtId
            ? { ...state.selectedCourt, status }
            : state.selectedCourt,
      })),

    clearAll: () =>
      set({
        availablePlayers: [],
        courts: [],
        availableCourts: [],
        selectedCourt: null,
        currentMatch: null,
        myMatches: [],
        team1: [],
        team2: [],
        timeRemaining: 0,
        playersError: null,
        availabilityError: null,
        courtsError: null,
        matchesError: null,
      }),
  })
);

export default useBadmintonStore;

