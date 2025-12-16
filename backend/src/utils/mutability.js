/**
 * Mutability Utilities and Contracts
 * 
 * This module demonstrates risks of mutation, mutation contracts, and immutability patterns
 * to ensure safe and predictable state management in the Sportivex application.
 */

/**
 * IMMUTABILITY PATTERNS
 */

/**
 * Creates an immutable copy of an object
 * Ensures mutations don't affect the original object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} - Deep clone of the object
 * 
 * CONTRACT:
 * - Precondition: obj must be a plain object or array
 * - Postcondition: Returns a new object with same values, original is unchanged
 * - Invariant: Original object remains immutable after clone
 */
export const immutableClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => immutableClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = immutableClone(obj[key]);
    }
  }
  
  return cloned;
};

/**
 * Creates an immutable update - returns new object with updated fields
 * Does not mutate the original object
 * 
 * @param {Object} obj - Original object
 * @param {Object} updates - Key-value pairs to update
 * @returns {Object} - New object with updates applied
 * 
 * CONTRACT:
 * - Precondition: obj must be an object, updates must be an object
 * - Postcondition: Returns new object with merged properties, original unchanged
 * - Invariant: Original object reference remains unchanged
 */
export const immutableUpdate = (obj, updates) => {
  if (!obj || typeof obj !== 'object') {
    throw new Error('First argument must be an object');
  }
  
  return {
    ...immutableClone(obj),
    ...updates
  };
};

/**
 * RISKS OF MUTATION - Examples of dangerous patterns
 */

/**
 * DANGEROUS: Mutates original array
 * This function demonstrates a risky mutation pattern
 * 
 * @param {Array} arr - Array to modify
 * @param {*} item - Item to add
 * @returns {Array} - Mutated array (same reference)
 * 
 * RISKS:
 * - Mutates shared state, causing unexpected side effects
 * - Breaks referential equality assumptions
 * - Makes debugging difficult
 * - Can cause race conditions in concurrent code
 */
export const riskyAddToArray = (arr, item) => {
  // WARNING: This mutates the original array
  arr.push(item);
  return arr;
};

/**
 * SAFE: Returns new array without mutating original
 * This demonstrates the safe, immutable pattern
 * 
 * @param {Array} arr - Original array
 * @param {*} item - Item to add
 * @returns {Array} - New array with item added
 * 
 * CONTRACT:
 * - Precondition: arr must be an array
 * - Postcondition: Returns new array, original unchanged
 * - Invariant: Original array reference and contents remain unchanged
 */
export const safeAddToArray = (arr, item) => {
  return [...arr, item];
};

/**
 * MUTATION CONTRACTS - User profile update example
 */

/**
 * Represents a mutable user profile with documented mutation contract
 * 
 * CONTRACT FOR updateProfile:
 * - Precondition: profile must be valid UserProfile object
 * - Precondition: updates must contain only valid field names
 * - Postcondition: profile object is mutated with new values
 * - Postcondition: profile.updatedAt is automatically set to current time
 * - Invariant: profile.id and profile.email cannot be changed
 * - Invariant: profile.role cannot be changed after initial creation
 */
class UserProfile {
  constructor(data) {
    // Immutable fields (can only be set at construction)
    this.id = data.id;
    this.email = data.email;
    this.role = data.role;
    
    // Mutable fields (can be updated)
    this.name = data.name;
    this.phone = data.phone;
    this.dateOfBirth = data.dateOfBirth;
    this.address = data.address;
    this.profilePictureUrl = data.profilePictureUrl;
    this.bio = data.bio;
    
    // Metadata
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  /**
   * Updates profile fields while respecting mutation contract
   * 
   * MUTATION CONTRACT:
   * - Only mutable fields can be updated
   * - id, email, and role are immutable (contract violation throws error)
   * - updatedAt is automatically set
   * 
   * @param {Object} updates - Fields to update
   * @throws {Error} - If attempting to mutate immutable fields
   */
  updateProfile(updates) {
    // Enforce contract: prevent mutation of immutable fields
    const immutableFields = ['id', 'email', 'role'];
    const attemptedImmutableFields = immutableFields.filter(field => Object.prototype.hasOwnProperty.call(updates, field));
    
    if (attemptedImmutableFields.length > 0) {
      throw new Error(
        `Mutation contract violation: Cannot mutate immutable fields: ${attemptedImmutableFields.join(', ')}`
      );
    }
    
    // Apply mutations only to mutable fields
    Object.keys(updates).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this, key) && !immutableFields.includes(key)) {
        this[key] = updates[key];
      }
    });
    
    // Enforce invariant: updatedAt must always be current
    this.updatedAt = new Date();
    
    return this;
  }
  
  /**
   * Creates an immutable copy of the profile
   * Use this when you need to prevent mutations
   */
  toImmutable() {
    return immutableClone(this);
  }
}

/**
 * Time slot state management with mutation contracts
 * Demonstrates safe state updates for swimming time slots
 */

/**
 * Creates immutable time slot state
 * 
 * CONTRACT:
 * - Precondition: timeSlot must have valid structure
 * - Postcondition: Returns immutable object
 * - Invariant: State cannot be mutated directly
 */
export const createTimeSlotState = (timeSlot) => {
  const state = {
    id: timeSlot.id,
    startTime: timeSlot.start_time,
    endTime: timeSlot.end_time,
    maxCapacity: timeSlot.max_capacity,
    currentCount: timeSlot.currentCount || 0,
    genderRestriction: timeSlot.gender_restriction,
    isActive: timeSlot.is_active
  };
  
  // Freeze to prevent mutations
  return Object.freeze(state);
};

/**
 * Safely updates time slot attendance count
 * Returns new state without mutating original
 * 
 * @param {Object} state - Current immutable state
 * @param {number} newCount - New attendance count
 * @returns {Object} - New immutable state
 * 
 * CONTRACT:
 * - Precondition: state must be frozen/immutable
 * - Precondition: newCount must be non-negative integer
 * - Precondition: newCount must not exceed maxCapacity
 * - Postcondition: Returns new immutable state object
 * - Invariant: Original state remains unchanged
 */
export const updateAttendanceCount = (state, newCount) => {
  // Validate preconditions
  if (newCount < 0) {
    throw new Error('Attendance count cannot be negative');
  }
  
  if (newCount > state.maxCapacity) {
    throw new Error('Attendance count cannot exceed maximum capacity');
  }
  
  // Return new immutable state
  return Object.freeze({
    ...state,
    currentCount: newCount,
    availableSpots: state.maxCapacity - newCount
  });
};

/**
 * Demonstrates mutation risk in nested objects
 */
export const riskyNestedMutation = (timeSlot, newCount) => {
  // WARNING: This mutates the nested object
  // If timeSlot is shared, this causes side effects
  timeSlot.currentCount = newCount;
  timeSlot.availableSpots = timeSlot.maxCapacity - newCount;
  return timeSlot;
};

/**
 * Safe nested update pattern
 */
export const safeNestedUpdate = (timeSlot, newCount) => {
  // Create new object, preserving immutability
  return {
    ...timeSlot,
    currentCount: newCount,
    availableSpots: timeSlot.maxCapacity - newCount
  };
};

export { UserProfile };

