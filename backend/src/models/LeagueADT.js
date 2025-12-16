/**
 * ABSTRACT DATA TYPE: League Management
 * 
 * Represents a sports league with registration, scheduling, and status management.
 * This ADT encapsulates league lifecycle and enforces business rules through invariants.
 * 
 * SPECIFICATION:
 * - Manages league lifecycle (upcoming → registration_open → in_progress → completed)
 * - Enforces registration deadlines and capacity constraints
 * - Handles participant registration with payment tracking
 * - Auto-updates status based on dates
 * 
 * REPRESENTATION INVARIANT (Rep Invariant):
 * - registration_fee >= 0
 * - max_participants > 0 or null (unlimited)
 * - 0 <= participant_count <= max_participants (if max_participants set)
 * - start_date < end_date (if end_date set)
 * - registration_deadline <= start_date
 * - status ∈ {'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'}
 * - If status === 'registration_open' → registration_enabled === true
 * - If status === 'completed' → end_date < today
 * - If status === 'in_progress' → start_date <= today <= end_date
 * 
 * ABSTRACTION FUNCTION:
 * AF(l) = A sports league with:
 *         - unique ID l.id
 *         - sport type l.sportType
 *         - date range [l.startDate, l.endDate]
 *         - registration deadline l.registrationDeadline
 *         - current status l.status
 *         - participant count l.participantCount / l.maxParticipants
 *         - registration fee l.registrationFee
 */

export class LeagueADT {
  // Private fields (representation)
  #id;
  #name;
  #description;
  #sportType;
  #startDate;
  #endDate;
  #registrationDeadline;
  #maxParticipants;
  #registrationFee;
  #prize;
  #status;
  #registrationEnabled;
  #participantCount;
  #createdBy;
  #createdAt;
  #updatedAt;

  /**
   * Private constructor to enforce creation through factory methods
   * @private
   */
  constructor(data) {
    this.#id = data.id;
    this.#name = data.name;
    this.#description = data.description;
    this.#sportType = data.sport_type;
    this.#startDate = data.start_date;
    this.#endDate = data.end_date;
    this.#registrationDeadline = data.registration_deadline;
    this.#maxParticipants = data.max_participants;
    this.#registrationFee = data.registration_fee || 0;
    this.#prize = data.prize;
    this.#status = data.status;
    this.#registrationEnabled = data.registration_enabled !== undefined ? data.registration_enabled : true;
    this.#participantCount = data.participant_count || 0;
    this.#createdBy = data.created_by;
    this.#createdAt = data.created_at;
    this.#updatedAt = data.updated_at;

    this.#checkRep();
  }

  /**
   * Check representation invariant
   * Throws error if invariant is violated
   * @private
   */
  #checkRep() {
    // Fee validation
    if (this.#registrationFee < 0) {
      throw new Error('Rep Invariant Violation: registration_fee must be non-negative');
    }

    // Capacity validation
    if (this.#maxParticipants !== null && this.#maxParticipants <= 0) {
      throw new Error('Rep Invariant Violation: max_participants must be positive or null');
    }

    if (this.#participantCount < 0) {
      throw new Error('Rep Invariant Violation: participant_count must be non-negative');
    }

    if (this.#maxParticipants !== null && this.#participantCount > this.#maxParticipants) {
      throw new Error('Rep Invariant Violation: participant_count cannot exceed max_participants');
    }

