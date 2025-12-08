import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import useSwimmingStore from '@/stores/swimmingStore';
import {
  swimmingService,
  type TimeSlot,
 } from '@/services/swimmingService';
import { getCurrentUserId } from '@/utils/jwt';

/**
 * Custom hook for swimming module operations
 * Provides all user-side swimming functionality with state management
 */
export const useSwimming = () => {
  const {
    // State
    timeSlots,
    selectedTimeSlot,
    loadingTimeSlots,
    timeSlotsError,
    attendanceHistory,
    loadingHistory,
    historyError,
    waitlistEntries,
    userWaitlistPositions,
    loadingWaitlist,
    waitlistError,
    rules,
    loadingRules,
    rulesError,

    // Actions
    setTimeSlots,
    setSelectedTimeSlot,
    setLoadingTimeSlots,
    setTimeSlotsError,
    setAttendanceHistory,
    setLoadingHistory,
    setHistoryError,
    setWaitlistEntries,
    setUserWaitlistPosition,
    setLoadingWaitlist,
    setWaitlistError,
    setRules,
    setLoadingRules,
    setRulesError,
    updateTimeSlotCount,
    clearAll,
  } = useSwimmingStore();

  // ==================== TIME SLOTS ====================

  /**
   * Fetch all time slots
   */
  const fetchTimeSlots = useCallback(
    async (params?: { gender?: string; active?: boolean }) => {
      setLoadingTimeSlots(true);
      setTimeSlotsError(null);
      try {
        const response = await swimmingService.getTimeSlots(params);
        if (response.success) {
          setTimeSlots(response.data.timeSlots || []);
          
          // Log for debugging
          if (response.data.timeSlots.length === 0) {
            console.log('No time slots found. Response:', response);
          }
          
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch time slots');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch time slots';
        setTimeSlotsError(errorMessage);
        console.error('Error fetching time slots:', error);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingTimeSlots(false);
      }
    },
    [setTimeSlots, setLoadingTimeSlots, setTimeSlotsError]
  );

  /**
   * Fetch specific time slot by ID
   */
  const fetchTimeSlotById = useCallback(
    async (id: string) => {
      try {
        const response = await swimmingService.getTimeSlotById(id);
        if (response.success) {
          setSelectedTimeSlot(response.data.timeSlot);
          return { success: true, data: response.data.timeSlot };
        } else {
          throw new Error('Failed to fetch time slot');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch time slot';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [setSelectedTimeSlot]
  );

  // ==================== ATTENDANCE ====================

  /**
   * Scan QR code for attendance
   */
  const scanQRCode = useCallback(
    async (qrCodeValue: string) => {
      try {
        const response = await swimmingService.scanQRCode(qrCodeValue);
        if (response.success) {
          toast.success(response.message || 'Check-in successful!');
          
          // Update time slot count if provided
          if (response.timeSlot) {
            updateTimeSlotCount(
              response.timeSlot.id,
              response.timeSlot.currentCount
            );
          }
          
          // Refresh time slots to get updated counts
          await fetchTimeSlots();
          
          return { success: true, data: response };
        } else {
          if (response.capacityExceeded) {
            toast.error('This time slot has reached maximum capacity');
          } else if (response.alreadyCheckedIn) {
            toast.error('You have already checked in for this time slot today');
          } else {
            toast.error(response.message || 'Failed to check in');
          }
          return { success: false, data: response };
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to scan QR code';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [fetchTimeSlots, updateTimeSlotCount]
  );

  /**
   * Fetch attendance for a time slot
   */
  const fetchAttendance = useCallback(
    async (timeSlotId: string, date?: string) => {
      try {
        const response = await swimmingService.getAttendance(timeSlotId, date);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch attendance');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch attendance';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Fetch current attendance count for a time slot
   */
  const fetchCurrentCount = useCallback(
    async (timeSlotId: string, date?: string) => {
      try {
        const response = await swimmingService.getCurrentCount(timeSlotId, date);
        if (response.success) {
          updateTimeSlotCount(
            timeSlotId,
            response.data.currentCount
          );
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch attendance count');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch attendance count';
        return { success: false, error: errorMessage };
      }
    },
    [updateTimeSlotCount]
  );

  /**
   * Fetch user's attendance history
   */
  const fetchUserHistory = useCallback(
    async (limit?: number) => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const response = await swimmingService.getUserHistory(limit);
        if (response.success) {
          setAttendanceHistory(response.data.history);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch attendance history');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch attendance history';
        setHistoryError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingHistory(false);
      }
    },
    [setAttendanceHistory, setLoadingHistory, setHistoryError]
  );

  // ==================== WAITLIST ====================

  /**
   * Fetch waitlist for a time slot
   */
  const fetchWaitlist = useCallback(
    async (timeSlotId: string, date?: string) => {
      setLoadingWaitlist(true);
      setWaitlistError(null);
      try {
        const response = await swimmingService.getWaitlist(timeSlotId, date);
        if (response.success && response.data) {
          setWaitlistEntries(response.data.waitlist);
          
          // Update user's waitlist position if they're on the list
          const userId = getCurrentUserId();
          if (userId) {
            const userEntry = response.data.waitlist.find(
              (entry) => entry.user_id === userId
            );
            if (userEntry) {
              setUserWaitlistPosition(timeSlotId, userEntry.position);
            } else {
              setUserWaitlistPosition(timeSlotId, null);
            }
          }
          
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to fetch waitlist');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to fetch waitlist';
        setWaitlistError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWaitlist(false);
      }
    },
    [
      setLoadingWaitlist,
      setWaitlistError,
      setWaitlistEntries,
      setUserWaitlistPosition,
    ]
  );

  /**
   * Join waitlist for a time slot
   */
  const joinWaitlist = useCallback(
    async (timeSlotId: string, sessionDate?: string) => {
      setLoadingWaitlist(true);
      setWaitlistError(null);
      try {
        const date = sessionDate || new Date().toISOString().split('T')[0];
        const response = await swimmingService.joinWaitlist(timeSlotId, date);
        if (response.success) {
          toast.success(
            response.message || 'Successfully added to waitlist'
          );
          
          // Update user's waitlist position if provided
          if (response.waitlist) {
            setUserWaitlistPosition(timeSlotId, response.waitlist.position);
          }
          
          // Refresh waitlist and time slots
          await Promise.all([
            fetchWaitlist(timeSlotId, date),
            fetchTimeSlots(),
          ]);
          
          return { success: true, data: response };
        } else {
          const errorMessage = response.message || 'Failed to join waitlist';
          setWaitlistError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to join waitlist';
        setWaitlistError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWaitlist(false);
      }
    },
    [
      setLoadingWaitlist,
      setWaitlistError,
      setUserWaitlistPosition,
      fetchWaitlist,
      fetchTimeSlots,
    ]
  );

  /**
   * Leave waitlist
   */
  const leaveWaitlist = useCallback(
    async (timeSlotId: string, sessionDate?: string) => {
      setLoadingWaitlist(true);
      setWaitlistError(null);
      try {
        const date = sessionDate || new Date().toISOString().split('T')[0];
        const response = await swimmingService.leaveWaitlist(timeSlotId, date);
        if (response.success) {
          toast.success(
            response.message || 'Successfully removed from waitlist'
          );
          
          // Clear user's waitlist position
          setUserWaitlistPosition(timeSlotId, null);
          
          // Refresh waitlist and time slots
          await Promise.all([
            fetchWaitlist(timeSlotId, date),
            fetchTimeSlots(),
          ]);
          
          return { success: true, data: response };
        } else {
          const errorMessage = response.message || 'Failed to leave waitlist';
          setWaitlistError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message
            : 'Failed to leave waitlist';
        setWaitlistError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoadingWaitlist(false);
      }
    },
    [
      setLoadingWaitlist,
      setWaitlistError,
      setUserWaitlistPosition,
      fetchWaitlist,
      fetchTimeSlots,
    ]
  );

  /**
   * Check if user is on waitlist for a time slot
   */
  const isUserOnWaitlist = useCallback(
    (timeSlotId: string): boolean => {
      return userWaitlistPositions.has(timeSlotId);
    },
    [userWaitlistPositions]
  );

  /**
   * Get user's waitlist position for a time slot
   */
  const getUserWaitlistPosition = useCallback(
    (timeSlotId: string): number | null => {
      return userWaitlistPositions.get(timeSlotId) || null;
    },
    [userWaitlistPositions]
  );

  // ==================== RULES ====================

  /**
   * Fetch all rules and regulations
   */
  const fetchRules = useCallback(async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      const response = await swimmingService.getRules();
      if (response.success) {
        setRules(response.data.rules);
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to fetch rules');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
          : 'Failed to fetch rules';
      setRulesError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingRules(false);
    }
  }, [setRules, setLoadingRules, setRulesError]);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format time string to readable format
   */
  const formatTime = useCallback((time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  /**
   * Format time range
   */
  const formatTimeRange = useCallback(
    (start: string, end: string): string => {
      return `${formatTime(start)} - ${formatTime(end)}`;
    },
    [formatTime]
  );

  /**
   * Check if slot is full
   */
  const isSlotFull = useCallback((slot: TimeSlot): boolean => {
    return (slot.availableSpots || 0) <= 0;
  }, []);

  /**
   * Check if slot is in the past (ended)
   */
  const isPastSlot = useCallback((slot: TimeSlot): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    return currentTime > slot.end_time;
  }, []);

  /**
   * Check if slot is currently active
   */
  const isCurrentSlot = useCallback((slot: TimeSlot): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    return currentTime >= slot.start_time && currentTime <= slot.end_time;
  }, []);

  /**
   * Check if slot is in the future (upcoming)
   */
  const isUpcomingSlot = useCallback((slot: TimeSlot): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    return currentTime < slot.start_time;
  }, []);

  /**
   * Get slot status
   */
  const getSlotStatus = useCallback(
    (slot: TimeSlot): 'available' | 'full' | 'current' | 'ended' | 'upcoming' => {
      if (isPastSlot(slot)) return 'ended';
      if (isCurrentSlot(slot)) return 'current';
      if (isUpcomingSlot(slot)) return 'upcoming';
      if (isSlotFull(slot)) return 'full';
      return 'available';
    },
    [isPastSlot, isCurrentSlot, isUpcomingSlot, isSlotFull]
  );

  /**
   * Check if slot can be reserved (not past, not full, and is active)
   */
  const canReserveSlot = useCallback(
    (slot: TimeSlot): boolean => {
      return !isPastSlot(slot) && !isSlotFull(slot) && (slot.is_active ?? true);
    },
    [isPastSlot, isSlotFull]
  );

  return {
    // State
    timeSlots,
    selectedTimeSlot,
    loadingTimeSlots,
    timeSlotsError,
    attendanceHistory,
    loadingHistory,
    historyError,
    waitlistEntries,
    userWaitlistPositions,
    loadingWaitlist,
    waitlistError,
    rules,
    loadingRules,
    rulesError,

    // Actions
    fetchTimeSlots,
    fetchTimeSlotById,
    scanQRCode,
    fetchAttendance,
    fetchCurrentCount,
    fetchUserHistory,
    joinWaitlist,
    leaveWaitlist,
    fetchWaitlist,
    isUserOnWaitlist,
    getUserWaitlistPosition,
    fetchRules,

    // Utilities
    formatTime,
    formatTimeRange,
    isSlotFull,
    isPastSlot,
    isCurrentSlot,
    isUpcomingSlot,
    getSlotStatus,
    canReserveSlot,
    clearAll,
  };
};

