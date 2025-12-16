/**
 * Validation utilities for swimming module
 */

/**
 * Validate time slot data
 */
export const validateTimeSlot = (data) => {
  const errors = [];

  // Validate start and end time
  if (!data.startTime) {
    errors.push('Start time is required');
  }
  if (!data.endTime) {
    errors.push('End time is required');
  }

  // Validate time format (HH:MM or HH:MM:SS)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format. Use HH:MM or HH:MM:SS');
  }
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push('Invalid end time format. Use HH:MM or HH:MM:SS');
  }

  if (
    data.startTime &&
    data.endTime &&
    timeRegex.test(data.startTime) &&
    timeRegex.test(data.endTime)
  ) {
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(':');
      return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    };

    if (toMinutes(data.endTime) <= toMinutes(data.startTime)) {
      errors.push('End time must be greater than start time');
    }
  }

  // Validate gender restriction
  const validGenders = ['male', 'female', 'faculty_pg', 'mixed'];
  if (!data.genderRestriction || !validGenders.includes(data.genderRestriction.toLowerCase())) {
    errors.push('Invalid gender restriction. Must be one of: male, female, faculty_pg, mixed');
  }

  // Validate max capacity
  if (data.maxCapacity !== undefined) {
    const capacity = parseInt(data.maxCapacity, 10);
    if (isNaN(capacity) || capacity <= 0) {
      errors.push('Max capacity must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user eligibility for a time slot based on gender/role
 */
export const validateUserEligibility = (user, timeSlot) => {
  const genderRestriction = timeSlot.gender_restriction;

  // Mixed slots allow everyone
  if (genderRestriction === 'mixed') {
    return {
      isValid: true,
      message: 'User is eligible for this time slot'
    };
  }

  // Faculty/PG slots - accessible by PG, Faculty, and Alumni
  if (genderRestriction === 'faculty_pg') {
    const userRole = user.role?.toLowerCase();
    if (userRole === 'faculty' || userRole === 'pg' || userRole === 'alumni') {
      return {
        isValid: true,
        message: 'User is eligible for faculty/PG time slot'
      };
    }
    return {
      isValid: false,
      message: 'This time slot is restricted to faculty, postgraduate students, and alumni only'
    };
  }

  // Gender-specific slots (male or female)
  if (!user.gender) {
    return {
      isValid: false,
      message: 'User gender is not set. Please update your profile to continue.'
    };
  }

  // Case-insensitive comparison
  const userGender = user.gender.toLowerCase();
  const slotGender = genderRestriction.toLowerCase();

  if (userGender !== slotGender) {
    return {
      isValid: false,
      message: `This time slot is restricted to ${genderRestriction} swimmers only`
    };
  }

  return {
    isValid: true,
    message: 'User is eligible for this time slot'
  };
};

/**
 * Validate QR code
 */
export const validateQRCode = (qrCodeValue) => {
  if (!qrCodeValue || typeof qrCodeValue !== 'string') {
    return {
      isValid: false,
      message: 'Invalid QR code format'
    };
  }

  // QR code should start with SWIMMING- prefix
  if (!qrCodeValue.startsWith('SWIMMING-')) {
    return {
      isValid: false,
      message: 'Invalid QR code. This QR code is not for swimming pool check-in.'
    };
  }

  return {
    isValid: true,
    message: 'QR code format is valid'
  };
};

/**
 * Validate rule/regulation data
 */
export const validateRule = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (data.title && data.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (data.displayOrder !== undefined) {
    const order = parseInt(data.displayOrder, 10);
    if (isNaN(order)) {
      errors.push('Display order must be a number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate waitlist join request
 */
export const validateWaitlistJoin = (data) => {
  const errors = [];

  if (!data.timeSlotId) {
    errors.push('Time slot ID is required');
  }

  if (!data.sessionDate) {
    errors.push('Session date is required');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (data.sessionDate && !dateRegex.test(data.sessionDate)) {
    errors.push('Invalid date format. Use YYYY-MM-DD');
  }

  // Validate date is not in the past
  if (data.sessionDate) {
    const sessionDate = new Date(data.sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sessionDate < today) {
      errors.push('Session date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

