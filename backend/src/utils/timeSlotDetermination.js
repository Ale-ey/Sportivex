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

  // Find the next slot that starts within 10 minutes
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    const slotStartTime = parseTime(slot.start_time);
    const slotEndTime = parseTime(slot.end_time);

    // Check if we're within 10 minutes of the next slot starting
    if (currentTime < slotStartTime && tenMinutesFromNow >= slotStartTime) {
      return {
        timeSlot: slot,
        reason: 'within_10_minutes_of_next_slot',
        message: `Check-in for upcoming slot starting at ${slot.start_time}`
      };
    }

    // Check if we're currently in this time slot
    if (currentTime >= slotStartTime && currentTime < slotEndTime) {
      return {
        timeSlot: slot,
        reason: 'current_slot',
        message: `Check-in for current slot (${slot.start_time} - ${slot.end_time})`
      };
    }

    // Check if this is the first slot and we're before it (but not within 10 minutes)
    if (i === 0 && currentTime < slotStartTime) {
      return {
        timeSlot: slot,
        reason: 'before_first_slot',
        message: `Early check-in for first slot starting at ${slot.start_time}`
      };
    }
  }

  // If we've passed all slots for the day
  const lastSlot = sortedSlots[sortedSlots.length - 1];
  const lastSlotEndTime = parseTime(lastSlot.end_time);
  
  if (currentTime >= lastSlotEndTime) {
    return {
      error: true,
      message: 'All time slots for today have ended. Please check back tomorrow.'
    };
  }

  // If we're between slots, assign to the next upcoming slot
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    const slotStartTime = parseTime(slot.start_time);
    
    if (currentTime < slotStartTime) {
      return {
        timeSlot: slot,
        reason: 'next_upcoming_slot',
        message: `Check-in for upcoming slot starting at ${slot.start_time}`
      };
    }
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

