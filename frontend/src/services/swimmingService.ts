import axiosInstance from '@/lib/axiosInstance';

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  gender_restriction: string;
  trainer_id?: string;
  trainer?: {
    id: string;
    name: string;
    email: string;
  };
  max_capacity: number;
  is_active: boolean;
  currentCount: number;
  availableSpots: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlotsResponse {
  success: boolean;
  data: {
    timeSlots: TimeSlot[];
    count: number;
  };
}

export interface QRScanResponse {
  success: boolean;
  message: string;
  attendance?: {
    id: string;
    checkInTime: string;
    sessionDate: string;
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
    genderRestriction: string;
    trainerName?: string;
    currentCount: number;
    maxCapacity: number;
  };
  capacityExceeded?: boolean;
  alreadyCheckedIn?: boolean;
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  waitlist?: {
    id: string;
    position: number;
    status: string;
  };
}

export const swimmingService = {
  /**
   * Get all time slots for today
   */
  getTimeSlots: async (): Promise<TimeSlotsResponse> => {
    const response = await axiosInstance.get('/swimming/time-slots?active=true');
    return response.data;
  },

  /**
   * Scan QR code for attendance
   */
  scanQRCode: async (qrCodeValue: string): Promise<QRScanResponse> => {
    const response = await axiosInstance.post('/swimming/attendance/scan-qr', {
      qrCodeValue,
    });
    return response.data;
  },

  /**
   * Join waitlist for a time slot (used as reservation)
   */
  joinWaitlist: async (
    timeSlotId: string,
    sessionDate: string
  ): Promise<WaitlistResponse> => {
    const response = await axiosInstance.post('/swimming/waitlist/join', {
      timeSlotId,
      sessionDate,
    });
    return response.data;
  },

  /**
   * Leave waitlist
   */
  leaveWaitlist: async (
    timeSlotId: string,
    sessionDate: string
  ): Promise<WaitlistResponse> => {
    const response = await axiosInstance.delete('/swimming/waitlist/leave', {
      data: {
        timeSlotId,
        sessionDate,
      },
    });
    return response.data;
  },

  /**
   * Get waitlist for a time slot
   */
  getWaitlist: async (
    timeSlotId: string,
    date?: string
  ): Promise<{ success: boolean; data: { waitlist: any[]; count: number } }> => {
    const url = date
      ? `/swimming/waitlist/${timeSlotId}?date=${date}`
      : `/swimming/waitlist/${timeSlotId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

