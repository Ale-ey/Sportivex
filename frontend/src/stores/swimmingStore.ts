import { create } from 'zustand';
import type {
  TimeSlot,
  AttendanceRecord,
  WaitlistEntry,
  Rule,
} from '@/services/swimmingService';

interface SwimmingState {
  // Time Slots
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  loadingTimeSlots: boolean;
  timeSlotsError: string | null;

  // Attendance
  attendanceHistory: AttendanceRecord[];
  loadingHistory: boolean;
  historyError: string | null;

  // Waitlist
  waitlistEntries: WaitlistEntry[];
  userWaitlistPositions: Map<string, number>; // Map of timeSlotId -> position
  loadingWaitlist: boolean;
  waitlistError: string | null;

  // Rules
  rules: Rule[];
  loadingRules: boolean;
  rulesError: string | null;

  // Actions
  setTimeSlots: (slots: TimeSlot[]) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setLoadingTimeSlots: (loading: boolean) => void;
  setTimeSlotsError: (error: string | null) => void;

  setAttendanceHistory: (history: AttendanceRecord[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  setHistoryError: (error: string | null) => void;

  setWaitlistEntries: (entries: WaitlistEntry[]) => void;
  setUserWaitlistPosition: (timeSlotId: string, position: number | null) => void;
  setLoadingWaitlist: (loading: boolean) => void;
  setWaitlistError: (error: string | null) => void;

  setRules: (rules: Rule[]) => void;
  setLoadingRules: (loading: boolean) => void;
  setRulesError: (error: string | null) => void;

  // Helper actions
  updateTimeSlotCount: (timeSlotId: string, currentCount: number) => void;
  clearAll: () => void;
}

const useSwimmingStore = create<SwimmingState>()(
  (set) => ({
      // Initial state
      timeSlots: [],
      selectedTimeSlot: null,
      loadingTimeSlots: false,
      timeSlotsError: null,

      attendanceHistory: [],
      loadingHistory: false,
      historyError: null,

      waitlistEntries: [],
      userWaitlistPositions: new Map(),
      loadingWaitlist: false,
      waitlistError: null,

      rules: [],
      loadingRules: false,
      rulesError: null,

      // Actions
      setTimeSlots: (slots) =>
        set({ timeSlots: slots, timeSlotsError: null }),
      setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
      setLoadingTimeSlots: (loading) => set({ loadingTimeSlots: loading }),
      setTimeSlotsError: (error) => set({ timeSlotsError: error }),

      setAttendanceHistory: (history) =>
        set({ attendanceHistory: history, historyError: null }),
      setLoadingHistory: (loading) => set({ loadingHistory: loading }),
      setHistoryError: (error) => set({ historyError: error }),

      setWaitlistEntries: (entries) =>
        set({ waitlistEntries: entries, waitlistError: null }),
      setUserWaitlistPosition: (timeSlotId, position) =>
        set((state) => {
          const newMap = new Map(state.userWaitlistPositions);
          if (position === null) {
            newMap.delete(timeSlotId);
          } else {
            newMap.set(timeSlotId, position);
          }
          return { userWaitlistPositions: newMap };
        }),
      setLoadingWaitlist: (loading) => set({ loadingWaitlist: loading }),
      setWaitlistError: (error) => set({ waitlistError: error }),

      setRules: (rules) => set({ rules, rulesError: null }),
      setLoadingRules: (loading) => set({ loadingRules: loading }),
      setRulesError: (error) => set({ rulesError: error }),

      // Helper actions
      updateTimeSlotCount: (timeSlotId, currentCount) =>
        set((state) => ({
          timeSlots: state.timeSlots.map((slot) =>
            slot.id === timeSlotId
              ? {
                  ...slot,
                  currentCount,
                  availableSpots: (slot.max_capacity || 0) - currentCount,
                }
              : slot
          ),
        })),

      clearAll: () =>
        set({
          timeSlots: [],
          selectedTimeSlot: null,
          attendanceHistory: [],
          waitlistEntries: [],
          userWaitlistPositions: new Map(),
          rules: [],
          timeSlotsError: null,
          historyError: null,
          waitlistError: null,
          rulesError: null,
        }),
    })
);

export default useSwimmingStore;