    // Date validations
    if (this.#endDate) {
      const start = new Date(this.#startDate);
      const end = new Date(this.#endDate);
      if (start >= end) {
        throw new Error('Rep Invariant Violation: start_date must be before end_date');
      }
    }

    if (this.#registrationDeadline) {
      const deadline = new Date(this.#registrationDeadline);
      const start = new Date(this.#startDate);
      if (deadline > start) {
        throw new Error('Rep Invariant Violation: registration_deadline must be before or equal to start_date');
      }
    }

    // Status validation
    const validStatuses = ['upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(this.#status)) {
      throw new Error(`Rep Invariant Violation: status must be one of ${validStatuses.join(', ')}`);
    }

    // Registration open status requires enabled registration
    if (this.#status === 'registration_open' && !this.#registrationEnabled) {
      throw new Error('Rep Invariant Violation: registration_open status requires registration_enabled to be true');
    }

    // Completed leagues must have passed end date
    if (this.#status === 'completed' && this.#endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(this.#endDate);
      end.setHours(23, 59, 59, 999);
      if (end >= today) {
        throw new Error('Rep Invariant Violation: completed status requires end_date to be in the past');
      }
    }

    // In progress leagues must be within date range
    if (this.#status === 'in_progress') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(this.#startDate);
      start.setHours(0, 0, 0, 0);
      
      if (start > today) {
        throw new Error('Rep Invariant Violation: in_progress status requires start_date to be today or in the past');
      }

      if (this.#endDate) {
        const end = new Date(this.#endDate);
        end.setHours(23, 59, 59, 999);
        if (end < today) {
          throw new Error('Rep Invariant Violation: in_progress status requires end_date to be today or in the future');
        }
      }
    }
  }

  // ==================== FACTORY METHODS (CREATORS) ====================

  /**
   * Create a new league
   * PRECONDITION: All required fields provided, dates valid
   * POSTCONDITION: Returns new league with status auto-calculated
   */
  static createNew(leagueData, createdBy) {
    if (!leagueData.name || !leagueData.sport_type || !leagueData.start_date) {
      throw new Error('Name, sport type, and start date are required');
    }

    const status = LeagueADT.#calculateStatus({
      start_date: leagueData.start_date,
      end_date: leagueData.end_date,
      registration_deadline: leagueData.registration_deadline,
      registration_enabled: leagueData.registration_enabled !== undefined ? leagueData.registration_enabled : true,
      status: 'upcoming' // Default, will be recalculated
    });

    return new LeagueADT({
      id: null, // Will be set by database
      name: leagueData.name,
      description: leagueData.description || null,
      sport_type: leagueData.sport_type,
      start_date: leagueData.start_date,
      end_date: leagueData.end_date || null,
      registration_deadline: leagueData.registration_deadline || leagueData.start_date,
      max_participants: leagueData.max_participants || null,
      registration_fee: leagueData.registration_fee || 0,
      prize: leagueData.prize || null,
      status: status,
      registration_enabled: leagueData.registration_enabled !== undefined ? leagueData.registration_enabled : true,
      participant_count: 0,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Create league from database data
   * PRECONDITION: data contains all required fields
   * POSTCONDITION: Returns validated league instance
   */
  static fromDatabase(data) {
    if (!data) {
      throw new Error('Database data is required');
    }
    return new LeagueADT(data);
  }

  /**
   * Calculate league status based on dates
   * POSTCONDITION: Returns one of: 'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
   * @private
   */
  static #calculateStatus(league) {
    // Don't change cancelled status
    if (league.status === 'cancelled') {
      return 'cancelled';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(league.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = league.end_date ? new Date(league.end_date) : null;
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    
    const registrationDeadline = league.registration_deadline ? new Date(league.registration_deadline) : null;
    if (registrationDeadline) {
      registrationDeadline.setHours(23, 59, 59, 999);
    }

    // If start date is in the future
    if (startDate > today) {
      // Check if registration is open
      if (league.registration_enabled && registrationDeadline && today <= registrationDeadline) {
        return 'registration_open';
      }
      return 'upcoming';
    }
    
    // If start date is today or in the past
    if (startDate <= today) {
      // If end date exists and is in the past, league is completed
      if (endDate && endDate < today) {
        return 'completed';
      }
      // Otherwise, league is in progress
      return 'in_progress';
    }

    return 'upcoming';
  }

  // ==================== OBSERVERS (READ-ONLY ACCESS) ====================

  getId() { return this.#id; }
  getName() { return this.#name; }
  getDescription() { return this.#description; }
  getSportType() { return this.#sportType; }
  getStartDate() { return this.#startDate; }
  getEndDate() { return this.#endDate; }
  getRegistrationDeadline() { return this.#registrationDeadline; }
  getMaxParticipants() { return this.#maxParticipants; }
  getRegistrationFee() { return this.#registrationFee; }
  getPrize() { return this.#prize; }
  getStatus() { return this.#status; }
  isRegistrationEnabled() { return this.#registrationEnabled; }
  getParticipantCount() { return this.#participantCount; }
  getCreatedBy() { return this.#createdBy; }
  getCreatedAt() { return this.#createdAt; }
  getUpdatedAt() { return this.#updatedAt; }

  /**
   * Check if league is accepting registrations
   * POSTCONDITION: Returns true iff registration enabled, not full, deadline not passed
   */
  isAcceptingRegistrations() {
    if (!this.#registrationEnabled) {
      return false;
    }

    if (this.#status === 'cancelled' || this.#status === 'completed' || this.#status === 'in_progress') {
      return false;
    }

    // Check deadline
    if (this.#registrationDeadline) {
      const today = new Date();
      const deadline = new Date(this.#registrationDeadline);
      deadline.setHours(23, 59, 59, 999);
      if (today > deadline) {
        return false;
      }
    }

    // Check capacity
    if (this.isFull()) {
      return false;
    }

    return true;
  }

  /**
   * Check if league has reached maximum capacity
   * POSTCONDITION: Returns true iff max_participants set and participant_count >= max_participants
   */
  isFull() {
    if (this.#maxParticipants === null) {
      return false;
    }
    return this.#participantCount >= this.#maxParticipants;
  }

  /**
   * Get available spots
   * POSTCONDITION: Returns max_participants - participant_count, or null if unlimited
   */
  getAvailableSpots() {
    if (this.#maxParticipants === null) {
      return null; // Unlimited
    }
    return this.#maxParticipants - this.#participantCount;
  }

  /**
   * Check if league has started
   * POSTCONDITION: Returns true iff start_date <= today
   */
  hasStarted() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(this.#startDate);
    start.setHours(0, 0, 0, 0);
    return start <= today;
  }

  /**
   * Check if league has ended
   * POSTCONDITION: Returns true iff end_date exists and < today
   */
  hasEnded() {
    if (!this.#endDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(this.#endDate);
    end.setHours(23, 59, 59, 999);
    return end < today;
  }

  // ==================== MUTATORS (STATE TRANSITIONS) ====================

  /**
   * Update league status based on current dates (auto-update)
   * POSTCONDITION: Status reflects current date-based state
   */
  updateStatus() {
    const newStatus = LeagueADT.#calculateStatus({
      start_date: this.#startDate,
      end_date: this.#endDate,
      registration_deadline: this.#registrationDeadline,
      registration_enabled: this.#registrationEnabled,
      status: this.#status
    });

    if (newStatus !== this.#status) {
      this.#status = newStatus;
      this.#updatedAt = new Date().toISOString();
      this.#checkRep();
    }

    return this;
  }

  /**
   * Enable or disable registration
   * POSTCONDITION: registration_enabled is updated, status may change
   */
  setRegistrationEnabled(enabled) {
    this.#registrationEnabled = enabled;
    this.#updatedAt = new Date().toISOString();
    
    // Update status if necessary
    this.updateStatus();

    return this;
  }

  /**
   * Increment participant count (when someone registers)
   * PRECONDITION: Not full, accepting registrations
   * POSTCONDITION: participant_count increased by 1
   */
  addParticipant() {
    if (!this.isAcceptingRegistrations()) {
      throw new Error('League is not currently accepting registrations');
    }

    if (this.isFull()) {
      throw new Error('League has reached maximum capacity');
    }

    this.#participantCount++;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Decrement participant count (when someone cancels)
   * PRECONDITION: participant_count > 0
   * POSTCONDITION: participant_count decreased by 1
   */
  removeParticipant() {
    if (this.#participantCount === 0) {
      throw new Error('No participants to remove');
    }

    this.#participantCount--;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Cancel the league
   * POSTCONDITION: status becomes 'cancelled'
   */
  cancel() {
    this.#status = 'cancelled';
    this.#registrationEnabled = false;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Update league details
   * PRECONDITION: updateData contains valid fields
   * POSTCONDITION: Fields are updated, invariants maintained
   */
  update(updateData) {
    if (updateData.name !== undefined) this.#name = updateData.name;
    if (updateData.description !== undefined) this.#description = updateData.description;
    if (updateData.sport_type !== undefined) this.#sportType = updateData.sport_type;
    if (updateData.start_date !== undefined) this.#startDate = updateData.start_date;
    if (updateData.end_date !== undefined) this.#endDate = updateData.end_date;
    if (updateData.registration_deadline !== undefined) this.#registrationDeadline = updateData.registration_deadline;
    if (updateData.max_participants !== undefined) this.#maxParticipants = updateData.max_participants;
    if (updateData.registration_fee !== undefined) this.#registrationFee = updateData.registration_fee;
    if (updateData.prize !== undefined) this.#prize = updateData.prize;

    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    // Update status after changes
    this.updateStatus();

    return this;
  }

  // ==================== CONVERSION ====================

  /**
   * Convert to database format
   * POSTCONDITION: Returns plain object suitable for database storage
   */
  toDatabase() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      sport_type: this.#sportType,
      start_date: this.#startDate,
      end_date: this.#endDate,
      registration_deadline: this.#registrationDeadline,
      max_participants: this.#maxParticipants,
      registration_fee: this.#registrationFee,
      prize: this.#prize,
      status: this.#status,
      registration_enabled: this.#registrationEnabled,
      created_by: this.#createdBy,
      created_at: this.#createdAt,
      updated_at: this.#updatedAt
    };
  }

  /**
   * Convert to JSON (API response format)
   * POSTCONDITION: Returns object for API consumption
   */
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      sportType: this.#sportType,
      startDate: this.#startDate,
      endDate: this.#endDate,
      registrationDeadline: this.#registrationDeadline,
      maxParticipants: this.#maxParticipants,
      registrationFee: this.#registrationFee,
      prize: this.#prize,
      status: this.#status,
      registrationEnabled: this.#registrationEnabled,
      participantCount: this.#participantCount,
      availableSpots: this.getAvailableSpots(),
      isFull: this.isFull(),
      isAcceptingRegistrations: this.isAcceptingRegistrations(),
      hasStarted: this.hasStarted(),
      hasEnded: this.hasEnded(),
      createdBy: this.#createdBy,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Create a defensive copy
   * POSTCONDITION: Returns new instance with same state
   */
  clone() {
    return new LeagueADT({
      ...this.toDatabase(),
      participant_count: this.#participantCount
    });
  }
}

export default LeagueADT;

