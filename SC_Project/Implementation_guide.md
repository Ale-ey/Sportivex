# Software Engineering Concepts - Implementation Guide

## 1. Abstraction (Abstract Data Types)

### Implementation: Swimming Registration ADT

**File**: `backend/src/models/SwimmingRegistrationADT.js`

#### How it's implemented

The ADT uses private fields (`#id`, `#userId`, `#registrationFee`, etc.) to encapsulate state, a `#checkRep()` method that validates representation invariants after every state change, and factory methods for safe object creation.

#### What it's doing

The `SwimmingRegistrationADT` class manages swimming facility registration with payment tracking. It enforces business rules through invariants: fees must be non-negative, active registrations require succeeded payments, and state transitions follow defined rules. The `activate()` method can only be called when payment has succeeded, ensuring data integrity.

#### Benefits

- **Data Integrity**: Invariants are automatically checked after every mutation
- **Reduced Preconditions**: ADT guarantees valid state, so callers don't need to check everything
- **Encapsulation**: Private fields prevent direct access to internal representation
- **Clear Contracts**: Methods have clear preconditions/postconditions

#### Code Snippet

```62:123:backend/src/models/SwimmingRegistrationADT.js
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

---

## 2. Specifications

### Implementation: QR Code Processing Function

**File**: `backend/src/services/swimmingService.js`

#### How it's implemented

The function uses explicit preconditions (QR code validation, user data checks) at the start, operational steps (sequential validation chain), and clear postconditions (success creates attendance record, failure returns specific error). Each step returns early if validation fails.

#### What it's doing

The `processQRScan` function handles QR code scanning for swimming pool check-in. It validates the QR code, determines the appropriate time slot using a 10-minute rule, checks user eligibility (gender/role restrictions), prevents duplicates, verifies capacity, and creates an attendance record. Each validation step narrows the problem space until success or a specific failure.

#### Benefits

- **Clear Contract**: Preconditions/postconditions document exactly what's expected
- **Easier Debugging**: Step-by-step returns make it easy to identify which validation failed
- **Prevents Bugs**: Preconditions catch invalid inputs before processing
- **Self-Documenting**: Specifications serve as precise documentation

#### Code Snippet

```375:458:backend/src/services/swimmingService.js
// backend/src/services/swimmingService.js
export const processQRScan = async (qrCodeValue, user) => {
  // Step 1: Validate QR Code (PRECONDITION CHECK)
  const { data: qrCode, error: qrError } = await supabaseAdmin
    .from('swimming_qr_codes')
    .select('*')
    .eq('qr_code_value', qrCodeValue)
    .eq('is_active', true)
    .single();

  if (qrError || !qrCode) {
    return { success: false, message: 'Invalid or inactive QR code' };
  }

  // Step 2: Retrieve Active Time Slots
  const { success: slotsSuccess, data: timeSlots } = await getActiveTimeSlots();
  
  if (!slotsSuccess || timeSlots.length === 0) {
    return { success: false, message: 'No time slots available today' };
  }

  // Step 3: Determine Appropriate Time Slot
  const slotDetermination = determineTimeSlot(timeSlots, new Date());
  
  if (slotDetermination.error) {
    return { success: false, message: slotDetermination.message };
  }

  const assignedSlot = slotDetermination.slot;

  // Step 4: Validate User Eligibility
  const eligibility = validateUserEligibility(user, assignedSlot);
  
  if (!eligibility.isValid) {
    return { success: false, message: eligibility.message };
  }

  // Step 5: Prevent Duplicate Check-In
  const existingAttendance = await checkExistingAttendance(user.id, assignedSlot.id);
  
  if (existingAttendance) {
    return { 
      success: false, 
      alreadyCheckedIn: true, 
      message: 'Already checked in for this slot' 
    };
  }

  // Step 6: Check Capacity
  const { count: currentCount } = await getAttendanceCount(assignedSlot.id, new Date());
  
  if (currentCount >= assignedSlot.max_capacity) {
    return { 
      success: false, 
      capacityExceeded: true, 
      message: 'Time slot is at full capacity' 
    };
  }

  // Step 7: Save Attendance (POSTCONDITION: attendance record created)
  const { data: attendance, error: attendanceError } = await supabaseAdmin
    .from('swimming_attendance')
    .insert({
      time_slot_id: assignedSlot.id,
      user_id: user.id,
      session_date: new Date().toISOString().split('T')[0],
      check_in_time: new Date().toISOString(),
      check_in_method: 'qr_scan'
    })
    .select()
    .single();

  if (attendanceError) {
    return { success: false, message: 'Failed to record attendance' };
  }

  // POSTCONDITION SATISFIED: Return success with attendance record
  return {
    success: true,
    message: 'Check-in successful',
    attendance,
    timeSlot: assignedSlot
  };
};
```

---

## 3. Mutability

### Implementation: Safe Profile Updates

**File**: `backend/src/controllers/authController.js`

#### How it's implemented

Instead of mutating `req.body` directly, the function creates a new `updateData` object by conditionally copying only the fields that are defined. This leaves the original request body untouched, preventing side effects on shared references.

#### What it's doing

The `updateProfile` function safely updates user profile data by building a new object with only the fields to update. It checks each field from `req.body`, trims strings where needed, and only adds defined fields to `updateData`. The original `req.body` remains unchanged, so other middleware or functions can still access the original data.

#### Benefits

- **No Side Effects**: Original `req.body` remains unchanged for other code to use
- **Safe for Logging**: Error handlers and logging can see what user actually sent
- **Prevents Aliasing Bugs**: Multiple functions can safely read from same request object
- **Easier Debugging**: Original data available if update fails

#### Code Snippet

```770:805:backend/src/controllers/authController.js
// ✅ GOOD: Create new object, leave original untouched
const updateProfile = async (req, res) => {
  const { name, phone, dateOfBirth, address, profilePictureUrl, bio } = req.body;
  
  // Build a NEW object with validated data
  const updateData = {};
  
  if (name !== undefined) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone;
  if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
  if (address !== undefined) updateData.address = address;
  if (profilePictureUrl !== undefined) updateData.profile_picture_url = profilePictureUrl;
  if (bio !== undefined) updateData.bio = bio;

  // req.body remains unchanged - safe!
  const { data: updatedUser, error } = await supabaseAdmin
    .from('users_metadata')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    return res.status(400).json({
      success: false,
      message: 'Failed to update profile'
    });
  }

  return res.status(200).json({
    success: true,
    data: updatedUser
  });
};
```

---

## 4. Recursion

### Implementation: Nested Time Slot Hierarchy Search

**File**: `backend/src/utils/timeSlotDetermination.js`

#### How it's implemented

The recursive function `findMatchingSlot` processes a hierarchy of slots with nested sub-slots. It checks each slot at the current level, and if a slot has sub-slots, it recursively calls itself to search deeper. Base cases handle empty hierarchies, leaf slots (no sub-slots), and no match found.

#### What it's doing

The function searches through a tree structure of time slots where slots can contain nested sub-slots at any depth. For each slot, it checks if the current time matches. If the slot has sub-slots, it recursively searches those. This naturally handles arbitrary nesting depth without needing nested loops or knowing the structure beforehand.

#### Benefits

- **Handles Arbitrary Depth**: Works with 2 levels or 10 levels without code changes
- **Clean Code**: Single recursive function replaces complex nested loops
- **Natural for Trees**: Recursive structure matches recursive data structure
- **Easy to Extend**: Adding new validation logic only requires changes in one place

#### Code Snippet

```1108:1156:backend/src/utils/timeSlotDetermination.js
// ✅ Recursive approach for nested slots
export const findMatchingSlot = (slotHierarchy, currentDateTime) => {
  // BASE CASE 1: No slots to check
  if (!slotHierarchy || slotHierarchy.length === 0) {
    return { error: true, message: 'No slots available' };
  }

  // Iterate through current level
  for (const slot of slotHierarchy) {
    // BASE CASE 2: Time matches this leaf slot
    if (isCurrentTimeInSlot(currentDateTime, slot) && !slot.subSlots) {
      return { slot, error: false };
    }

    // RECURSIVE CASE: Slot has sub-slots, search deeper
    if (slot.subSlots && slot.subSlots.length > 0) {
      const result = findMatchingSlot(slot.subSlots, currentDateTime);
      
      if (!result.error) {
        return result; // Found in sub-slots
      }
    }
  }

  // BASE CASE 3: No match found at this level
  return { error: true, message: 'No matching slot in hierarchy' };
};

