/**
 * Utility functions for determining appropriate time slot based on current time
 */

/**
 * Determine which time slot to assign based on current time
 * @param {Array} timeSlots - Array of time slot objects with start_time and end_time
 * @param {Date} currentDateTime - Current date and time
 * @returns {Object} - { timeSlot, reason } or { error, message }
 */
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  if (!timeSlots || timeSlots.length === 0) {
    return {
      error: true,
      message: 'No time slots available'
    };
  }

  // Sort time slots by start time
  const sortedSlots = timeSlots.sort((a, b) => {
    const timeA = parseTime(a.start_time);
    const timeB = parseTime(b.start_time);
    return timeA - timeB;
  });

  const currentTime = currentDateTime.getHours() * 60 + currentDateTime.getMinutes();
  const tenMinutesFromNow = currentTime + 10;

  // First, find if we're currently in any active slot
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    const slotStartTime = parseTime(slot.start_time);
    const slotEndTime = parseTime(slot.end_time);

    // Check if we're currently in this time slot (most important check)
    if (currentTime >= slotStartTime && currentTime < slotEndTime) {
      return {
        timeSlot: slot,
        reason: 'current_slot',
        message: `Check-in for current slot (${slot.start_time} - ${slot.end_time})`
      };
    }
  }

  // If not in any current slot, find the next upcoming slot
  // Filter out slots that have already ended
  const upcomingSlots = sortedSlots.filter(slot => {
    const slotEndTime = parseTime(slot.end_time);
    return currentTime < slotEndTime; // Only consider slots that haven't ended yet
  });

  if (upcomingSlots.length === 0) {
    return {
      error: true,
      message: 'All time slots for today have ended. Please check back tomorrow.'
    };
  }

  // Find the next slot that starts soon or hasn't started yet
  for (let i = 0; i < upcomingSlots.length; i++) {
    const slot = upcomingSlots[i];
    const slotStartTime = parseTime(slot.start_time);
    const slotEndTime = parseTime(slot.end_time);

    // If slot hasn't started yet, check if we're within 10 minutes
    if (currentTime < slotStartTime) {
      // Check if we're within 10 minutes of this slot starting
      if (tenMinutesFromNow >= slotStartTime) {
        return {
          timeSlot: slot,
          reason: 'within_10_minutes_of_next_slot',
          message: `Check-in for upcoming slot starting at ${slot.start_time}`
        };
      }
      // If not within 10 minutes, but it's the next upcoming slot, assign to it
      // (for early check-ins)
      if (i === 0 || (i > 0 && currentTime >= parseTime(upcomingSlots[i - 1].end_time))) {
        return {
          timeSlot: slot,
          reason: 'next_upcoming_slot',
          message: `Check-in for upcoming slot starting at ${slot.start_time}`
        };
      }
    }
  }

  // Fallback: return the first upcoming slot if we couldn't find a match
  if (upcomingSlots.length > 0) {
    return {
      timeSlot: upcomingSlots[0],
      reason: 'next_available_slot',
      message: `Check-in for next available slot starting at ${upcomingSlots[0].start_time}`
    };
  }

  return {
    error: true,
    message: 'Unable to determine appropriate time slot'
  };
};

/**
 * Parse time string (HH:MM:SS or HH:MM) to minutes since midnight
 * @param {string} timeString - Time in format "HH:MM:SS" or "HH:MM"
 * @returns {number} - Minutes since midnight
 */
const parseTime = (timeString) => {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

/**
 * Get the current day of week in lowercase
 * @param {Date} date - Date object
 * @returns {string} - Day name in lowercase (e.g., 'monday', 'tuesday')
 */
export const getDayOfWeek = (date = new Date()) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

/**
 * Format time for display
 * @param {string} timeString - Time in format "HH:MM:SS"
 * @returns {string} - Formatted time (e.g., "09:00 AM")
 */
export const formatTime = (timeString) => {
  const parts = timeString.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getTodayDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

