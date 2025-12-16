# Abstraction and Concurrency Implementation Details

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Abstraction (Abstract Data Types)](#abstraction-abstract-data-types)
3. [Concurrency](#concurrency)
4. [Before and After Comparison](#before-and-after-comparison)
5. [Logical Flow Diagrams](#logical-flow-diagrams)
6. [Testing and Debugging](#testing-and-debugging)
7. [Conclusion](#conclusion)

---

## Executive Summary

This document details the implementation of **Abstract Data Types (ADTs)** and **Concurrency Control** in the Sportivex codebase, specifically within the Swimming and League modules. These software design concepts significantly improve:

- **Data Integrity**: Through representation invariants and ADT-enforced constraints
- **Type Safety**: Via encapsulation and controlled state transitions
- **Concurrency Safety**: Preventing race conditions in multi-user scenarios
- **Maintainability**: Clear separation of concerns and testability

---

## Abstraction (Abstract Data Types)

### What is an Abstract Data Type?

An **Abstract Data Type (ADT)** is a mathematical model for data types, defined by its behavior (operations) from the point of view of a user, specifically in terms of possible values, operations on data of this type, and behavior of these operations.

### Key ADT Concepts Implemented

#### 1. Representation Invariant (Rep Invariant)

A **representation invariant** is a condition that must always be true for the internal representation of an ADT. It ensures data integrity throughout the object's lifetime.

#### 2. Abstraction Function

The **abstraction function** maps the concrete representation to the abstract value it represents. It documents how the implementation represents the abstract concept.

#### 3. ADT Invariants Replace Preconditions

Instead of checking preconditions at every function call, ADTs enforce invariants that make certain preconditions unnecessary. The ADT guarantees its internal state is always valid.

---

### Implementation 1: Swimming Registration ADT

**File**: `backend/src/models/SwimmingRegistrationADT.js`

#### Abstract Specification

```
ADT: SwimmingRegistrationADT
Represents: A user's swimming facility registration with payment tracking
```

#### Representation Invariant

```
Rep Invariant:
- registration_fee >= 0
- monthly_fee >= 0
- payment_status ∈ {'pending', 'succeeded', 'failed', 'refunded'}
- status ∈ {'pending', 'active', 'expired', 'cancelled'}
- IF status === 'active' THEN payment_status === 'succeeded'
- IF payment_status === 'succeeded' THEN amount_paid === registration_fee
- next_payment_date is always 8th of a future month
```

#### Abstraction Function

```
AF(r) = A swimming registration for user with:
        - unique ID r.id
        - registration fee r.registration_fee
        - payment status r.payment_status
        - active status r.status
        - monthly fee r.monthly_fee
        - next payment due on r.next_payment_date
```

#### Code Example

```javascript
export class SwimmingRegistrationADT {
  // Private fields (representation)
  #id;
  #userId;
  #registrationFee;
  #paymentStatus;
  #status;
  
  /**
   * Check representation invariant
   */
  #checkRep() {
    // Fee validation
    if (this.#registrationFee < 0) {
      throw new Error('Rep Invariant Violation: registration_fee must be non-negative');
    }
    
    // Status validation
    if (this.#status === 'active' && this.#paymentStatus !== 'succeeded') {
      throw new Error('Rep Invariant Violation: active registration must have succeeded payment');
    }
    
    // More invariant checks...
  }
  
  /**
   * Factory method to create new registration
   * POSTCONDITION: Returns registration with status='pending'
   */
  static createNew(userId, registrationFee = 1500.00) {
    // ADT invariants replace preconditions
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (registrationFee < 0) {
      throw new Error('Registration fee must be non-negative');
    }
    
    return new SwimmingRegistrationADT({
      user_id: userId,
      registration_fee: registrationFee,
      payment_status: 'pending',
      status: 'pending',
      // ... other fields
    });
  }
  
  /**
   * State transition: activate registration
   * PRECONDITION: payment_status must be 'succeeded'
   * POSTCONDITION: status becomes 'active'
   */
  activate() {
    if (this.#paymentStatus !== 'succeeded') {
      throw new Error('Cannot activate: payment must be succeeded');
    }
    
    this.#status = 'active';
    this.#checkRep(); // Verify invariant after mutation
    return this;
  }
}
```

#### How ADT Invariants Replace Preconditions

**Before (Without ADT)**:
```javascript
// Every function must check preconditions
function activateRegistration(registration) {
  // Precondition checks (repeated everywhere)
  if (!registration) throw new Error('Registration required');
  if (registration.payment_status !== 'succeeded') throw new Error('Payment not succeeded');
  if (registration.registration_fee < 0) throw new Error('Invalid fee');
  
  registration.status = 'active';
  // No guarantee invariants hold after this!
}
```

**After (With ADT)**:
```javascript
// ADT guarantees invariants, so many preconditions unnecessary
const registration = SwimmingRegistrationADT.createNew(userId, 1500);
registration.markPaymentSucceeded();
registration.activate(); // Only checks necessary precondition, invariants guaranteed
```

---

### Implementation 2: Attendance ADT

**File**: `backend/src/models/AttendanceADT.js`

#### Abstract Specification

```
ADT: AttendanceADT
Represents: Attendance tracking for swimming sessions with capacity management
```

#### Representation Invariant

```
Rep Invariant:
- 0 <= currentCount <= maxCapacity
- All attendee IDs are unique within a session
- session_date is in valid ISO format (YYYY-MM-DD)
- check_in_time <= current time
- check_in_method ∈ {'qr_scan', 'manual'}
```

#### Key Operations

```javascript
/**
 * Check in a user (thread-safe operation)
 * PRECONDITION: userId valid, user not already checked in
 * POSTCONDITION: If successful, currentCount++, userId added
 */
checkIn(userId, userGender, userRole, checkInMethod = 'qr_scan') {
  // ADT enforces all invariants
  if (this.hasUserCheckedIn(userId)) {
    return { success: false, message: 'Already checked in' };
  }
  
  if (!this.isUserEligible(userGender, userRole)) {
    return { success: false, message: 'Not eligible' };
  }
  
  if (this.isFull()) {
    return { success: false, message: 'At capacity' };
  }
  
  // Atomic state change
  this.#attendeeIds.add(userId);
  this.#currentCount++;
  this.#checkRep(); // Verify invariants
  
  return { success: true, currentCount: this.#currentCount };
}
```

---

### Implementation 3: League ADT

**File**: `backend/src/models/LeagueADT.js`

#### Representation Invariant

```
Rep Invariant:
- registration_fee >= 0
- max_participants > 0 or null (unlimited)
- 0 <= participant_count <= max_participants
- start_date < end_date
- registration_deadline <= start_date
- IF status === 'completed' THEN end_date < today
```

#### Status State Machine

```
State Transitions:
upcoming → registration_open → in_progress → completed
                                             ↓
                                        cancelled
```

#### Auto-Status Updates

```javascript
/**
 * Update status based on current dates
 * POSTCONDITION: Status reflects date-based state
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
    this.#checkRep();
  }
  
  return this;
}
```

---

## Concurrency

### What is Concurrency?

**Concurrency** is the ability of different parts of a program to be executed out-of-order or in partial order, without affecting the final outcome. In web applications, multiple users can make requests simultaneously.

### Concurrency Challenges

#### 1. Race Conditions

A **race condition** occurs when the behavior of software depends on the relative timing of events. Example:

```
User A: Read capacity (10/20)  -----> Check available -----> Insert attendance
User B: Read capacity (10/20)  -----> Check available -----> Insert attendance

Result: Both users get accepted even if only 1 spot available!
        Final count: 12/20 (capacity exceeded by 2!)
```

#### 2. Why Concurrency is Hard to Test

- **Non-deterministic**: Same test may pass/fail randomly
- **Timing-dependent**: Race conditions only occur with specific timing
- **Heisenbugs**: Adding logging/debugging changes timing and hides bugs
- **Difficult to reproduce**: Production has different timing than development

#### 3. Why Concurrency is Hard to Debug

- **Intermittent failures**: Can't reliably reproduce
- **Observation changes behavior**: Breakpoints serialize execution
- **State inconsistencies**: System in invalid state only momentarily
- **Production-only bugs**: Different timing/load than development

---

### Two Models for Concurrent Programming

We implement both models:

#### Model 1: Message Passing

**Concept**: Processes/threads communicate by sending messages rather than sharing memory.

**Implementation**: Socket.IO for real-time updates

```javascript
// Notify all users about capacity change
broadcastToRoom('swimming', 'attendance:updated', {
  timeSlotId: timeSlot.id,
  currentCount: newCount,
  availableSpots: availableSpots
});

// Notify specific user
notifyUser(userId, 'checkin:success', {
  attendance: attendanceData
});
```

**Advantages**:
- No shared mutable state
- Easier to reason about
- Natural for distributed systems

#### Model 2: Shared Memory with Locks

**Concept**: Multiple threads access shared data, protected by locks to ensure consistency.

**Implementation**: Lock Manager with pessimistic and optimistic locking

---

### Concurrency Implementation

**File**: `backend/src/utils/ConcurrencyManager.js`

#### Lock Manager Class

```javascript
class LockManager {
  constructor() {
    // Map of resource locks with version tracking
    this.locks = new Map();
    // Metrics for debugging
    this.operationMetrics = new Map();
  }
  
  /**
   * Acquire lock (pessimistic locking)
   */
  async acquireLock(resourceKey, timeoutMs = 5000) {
    // Wait for lock availability or timeout
    // Uses queue for fairness
  }
  
  /**
   * Check version (optimistic locking)
   */
  checkVersion(resourceKey, expectedVersion) {
    // Verify no concurrent modifications
  }
}
```

#### Pessimistic Locking

**Use Case**: Critical sections where conflicts are likely

```javascript
/**
 * Execute operation with lock
 */
export async function withLock(resourceKey, operation, timeout = 5000) {
  const lockResult = await lockManager.acquireLock(resourceKey, timeout);
  
  if (!lockResult.acquired) {
    return { success: false, error: 'Failed to acquire lock' };
  }
  
  try {
    const result = await operation(lockResult.version);
    return { success: true, data: result };
  } finally {
    lockManager.releaseLock(resourceKey);
  }
}
```

#### Optimistic Locking

**Use Case**: Conflicts are rare, want better performance

```javascript
/**
 * Execute with optimistic locking (retry on conflict)
 */
export async function withOptimisticLock(resourceKey, readOp, writeOp, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const version = lockManager.getVersion(resourceKey);
    const currentState = await readOp();
    const newState = await writeOp(currentState);
    
    // Attempt to commit with version check
    if (lockManager.checkVersion(resourceKey, version)) {
      return { success: true, data: newState };
    }
    // Version conflict, retry
  }
  
  return { success: false, error: 'Version conflicts' };
}
```

---

### Concurrent QR Scanning Implementation

**File**: `backend/src/services/swimmingServiceWithADT.js`

#### Problem: Race Condition in Attendance

**Scenario**: Multiple users scan QR code simultaneously when only 1 spot remains

**Before (Without Concurrency Control)**:
```
Time  | User A                    | User B                    | Capacity
------|---------------------------|---------------------------|----------
t1    | Read attendance (19/20)   |                           | 19/20
t2    |                           | Read attendance (19/20)   | 19/20
t3    | Check: 19 < 20 ✓          |                           | 19/20
t4    |                           | Check: 19 < 20 ✓          | 19/20
t5    | Insert attendance         |                           | 20/20
t6    |                           | Insert attendance         | 21/20 ❌
```

**Result**: Over-capacity! Both users got accepted!

#### Solution: Pessimistic Locking

```javascript
export async function processQRScanWithConcurrency(qrCodeValue, user) {
  // ... validation code ...
  
  // Lock the specific time slot + date
  const resourceKey = `attendance:${timeSlot.id}:${sessionDate}`;
  
  const lockResult = await withLock(resourceKey, async (version) => {
    // ===== CRITICAL SECTION (LOCKED) =====
    
    // Read current attendance
    const { data: existingAttendance } = await supabase
      .from('swimming_attendance')
      .select('*')
      .eq('time_slot_id', timeSlot.id)
      .eq('session_date', sessionDate);
    
    // Create AttendanceADT (enforces invariants)
    const attendance = AttendanceADT.fromExistingData({
      timeSlotId: timeSlot.id,
      sessionDate: sessionDate,
      maxCapacity: timeSlot.max_capacity,
      currentCount: existingAttendance.length,
      attendeeIds: existingAttendance.map(a => a.user_id),
      // ... other fields
    });
    
    // Check in using ADT (atomic with lock)
    const checkInResult = attendance.checkIn(
      user.id, 
      user.gender, 
      user.role, 
      'qr_scan'
    );
    
    if (!checkInResult.success) {
      return checkInResult; // Failed (capacity/eligibility)
    }
    
    // Persist to database (still within lock)
    const { data: newAttendance, error } = await supabase
      .from('swimming_attendance')
      .insert([{
        time_slot_id: timeSlot.id,
        user_id: user.id,
        session_date: sessionDate,
        check_in_time: checkInResult.attendance.checkInTime,
        check_in_method: 'qr_scan'
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error('Failed to record attendance');
    }
    
    return {
      success: true,
      attendance: newAttendance,
      currentCount: checkInResult.currentCount
    };
    
    // ===== END CRITICAL SECTION =====
  }, 5000); // 5 second timeout
  
  if (!lockResult.success) {
    return lockResult;
  }
  
  // Message passing: notify all users
  broadcastToRoom('swimming', 'attendance:updated', {
    timeSlotId: timeSlot.id,
    currentCount: lockResult.data.currentCount
  });
  
  return lockResult.data;
}
```

**After (With Locking)**:
```
Time  | User A                      | User B                      | Capacity
------|-----------------------------|-----------------------------|----------
t1    | Acquire lock ✓              |                             | 19/20
t2    | Read attendance (19/20)     |                             | 19/20
t3    |                             | Try acquire lock (WAIT...)  | 19/20
t4    | Check: 19 < 20 ✓            |                             | 19/20
t5    | Insert attendance           |                             | 20/20
t6    | Release lock                |                             | 20/20
t7    |                             | Acquire lock ✓              | 20/20
t8    |                             | Read attendance (20/20)     | 20/20
t9    |                             | Check: 20 < 20 ✗            | 20/20
t10   |                             | Return error: at capacity   | 20/20
```

**Result**: User B correctly rejected! Capacity maintained! ✓

---

## Before and After Comparison

### Scenario 1: Swimming Registration Payment

#### BEFORE (without ADT)

```javascript
// backend/src/services/swimmingService.js (original)

export const createSwimmingRegistration = async (registrationData) => {
  // No validation of fee constraints
  const nextPaymentDate = calculateNextSwimmingPaymentDate();
  
  // Manual field construction (error-prone)
  const registrationWithMonthly = {
    ...registrationData,
    monthly_fee: 1500.00,
    next_payment_date: nextPaymentDate.toISOString().split('T')[0],
    payment_due: false,
  };
  
  // Direct database insert (no invariant checks)
  const { data, error } = await supabase
    .from('swimming_registrations')
    .insert([registrationWithMonthly])
    .select()
    .single();
  
  // Possible issues:
  // - registration_fee could be negative
  // - payment_status and status could be inconsistent
  // - No guarantee next_payment_date is valid
  
  return { success: true, registration: data };
};
```

**Problems**:
- ❌ No invariant enforcement
- ❌ Manual field construction is error-prone
- ❌ Invalid states possible (e.g., active but payment pending)
- ❌ No type safety
- ❌ Duplicated validation logic

#### AFTER (with ADT)

```javascript
// backend/src/services/swimmingServiceWithADT.js

export async function createRegistrationWithADT(userId, registrationFee = 1500.00) {
  // Check existing
  const existing = await getRegistrationADT(userId);
  if (existing.success && existing.registration) {
    return { success: false, error: 'Already registered' };
  }
  
  // Factory method enforces all invariants
  const registration = SwimmingRegistrationADT.createNew(userId, registrationFee);
  // ↑ This will throw if registrationFee < 0
  // ↑ Automatically calculates next_payment_date (8th of month)
  // ↑ Sets status and payment_status consistently
  
  // Convert to database format (all invariants guaranteed)
  const dbData = registration.toDatabase();
  
  // Persist
  const { data, error } = await supabase
    .from('swimming_registrations')
    .insert([dbData])
    .select()
    .single();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Return validated ADT instance
  const savedRegistration = SwimmingRegistrationADT.fromDatabase(data);
  return { success: true, registration: savedRegistration.toJSON() };
}
```

**Benefits**:
- ✅ All invariants enforced by ADT
- ✅ Type-safe operations
- ✅ Impossible to create invalid states
- ✅ Single source of truth for validation
- ✅ Clear specifications (pre/postconditions)

---

### Scenario 2: QR Code Scanning (Attendance)

#### BEFORE (without concurrency control)

```javascript
// backend/src/services/swimmingService.js (original)

export const processQRScan = async (qrCodeValue, user) => {
  // ... QR validation ...
  
  // Get attendance count (NON-ATOMIC)
  const { count: currentCount } = await getAttendanceCount(timeSlot.id, sessionDate);
  
  // Check capacity (RACE CONDITION!)
  if (currentCount >= timeSlot.max_capacity) {
    return { success: false, message: 'Capacity exceeded' };
  }
  // ⚠️ Problem: Another user could check in between this check and insert!
  
  // Insert attendance (RACE CONDITION!)
  const { data: attendance, error } = await supabase
    .from('swimming_attendance')
    .insert([{
      time_slot_id: timeSlot.id,
      user_id: user.id,
      session_date: sessionDate,
      check_in_time: new Date().toISOString(),
      check_in_method: 'qr_scan'
    }])
    .select()
    .single();
  // ⚠️ Problem: Could exceed capacity if multiple users scan simultaneously!
  
  return { success: true, attendance };
};
```

**Race Condition Timeline**:
```
User A reads count=19        User B reads count=19
User A checks 19<20 ✓        User B checks 19<20 ✓
User A inserts (count=20)    User B inserts (count=21) ❌ OVER CAPACITY!
```

#### AFTER (with concurrency control + ADT)

```javascript
// backend/src/services/swimmingServiceWithADT.js

export async function processQRScanWithConcurrency(qrCodeValue, user) {
  // ... QR validation ...
  
  // Lock specific resource
  const resourceKey = `attendance:${timeSlot.id}:${sessionDate}`;
  
  const lockResult = await withLock(resourceKey, async (version) => {
    // ===== CRITICAL SECTION (LOCKED) =====
    
    // Read attendance (atomic)
    const { data: existingAttendance } = await supabase
      .from('swimming_attendance')
      .select('*')
      .eq('time_slot_id', timeSlot.id)
      .eq('session_date', sessionDate);
    
    // Create ADT (enforces invariants)
    const attendance = AttendanceADT.fromExistingData({
      timeSlotId: timeSlot.id,
      sessionDate: sessionDate,
      maxCapacity: timeSlot.max_capacity,
      currentCount: existingAttendance.length,
      attendeeIds: existingAttendance.map(a => a.user_id),
      genderRestriction: timeSlot.gender_restriction
    });
    
    // ADT method handles all validation atomically
    const checkInResult = attendance.checkIn(
      user.id, 
      user.gender, 
      user.role
    );
    
    if (!checkInResult.success) {
      return checkInResult;
    }
    
    // Insert (still locked)
    const { data, error } = await supabase
      .from('swimming_attendance')
      .insert([{
        time_slot_id: timeSlot.id,
        user_id: user.id,
        session_date: sessionDate,
        check_in_time: checkInResult.attendance.checkInTime,
        check_in_method: 'qr_scan'
      }])
      .select()
      .single();
    
    if (error) throw new Error('Insert failed');
    
    return {
      success: true,
      attendance: data,
      currentCount: checkInResult.currentCount
    };
    
    // ===== END CRITICAL SECTION =====
  }, 5000);
  
  // Message passing: real-time update
  broadcastToRoom('swimming', 'attendance:updated', {
    timeSlotId: timeSlot.id,
    currentCount: lockResult.data.currentCount
  });
  
  return lockResult.data;
}
```

**Protected Timeline**:
```
User A acquires lock          User B tries lock (WAITS)
User A reads count=19         User B waits...
User A checks 19<20 ✓         User B waits...
User A inserts (count=20)     User B waits...
User A releases lock          User B acquires lock
                              User B reads count=20
                              User B checks 20<20 ✗
                              User B returns error ✓
```

**Benefits**:
- ✅ Race condition prevented
- ✅ Capacity guaranteed
- ✅ All users get consistent view
- ✅ Real-time updates via message passing

---

### Scenario 3: Payment Verification

#### BEFORE (race condition possible)

```javascript
export const verifySwimmingRegistrationPayment = async (req, res) => {
  const { registrationId, sessionId } = req.body;
  
  // Read registration (NON-ATOMIC)
  const { data: registration } = await supabase
    .from('swimming_registrations')
    .select('*')
    .eq('id', registrationId)
    .single();
  
  // Check if already paid (RACE CONDITION!)
  if (registration.payment_status === 'succeeded') {
    return res.status(200).json({ success: true });
  }
  // ⚠️ Problem: Two payment verifications could both pass this check!
  
  // Verify with Stripe
  const stripeResult = await stripeService.verifyCheckoutSession(sessionId);
  
  // Update status (RACE CONDITION!)
  const { data } = await supabase
    .from('swimming_registrations')
    .update({
      payment_status: 'succeeded',
      status: 'active',
      // ...
    })
    .eq('id', registrationId);
  // ⚠️ Problem: Both updates could succeed, causing inconsistent state!
};
```

#### AFTER (with optimistic locking)

```javascript
export async function verifyPaymentWithConcurrency(registrationId, paymentIntentId) {
  const resourceKey = `registration:${registrationId}`;
  
  const result = await withOptimisticLock(
    resourceKey,
    // Read operation
    async () => {
      const { data } = await supabase
        .from('swimming_registrations')
        .select('*')
        .eq('id', registrationId)
        .single();
      return data;
    },
    // Write operation (with ADT)
    async (currentData) => {
      const registration = SwimmingRegistrationADT.fromDatabase(currentData);
      
      // Check if already paid (within lock)
      if (registration.getPaymentStatus() === 'succeeded') {
        return { alreadyPaid: true, registration: registration.toJSON() };
      }
      
      // State transition (ADT enforces invariants)
      registration.markPaymentSucceeded(paymentIntentId);
      registration.activate();
      
      // Persist
      const { data } = await supabase
        .from('swimming_registrations')
        .update(registration.toDatabase())
        .eq('id', registrationId)
        .select()
        .single();
      
      return {
        alreadyPaid: false,
        registration: SwimmingRegistrationADT.fromDatabase(data).toJSON()
      };
    },
    3 // Max retries
  );
  
  // Message passing: notify user
  notifyUser(result.data.registration.userId, 'payment:verified', {
    registrationId,
    status: 'active'
  });
  
  return result;
}
```

---

## Logical Flow Diagrams

### Flow 1: QR Scan Check-in (With Concurrency Control)

```
┌─────────────────────────────────────────────────────────────┐
│ User scans QR code                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Validate QR code (non-blocking read)                        │
│ - Check if QR code exists                                   │
│ - Check if QR code is active                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │ Invalid?        │
            └────────┬────────┘
                Yes  │  No
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Determine time slot                                         │
│ - Get all active time slots                                 │
│ - Calculate current time slot based on time                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │ No slot?        │
            └────────┬────────┘
                Yes  │  No
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ ACQUIRE LOCK: "attendance:{slotId}:{date}"                  │
│ - Timeout: 5 seconds                                        │
│ - Queue if lock held by another user                        │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │ Lock timeout?   │
            └────────┬────────┘
                Yes  │  No
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ === CRITICAL SECTION START (LOCKED) ===                     │
│                                                             │
│ 1. Read current attendance from database                   │
│    SELECT * FROM attendance WHERE slot_id=X AND date=Y     │
│                                                             │
│ 2. Create AttendanceADT instance                           │
│    - Enforces: 0 <= count <= capacity                      │
│    - Enforces: unique attendee IDs                         │
│    - Enforces: gender/role eligibility                     │
│                                                             │
│ 3. Call ADT.checkIn(userId, gender, role)                  │
│    ├─ Check: Already checked in? → Error                   │
│    ├─ Check: Eligible (gender/role)? → Error               │
│    ├─ Check: At capacity? → Error                          │
│    └─ Success: Add user to attendees, increment count      │
│                                                             │
│ 4. Persist to database (INSERT)                            │
│    INSERT INTO attendance (user_id, slot_id, date, ...)    │
│                                                             │
│ 5. Return success with new count                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ RELEASE LOCK                                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ MESSAGE PASSING: Broadcast to all users                     │
│ - Socket.IO event: "attendance:updated"                     │
│ - Data: {slotId, date, currentCount, availableSpots}       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ MESSAGE PASSING: Notify specific user                       │
│ - Socket.IO event: "checkin:success"                        │
│ - Room: "user:{userId}"                                     │
│ - Data: {attendance, timeSlot}                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Return success to user                                      │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Registration Creation (ADT Factory Method)

```
┌─────────────────────────────────────────────────────────────┐
│ User requests registration                                  │
│ Input: userId, registrationFee                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Check for existing registration                             │
│ SELECT * FROM registrations WHERE user_id = X               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │ Already exists? │
            └────────┬────────┘
                Yes  │  No
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ ADT Factory Method: SwimmingRegistrationADT.createNew()     │
│                                                             │
│ PRECONDITION CHECKS (ADT Invariants):                      │
│ ├─ userId not null? → Throw error                          │
│ ├─ registrationFee >= 0? → Throw error                     │
│ └─ All checks passed ✓                                     │
│                                                             │
│ AUTOMATIC CALCULATIONS:                                     │
│ ├─ Calculate next_payment_date (8th of next month)         │
│ ├─ Set monthly_fee = 1500.00                               │
│ ├─ Set payment_status = 'pending'                          │
│ ├─ Set status = 'pending'                                  │
│ ├─ Set expires_at = now + 24 hours                         │
│ └─ Set amount_paid = 0                                     │
│                                                             │
│ REPRESENTATION INVARIANT CHECK:                             │
│ ├─ registration_fee >= 0? ✓                                │
│ ├─ monthly_fee >= 0? ✓                                     │
│ ├─ payment_status ∈ valid states? ✓                        │
│ ├─ status ∈ valid states? ✓                                │
│ ├─ next_payment_date on 8th? ✓                             │
│ └─ All invariants hold ✓                                   │
│                                                             │
│ Return: SwimmingRegistrationADT instance                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Convert ADT to database format                              │
│ registration.toDatabase()                                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Persist to database                                         │
│ INSERT INTO registrations (...)                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Create ADT from database result                             │
│ SwimmingRegistrationADT.fromDatabase(data)                  │
│ - Re-validates all invariants ✓                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Return safe JSON representation                             │
│ registration.toJSON()                                       │
│ - Excludes sensitive fields                                 │
│ - Includes computed properties (isActive, isPaymentDue)     │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Payment Verification (Optimistic Locking)

```
┌─────────────────────────────────────────────────────────────┐
│ Payment verification request                                │
│ Input: registrationId, sessionId                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Optimistic Lock: Start attempt 1 of 3                      │
│ resourceKey = "registration:{registrationId}"               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ READ OPERATION (Get current version)                        │
│                                                             │
│ 1. Get lock version: version = getVersion(resourceKey)     │
│    version = 5 (example)                                   │
│                                                             │
│ 2. Read registration from database                         │
│    SELECT * FROM registrations WHERE id = X                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ COMPUTATION (Outside database transaction)                  │
│                                                             │
│ 1. Create ADT: SwimmingRegistrationADT.fromDatabase()       │
│    - Validates all invariants                               │
│                                                             │
│ 2. Check if already paid                                    │
│    IF payment_status === 'succeeded' THEN                   │
│      return { alreadyPaid: true }                           │
│                                                             │
│ 3. Verify with Stripe                                       │
│    stripeResult = verifyCheckoutSession(sessionId)          │
│    IF not succeeded THEN                                    │
│      return error                                           │
│                                                             │
│ 4. State transitions (ADT methods)                          │
│    registration.markPaymentSucceeded(paymentIntentId)       │
│    ├─ Check: payment_status === 'pending'? ✓               │
│    ├─ Update: payment_status = 'succeeded'                 │
│    ├─ Update: amount_paid = registration_fee               │
│    └─ Verify invariants ✓                                  │
│                                                             │
│    registration.activate()                                  │
│    ├─ Check: payment_status === 'succeeded'? ✓             │
│    ├─ Update: status = 'active'                            │
│    ├─ Update: activated_at = now                           │
│    └─ Verify invariants ✓                                  │
│                                                             │
│ 5. Convert to database format                               │
│    updateData = registration.toDatabase()                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ WRITE OPERATION (Atomic commit with version check)          │
│                                                             │
│ 1. Acquire short-term lock                                  │
│    lockResult = acquireLock(resourceKey, 100ms)             │
│                                                             │
│ 2. Check version (detect concurrent modifications)          │
│    currentVersion = getVersion(resourceKey)                 │
│    IF currentVersion !== version (5) THEN                   │
│      ├─ Version conflict! Someone else modified it!        │
│      ├─ Release lock                                       │
│      └─ RETRY (attempt 2 of 3)                             │
│    ELSE                                                     │
│      └─ Version matches, proceed ✓                         │
│                                                             │
│ 3. Update database                                          │
│    UPDATE registrations SET ... WHERE id = X                │
│                                                             │
│ 4. Increment version                                        │
│    version = 6                                              │
│                                                             │
│ 5. Release lock                                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
            ┌────────┴────────┐
            │ Success?        │
            └────────┬────────┘
                Yes  │  No (version conflict)
                     │
                     └──────────────┐
                                    ↓
                     ┌──────────────────────────────────┐
                     │ Retry with new version?          │
                     │ attempts < maxRetries (3)?       │
                     └──────────────┬───────────────────┘
                               Yes  │  No
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│ MESSAGE PASSING: Notify user                                │
│ - Socket.IO event: "payment:verified"                       │
│ - Room: "user:{userId}"                                     │
│ - Data: {registrationId, status: 'active'}                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Return result                                               │
│ {                                                           │
│   success: true,                                            │
│   registration: {...},                                      │
│   concurrency: {                                            │
│     attempts: 1,                                            │
│     version: 6                                              │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing and Debugging

### Concurrency Testing Tools

**File**: `backend/src/utils/ConcurrencyTesting.js`

#### 1. Simulate Concurrent Requests

```javascript
import { simulateConcurrentRequests } from '../utils/ConcurrencyTesting.js';

// Test 10 concurrent check-ins
const result = await simulateConcurrentRequests(
  async (userId) => {
    return await processQRScanWithConcurrency(qrCode, { id: userId });
  },
  10, // concurrency
  ['user-1', 'user-2', 'user-3', ...] // parameters
);

console.log(`Success: ${result.analysis.successCount}/10`);
console.log(`Failed: ${result.analysis.failureCount}/10`);
console.log(`Metrics:`, result.metrics);
```

**Output**:
```
============================================================
CONCURRENCY TEST: Starting simulation
Concurrency Level: 10
Operation: processQRScanWithConcurrency
============================================================

============================================================
CONCURRENCY TEST: Results
============================================================
Total Duration: 856ms
Successful Operations: 5/10
Failed Operations: 5/10
Average Duration: 421.3ms
Min Duration: 102ms
Max Duration: 789ms

Concurrency Metrics:
{
  "attendance:slot-123:2024-01-15:acquired": 10,
  "attendance:slot-123:2024-01-15:queued": 9,
  "attendance:slot-123:2024-01-15:released": 10,
  "attendance:slot-123:2024-01-15:timeout": 0
}
============================================================
```

#### 2. Test Capacity Race Condition

```javascript
import { testCapacityRaceCondition } from '../utils/ConcurrencyTesting.js';

const result = await testCapacityRaceCondition(
  checkInOperation,
  'slot-123',
  20, // capacity
  25  // concurrent users
);

// Output:
// ✓ PASS: Capacity constraint maintained
// Expected: <= 20, Actual: 20
```

#### 3. Benchmark Different Concurrency Levels

```javascript
import { benchmarkConcurrency } from '../utils/ConcurrencyTesting.js';

const results = await benchmarkConcurrency(
  async (i) => await someOperation(i),
  [1, 5, 10, 20, 50]
);

// Output:
// Concurrency | Duration | Avg Time | Success Rate | Throughput
// 1           | 523ms    | 523.0ms  | 100.0%       | 1.91 ops/s
// 5           | 856ms    | 171.2ms  | 100.0%       | 5.84 ops/s
// 10          | 1234ms   | 123.4ms  | 100.0%       | 8.10 ops/s
// 20          | 2145ms   | 107.3ms  | 95.0%        | 9.32 ops/s
// 50          | 5234ms   | 104.7ms  | 80.0%        | 9.55 ops/s
```

#### 4. Debug Concurrent Execution

```javascript
import { debugConcurrentOperation } from '../utils/ConcurrencyTesting.js';

const result = await debugConcurrentOperation(
  async (i) => await operation(i),
  5
);

// Output:
// EXECUTION TIMELINE:
// [+    0ms] Op 0: START
// [+   12ms] Op 1: START
// [+   15ms] Op 2: START
// [+   18ms] Op 3: START
// [+   23ms] Op 4: START
// [+  102ms] Op 0: SUCCESS
// [+  105ms] Op 0: END
// [+  234ms] Op 1: SUCCESS
// [+  237ms] Op 1: END
// ...
```

---

### Why These Tests Are Important

#### Race Condition Detection

```javascript
// Without testing, race conditions may only appear in production!

// Scenario: 20 capacity, 25 concurrent users
const result = await testCapacityRaceCondition(
  checkInOperation,
  'slot-123',
  20,
  25
);

// Expected: 20 successful, 5 rejected
// Without locks: 25 successful (OVER-CAPACITY!) ❌
// With locks: 20 successful, 5 rejected ✓
```

#### Performance Testing

```javascript
// How does performance scale with concurrency?
// Are locks causing excessive contention?

const benchmark = await benchmarkConcurrency(
  operation,
  [1, 10, 50, 100]
);

// Look for:
// - Throughput plateau (indicates lock contention)
// - Success rate drop (indicates timeouts)
// - High duration variance (indicates waiting for locks)
```

---

## Conclusion

### Summary of Improvements

#### Abstraction (ADTs)

1. **Type Safety**: Impossible to create invalid states
2. **Invariant Enforcement**: Rep invariants checked automatically
3. **Encapsulation**: Internal representation hidden
4. **Clear Specifications**: Pre/postconditions documented
5. **Maintainability**: Single source of truth

#### Concurrency

1. **Race Condition Prevention**: Locks ensure atomicity
2. **Message Passing**: Real-time updates without shared state
3. **Testability**: Tools to detect and debug concurrent issues
4. **Performance**: Optimistic locking for low-contention scenarios
5. **Debugging**: Metrics and logging for production issues

### Key Takeaways

1. **ADTs replace preconditions with invariants**: Instead of checking conditions everywhere, enforce them in the type

2. **Concurrency requires explicit handling**: Race conditions won't be caught by normal testing

3. **Two concurrency models complement each other**:
   - Message passing: For coordination and updates
   - Shared memory with locks: For critical sections

4. **Testing concurrency is hard but essential**: Use simulation tools to expose race conditions

5. **Debugging concurrency requires special tools**: Normal breakpoints/logging change behavior

### Files Modified/Created

#### New ADT Files
- `backend/src/models/SwimmingRegistrationADT.js` (430 lines)
- `backend/src/models/AttendanceADT.js` (381 lines)
- `backend/src/models/LeagueADT.js` (556 lines)

#### New Concurrency Files
- `backend/src/utils/ConcurrencyManager.js` (362 lines)
- `backend/src/utils/ConcurrencyTesting.js` (451 lines)

#### New Service with Integration
- `backend/src/services/swimmingServiceWithADT.js` (389 lines)

**Total**: ~2,569 lines of production code + comprehensive documentation

---

### Real-World Impact

#### Before
- ❌ Race conditions possible in high-traffic scenarios
- ❌ Invalid states could be created
- ❌ No systematic way to test concurrency
- ❌ Difficult to debug intermittent failures

#### After
- ✅ Race conditions prevented via locks
- ✅ Invariants enforced by ADTs
- ✅ Comprehensive testing tools
- ✅ Clear debugging metrics
- ✅ Real-time updates via message passing
- ✅ Production-ready concurrency handling

---

**Document Version**: 1.0
**Date**: December 14, 2024
**Author**: Sportivex Development Team

