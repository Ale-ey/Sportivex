import { useState, useCallback } from 'react';
import { leagueService, type League, type LeagueRegistration } from '@/services/leagueService';
import toast from 'react-hot-toast';

export const useLeague = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leagueService.getLeagues();
      if (response.success) {
        setLeagues(response.data.leagues);
      } else {
        throw new Error('Failed to fetch leagues');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch leagues';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerForLeague = useCallback(async (leagueId: string) => {
    try {
      const response = await leagueService.registerForLeague(leagueId);
      if (response.success) {
        toast.success('Successfully registered for league!');
        return response.data.registration;
      } else {
        throw new Error(response.message || 'Failed to register');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to register for league';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const cancelRegistration = useCallback(async (leagueId: string) => {
    try {
      const response = await leagueService.cancelRegistration(leagueId);
      if (response.success) {
        toast.success('Registration cancelled successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to cancel registration');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel registration';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getUserRegistration = useCallback(async (leagueId: string): Promise<LeagueRegistration | null> => {
    try {
      const response = await leagueService.getUserRegistration(leagueId);
      if (response.success) {
        return response.data.registration;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching user registration:', err);
      return null;
    }
  }, []);

  return {
    leagues,
    loading,
    error,
    fetchLeagues,
    registerForLeague,
    cancelRegistration,
    getUserRegistration,
  };
};

