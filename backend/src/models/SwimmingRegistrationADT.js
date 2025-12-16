/**
 * ABSTRACT DATA TYPE: Swimming Registration
 * 
 * Represents a user's swimming facility registration with payment tracking.
 * This ADT encapsulates all registration logic and enforces invariants to maintain data integrity.
 * 
 * SPECIFICATION:
 * - Immutable registration ID once created
 * - Registration fee must be non-negative
 * - Payment status transitions follow a specific state machine
 * - Monthly payment dates follow business rules (8th of each month)
 * 
 * REPRESENTATION INVARIANT (Rep Invariant):
 * - registration_fee >= 0
 * - monthly_fee >= 0
 * - payment_status ∈ {'pending', 'succeeded', 'failed', 'refunded'}
 * - status ∈ {'pending', 'active', 'expired', 'cancelled'}
 * - If status === 'active' → payment_status === 'succeeded'
 * - If payment_status === 'succeeded' → amount_paid === registration_fee
 * - next_payment_date is always 8th of a future month
 * 
 * ABSTRACTION FUNCTION:
 * AF(r) = A swimming registration for user with:
 *         - unique ID r.id
 *         - registration fee r.registration_fee
 *         - payment status r.payment_status
 *         - active status r.status
 *         - monthly fee r.monthly_fee
 *         - next payment due on r.next_payment_date
 */

export class SwimmingRegistrationADT {
  // Private fields (representation)
  #id;
  #userId;
  #registrationFee;
  #monthlyFee;
  #paymentStatus;
  #status;
  #amountPaid;
  #nextPaymentDate;
  #activatedAt;
  #expiresAt;
  #stripeSessionId;
  #stripePaymentIntentId;
  #createdAt;
  #updatedAt;

