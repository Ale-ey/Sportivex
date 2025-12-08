import { create } from 'zustand';
import type { TimeSlot } from '@/services/swimmingService';

interface AdminSwimmingState {
  // Time Slots
  timeSlots: TimeSlot[];
  loadingSlots: boolean;
  slotsError: string | null;

  // Actions
  setTimeSlots: (slots: TimeSlot[]) => void;
  setLoadingSlots: (loading: boolean) => void;
  setSlotsError: (error: string | null) => void;
  
  // Helper actions
  addTimeSlot: (slot: TimeSlot) => void;
  updateTimeSlot: (id: string, slot: Partial<TimeSlot>) => void;
  removeTimeSlot: (id: string) => void;
  clearAll: () => void;
}

const useAdminSwimmingStore = create<AdminSwimmingState>()((set) => ({
  // Initial state
  timeSlots: [],
  loadingSlots: false,
  slotsError: null,

  // Actions
  setTimeSlots: (slots) =>
    set({ timeSlots: slots, slotsError: null }),
  setLoadingSlots: (loading) => set({ loadingSlots: loading }),
  setSlotsError: (error) => set({ slotsError: error }),

  // Helper actions
  addTimeSlot: (slot) =>
    set((state) => ({
      timeSlots: [...state.timeSlots, slot],
    })),
  updateTimeSlot: (id, updates) =>
    set((state) => ({
      timeSlots: state.timeSlots.map((slot) =>
        slot.id === id ? { ...slot, ...updates } : slot
      ),
    })),
  removeTimeSlot: (id) =>
    set((state) => ({
      timeSlots: state.timeSlots.filter((slot) => slot.id !== id),
    })),
  clearAll: () =>
    set({
      timeSlots: [],
      loadingSlots: false,
      slotsError: null,
    }),
}));

export default useAdminSwimmingStore;