// Usage
const weeklySchedule = [
  {
    day: 'Monday',
    subSlots: [
      {
        name: 'Morning',
        start_time: '06:00',
        end_time: '12:00',
        subSlots: [
          { name: 'Early', start_time: '06:00', end_time: '08:00' },
          { name: 'Late', start_time: '08:00', end_time: '12:00' }
        ]
      }
    ]
  }
];

const result = findMatchingSlot(weeklySchedule, new Date());
```

---

## 5. Code Review

### Implementation: Dependency Injection for Database Access

**File**: `backend/src/services/gymService.js`

#### How it's implemented

Instead of directly importing `supabaseAdmin` at the module level, the function accepts a database client as an optional parameter with a default value. This allows callers to inject a different database (like a mock for testing) while defaulting to the real database in production.

#### What it's doing

The `saveWorkout` function receives a database client as its third parameter (with `supabaseAdmin` as default). This decouples the function from a specific database implementation. In tests, a mock database can be passed. In production, the default real database is used. This makes the function testable without requiring a real database connection.

#### Benefits

- **Testability**: Can pass mock databases in tests without real DB connection
- **Flexibility**: Easy to swap database implementations (e.g., SQLite for tests, PostgreSQL for production)
- **Isolation**: Business logic can be tested separately from database operations
- **No Global State**: Function explicitly shows its dependencies

#### Code Snippet

```1567:1609:backend/src/services/gymService.js
// ✅ GOOD: Use dependency injection for loose coupling