  /**
   * Private constructor to enforce creation through factory methods
   * @private
   */
  constructor(data) {
    this.#id = data.id;
    this.#userId = data.user_id;
    this.#registrationFee = data.registration_fee;
    this.#monthlyFee = data.monthly_fee || 1500.00;
    this.#paymentStatus = data.payment_status;
    this.#status = data.status;
    this.#amountPaid = data.amount_paid || 0;
    this.#nextPaymentDate = data.next_payment_date;
    this.#activatedAt = data.activated_at;
    this.#expiresAt = data.expires_at;
    this.#stripeSessionId = data.stripe_session_id;
    this.#stripePaymentIntentId = data.stripe_payment_intent_id;
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
    // Fee validations
    if (this.#registrationFee < 0) {
      throw new Error('Rep Invariant Violation: registration_fee must be non-negative');
    }
    if (this.#monthlyFee < 0) {
      throw new Error('Rep Invariant Violation: monthly_fee must be non-negative');
    }

    // Payment status validation
    const validPaymentStatuses = ['pending', 'succeeded', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(this.#paymentStatus)) {
      throw new Error(`Rep Invariant Violation: payment_status must be one of ${validPaymentStatuses.join(', ')}`);
    }

    // Status validation
    const validStatuses = ['pending', 'active', 'expired', 'cancelled'];
    if (!validStatuses.includes(this.#status)) {
      throw new Error(`Rep Invariant Violation: status must be one of ${validStatuses.join(', ')}`);
    }

    // Active status requires succeeded payment (ADT invariant replaces precondition)
    if (this.#status === 'active' && this.#paymentStatus !== 'succeeded') {
      throw new Error('Rep Invariant Violation: active registration must have succeeded payment');
    }

    // Succeeded payment requires correct amount paid
    if (this.#paymentStatus === 'succeeded' && this.#amountPaid !== this.#registrationFee) {
      throw new Error('Rep Invariant Violation: succeeded payment requires amount_paid === registration_fee');
    }

    // Next payment date validation (must be 8th of a month)
    if (this.#nextPaymentDate) {
      const date = new Date(this.#nextPaymentDate);
      if (date.getDate() !== 8) {
        throw new Error('Rep Invariant Violation: next_payment_date must be on the 8th of a month');
      }
    }
  }

  // ==================== FACTORY METHODS (CREATORS) ====================

  /**
   * Create a new pending registration
   * PRECONDITION: userId must be valid, fee >= 0
   * POSTCONDITION: Returns new registration with status='pending', payment_status='pending'
   */
  static createNew(userId, registrationFee = 1500.00) {
    // ADT invariants replace preconditions
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (registrationFee < 0) {
      throw new Error('Registration fee must be non-negative');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const nextPaymentDate = SwimmingRegistrationADT.#calculateNextPaymentDate();

    return new SwimmingRegistrationADT({
      id: null, // Will be set by database
      user_id: userId,
      registration_fee: registrationFee,
      monthly_fee: 1500.00,
      payment_status: 'pending',
      status: 'pending',
      amount_paid: 0,
      next_payment_date: nextPaymentDate.toISOString().split('T')[0],
      activated_at: null,
      expires_at: expiresAt.toISOString(),
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Create registration from database data
   * PRECONDITION: data must contain all required fields
   * POSTCONDITION: Returns validated registration instance
   */
  static fromDatabase(data) {
    if (!data) {
      throw new Error('Database data is required');
    }
    return new SwimmingRegistrationADT(data);
  }

  /**
   * Calculate next payment date (8th of next month)
   * POSTCONDITION: Returns Date object set to 8th of future month
   * @private
   */
  static #calculateNextPaymentDate() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (now.getDate() < 8) {
      return new Date(currentYear, currentMonth, 8);
    } else {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return new Date(nextYear, nextMonth, 8);
    }
  }

  // ==================== OBSERVERS (READ-ONLY ACCESS) ====================

  getId() { return this.#id; }
  getUserId() { return this.#userId; }
  getRegistrationFee() { return this.#registrationFee; }
  getMonthlyFee() { return this.#monthlyFee; }
  getPaymentStatus() { return this.#paymentStatus; }
  getStatus() { return this.#status; }
  getAmountPaid() { return this.#amountPaid; }
  getNextPaymentDate() { return this.#nextPaymentDate; }
  getActivatedAt() { return this.#activatedAt; }
  getExpiresAt() { return this.#expiresAt; }
  getStripeSessionId() { return this.#stripeSessionId; }
  getStripePaymentIntentId() { return this.#stripePaymentIntentId; }
  getCreatedAt() { return this.#createdAt; }
  getUpdatedAt() { return this.#updatedAt; }

  /**
   * Check if registration is active
   * POSTCONDITION: Returns true iff status='active' AND payment_status='succeeded' AND not payment due
   */
  isActive() {
    if (this.#status !== 'active' || this.#paymentStatus !== 'succeeded') {
      return false;
    }

    // Check if payment is due
    if (!this.#nextPaymentDate) {
      return true;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return this.#nextPaymentDate > todayStr;
  }

  /**
   * Check if payment is due
   * POSTCONDITION: Returns true iff next_payment_date <= today
   */
  isPaymentDue() {
    if (!this.#nextPaymentDate) {
      return false;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return this.#nextPaymentDate <= todayStr;
  }

  /**
   * Check if registration has expired
   * POSTCONDITION: Returns true iff expires_at exists and < now
   */
  isExpired() {
    if (!this.#expiresAt) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(this.#expiresAt);
    return expiresAt < now;
  }

  // ==================== MUTATORS (STATE TRANSITIONS) ====================

  /**
   * Activate registration after successful payment
   * PRECONDITION: payment_status must be 'succeeded'
   * POSTCONDITION: status becomes 'active', activated_at is set
   */
  activate() {
    if (this.#paymentStatus !== 'succeeded') {
      throw new Error('Cannot activate: payment must be succeeded');
    }

    this.#status = 'active';
    this.#activatedAt = new Date().toISOString();
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Mark payment as succeeded
   * PRECONDITION: current payment_status is 'pending'
   * POSTCONDITION: payment_status becomes 'succeeded', amount_paid updated
   */
  markPaymentSucceeded(paymentIntentId = null) {
    if (this.#paymentStatus !== 'pending') {
      throw new Error('Cannot mark payment succeeded: current status is not pending');
    }

    this.#paymentStatus = 'succeeded';
    this.#amountPaid = this.#registrationFee;
    this.#stripePaymentIntentId = paymentIntentId;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Set Stripe session ID
   * POSTCONDITION: stripe_session_id is updated
   */
  setStripeSessionId(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID cannot be empty');
    }

    this.#stripeSessionId = sessionId;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Update next payment date after monthly payment
   * PRECONDITION: date must be 8th of a future month
   * POSTCONDITION: next_payment_date is updated
   */
  updateNextPaymentDate(date) {
    const paymentDate = new Date(date);
    if (paymentDate.getDate() !== 8) {
      throw new Error('Payment date must be on the 8th of a month');
    }

    this.#nextPaymentDate = date;
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

    return this;
  }

  /**
   * Cancel registration
   * POSTCONDITION: status becomes 'cancelled'
   */
  cancel() {
    this.#status = 'cancelled';
    this.#updatedAt = new Date().toISOString();
    this.#checkRep();

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
      user_id: this.#userId,
      registration_fee: this.#registrationFee,
      monthly_fee: this.#monthlyFee,
      payment_status: this.#paymentStatus,
      status: this.#status,
      amount_paid: this.#amountPaid,
      next_payment_date: this.#nextPaymentDate,
      activated_at: this.#activatedAt,
      expires_at: this.#expiresAt,
      stripe_session_id: this.#stripeSessionId,
      stripe_payment_intent_id: this.#stripePaymentIntentId,
      created_at: this.#createdAt,
      updated_at: this.#updatedAt
    };
  }

  /**
   * Convert to JSON (safe for API responses)
   * POSTCONDITION: Returns object without sensitive fields
   */
  toJSON() {
    return {
      id: this.#id,
      userId: this.#userId,
      registrationFee: this.#registrationFee,
      monthlyFee: this.#monthlyFee,
      paymentStatus: this.#paymentStatus,
      status: this.#status,
      amountPaid: this.#amountPaid,
      nextPaymentDate: this.#nextPaymentDate,
      activatedAt: this.#activatedAt,
      expiresAt: this.#expiresAt,
      isActive: this.isActive(),
      isPaymentDue: this.isPaymentDue(),
      isExpired: this.isExpired(),
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Create a defensive copy
   * POSTCONDITION: Returns new instance with same state
   */
  clone() {
    return new SwimmingRegistrationADT(this.toDatabase());
  }
}

export default SwimmingRegistrationADT;

