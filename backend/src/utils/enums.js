/**
 * Application-wide constants and enums
 * Centralized location for all constant values used across the application
 */

// ==================== GENDER ====================
export const Gender = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
});

export const GENDER_VALUES = Object.values(Gender);

// ==================== GYM MODULE ====================

// Gym QR Code
export const GYM_QR_CODE = Object.freeze({
  VALID_CODE: 'GYM_ENTRY_EXIT'
});

// Gym Exercise Categories
export const GymExerciseCategory = Object.freeze({
  LEGS: 'legs',
  CHEST: 'chest',
  SHOULDER: 'shoulder',
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  ABS: 'abs',
  OTHER: 'other'
});

export const GYM_EXERCISE_CATEGORIES = Object.values(GymExerciseCategory);

// Gym Check-in Status
export const GymCheckinStatus = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed'
});

export const GYM_CHECKIN_STATUS_VALUES = Object.values(GymCheckinStatus);

// ==================== SWIMMING MODULE ====================

// Gender Restrictions for Time Slots
export const SwimmingGenderRestriction = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  FACULTY_PG: 'faculty_pg',
  MIXED: 'mixed'
});

export const SWIMMING_GENDER_RESTRICTIONS = Object.values(SwimmingGenderRestriction);

// Check-in Methods
export const CheckInMethod = Object.freeze({
  QR_SCAN: 'qr_scan',
  MANUAL: 'manual'
});

export const CHECK_IN_METHODS = Object.values(CheckInMethod);

// Waitlist Status
export const WaitlistStatus = Object.freeze({
  PENDING: 'pending',
  NOTIFIED: 'notified',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
});

export const WAITLIST_STATUS_VALUES = Object.values(WaitlistStatus);

// QR Code Prefixes
export const QRCodePrefix = Object.freeze({
  SWIMMING: 'SWIMMING-'
});

// ==================== COMMON STATUS ====================

// Active/Inactive Status
export const ActiveStatus = Object.freeze({
  ACTIVE: true,
  INACTIVE: false
});

// ==================== AUTH MODULE ====================

// User Roles (from constants/roles.js - keeping for reference)
// Note: Actual roles are defined in constants/roles.js
// This is just for reference of valid role values
export const UserRole = Object.freeze({
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  ALUMNI: 'alumni',
  UG: 'ug',
  PG: 'pg'
});

// ==================== VALIDATION ARRAYS ====================

// Arrays for validation checks
export const VALID_GENDERS = GENDER_VALUES;
export const VALID_GYM_CATEGORIES = GYM_EXERCISE_CATEGORIES;
export const VALID_SWIMMING_GENDER_RESTRICTIONS = SWIMMING_GENDER_RESTRICTIONS;
export const VALID_CHECKIN_METHODS = CHECK_IN_METHODS;
export const VALID_WAITLIST_STATUSES = WAITLIST_STATUS_VALUES;
export const VALID_GYM_CHECKIN_STATUSES = GYM_CHECKIN_STATUS_VALUES;