// Option 1: Function Parameter (Simple)
export const saveWorkout = async (userId, workoutData, db = supabaseAdmin) => {
  const { data, error } = await db
    .from('gym_workouts')
    .insert(workoutData);
  
  return data;
};

// Now in tests:
const mockDB = {
  from: () => ({
    insert: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
  })
};

await saveWorkout(123, workoutData, mockDB); // Uses mock!
await saveWorkout(123, workoutData); // Uses real DB (default)


// Option 2: Service Layer (Advanced)
export class DatabaseService {
  constructor(client) {
    this.client = client;
  }
  
  async insertWorkout(data) {
    return this.client.from('gym_workouts').insert(data);
  }
  
  async getWorkout(id) {
    return this.client.from('gym_workouts').select('*').eq('id', id).single();
  }
}

// In production:
const dbService = new DatabaseService(supabaseAdmin);

// In tests:
const mockDbService = new DatabaseService(mockClient);
```

---

## 6. Static Checking and Testing

### Implementation: Zod Schema Validation

**File**: `frontend/src/validator/auth.validator.ts`

#### How it's implemented

Zod schemas define the structure and constraints of data. The `registerSchema` specifies validation rules (string lengths, regex patterns, enum values) and type information. When `schema.parse()` is called, it validates the data and returns typed data if valid, or throws a `ZodError` with detailed validation messages if invalid.

#### What it's doing

The schema validates user registration data before it reaches business logic. It checks that names contain only letters, emails are valid format, passwords meet complexity requirements (uppercase, lowercase, numbers, special chars), and enums match allowed values. This acts like static type checking at runtime, catching errors early and providing clear feedback about what's wrong.

#### Benefits

- **Early Error Detection**: Invalid data is caught before reaching business logic
- **Type Safety**: Validated data has guaranteed structure and types
- **Clear Error Messages**: Zod provides specific field-level error messages
- **Documentation**: Schema serves as living documentation of expected data shape
- **Prevents Bugs**: Invalid data never enters the system

#### Code Snippet

```1989:2049:frontend/src/validator/auth.validator.ts
import { z } from 'zod';

// Define schema: Acts like static type checking at runtime
export const registerSchema = z.object({
  // String constraints
  fullName: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Name too long')
    .regex(/^[A-Za-z\s]+$/, 'Name must contain only letters'),
  
  // Email validation
  email: z.string()
    .trim()
    .email('Invalid email format'),
  
  // Complex password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be at most 32 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'Password must contain special character'),
  
  // Enum validation
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be male or female' })
  }),
  
  // Role validation
  role: z.enum(['undergraduate', 'postgraduate', 'faculty', 'alumni'])
});

// Type inference: Get TypeScript type from schema
export type RegisterFormData = z.infer<typeof registerSchema>;

// Usage in controller
export const register = async (req, res) => {
  try {
    // Validate request body against schema
    const validatedData = registerSchema.parse(req.body);
    
    // If we reach here, data is guaranteed valid!
    // validatedData has correct types and constraints
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Get specific validation errors
      return res.status(400).json({
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
  }
};
```

---
