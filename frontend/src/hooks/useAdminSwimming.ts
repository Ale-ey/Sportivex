import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { swimmingService } from '@/services/swimmingService';
import { adminService } from '@/services/adminService';
import useAdminSwimmingStore from '@/stores/adminSwimmingStore';
import type { TimeSlot } from '@/services/swimmingService';
import type { CreateTimeSlotRequest, UpdateTimeSlotRequest } from '@/services/adminService';

/**
 * Custom hook for admin swimming operations
 * Provides all admin-side swimming functionality with Zustand state management
 */
export const useAdminSwimming = () => {
  const {
    timeSlots,
    loadingSlots,
    slotsError,
    setTimeSlots,
    setLoadingSlots,
    setSlotsError,
    addTimeSlot,
    updateTimeSlot,
    removeTimeSlot,
  } = useAdminSwimmingStore();

  /**
   * Fetch all time slots (no filters - shows ALL slots including inactive)
   * Admin should see all slots from the database regardless of status
   */
  const fetchTimeSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      // Fetch ALL slots without any filters (no active filter, no gender filter)
      // This ensures admin sees all slots including inactive ones
      const response = await swimmingService.getTimeSlots();
      if (response.success) {
        // Sort slots by start_time for better organization
        const sortedSlots = [...(response.data.timeSlots || [])].sort((a, b) => {
          if (a.start_time < b.start_time) return -1;
          if (a.start_time > b.start_time) return 1;
          return 0;
        });
        setTimeSlots(sortedSlots);
      } else {
        throw new Error(response.message || 'Failed to fetch time slots');
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : error instanceof Error
          ? error.message
          : 'Failed to fetch time slots';
      setSlotsError(errorMessage);
      toast.error(errorMessage, { id: 'fetchTimeSlotsError' });
    } finally {
      setLoadingSlots(false);
    }
  }, [setTimeSlots, setLoadingSlots, setSlotsError]);

  /**
   * Create a new time slot
   */
  const createTimeSlot = useCallback(
    async (data: CreateTimeSlotRequest) => {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const response = await adminService.createTimeSlot(data);
        if (response.success && response.data?.timeSlot) {
          addTimeSlot(response.data.timeSlot);
          toast.success('Time slot created successfully', {
            id: 'createTimeSlotSuccess',
          });
          return { success: true, data: response.data.timeSlot };
        } else {
          throw new Error(response.message || 'Failed to create time slot');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : error instanceof Error
            ? error.message
            : 'Failed to create time slot';
        setSlotsError(errorMessage);
        toast.error(errorMessage, { id: 'createTimeSlotError' });
        return { success: false, error: errorMessage };
      } finally {
        setLoadingSlots(false);
      }
    },
    [addTimeSlot, setLoadingSlots, setSlotsError]
  );

  /**
   * Update an existing time slot
   */
  const updateTimeSlotById = useCallback(
    async (id: string, data: UpdateTimeSlotRequest) => {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const response = await adminService.updateTimeSlot(id, data);
        if (response.success && response.data?.timeSlot) {
          updateTimeSlot(id, response.data.timeSlot);
          toast.success('Time slot updated successfully', {
            id: 'updateTimeSlotSuccess',
          });
          return { success: true, data: response.data.timeSlot };
        } else {
          throw new Error(response.message || 'Failed to update time slot');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : error instanceof Error
            ? error.message
            : 'Failed to update time slot';
        setSlotsError(errorMessage);
        toast.error(errorMessage, { id: 'updateTimeSlotError' });
        return { success: false, error: errorMessage };
      } finally {
        setLoadingSlots(false);
      }
    },
    [updateTimeSlot, setLoadingSlots, setSlotsError]
  );

  /**
   * Delete a time slot
   */
  const deleteTimeSlot = useCallback(
    async (id: string) => {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const response = await adminService.deleteTimeSlot(id);
        if (response.success) {
          removeTimeSlot(id);
          toast.success('Time slot deleted successfully', {
            id: 'deleteTimeSlotSuccess',
          });
          return { success: true };
        } else {
          throw new Error(response.message || 'Failed to delete time slot');
        }
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : error instanceof Error
            ? error.message
            : 'Failed to delete time slot';
        setSlotsError(errorMessage);
        toast.error(errorMessage, { id: 'deleteTimeSlotError' });
        return { success: false, error: errorMessage };
      } finally {
        setLoadingSlots(false);
      }
    },
    [removeTimeSlot, setLoadingSlots, setSlotsError]
  );

  return {
    // State
    timeSlots,
    loadingSlots,
    slotsError,

    // Actions
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlotById,
    deleteTimeSlot,
  };
};

