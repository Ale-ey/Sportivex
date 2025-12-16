# Software Engineering Concepts - Implementation Guide Part 2

## Table of Contents
1. [Specifications](#specifications)
2. [Mutability](#mutability)
3. [Recursion](#recursion)
4. [Code Review](#code-review)
5. [Static Checking and Testing](#static-checking-and-testing)

---

## Specifications

### What are Specifications?

A **specification** is a contract between a function and its client. It describes what the function does, what conditions must be true before calling it (preconditions), and what will be true after it executes (postconditions).

### Types of Specifications

#### 1. Declarative Specifications
Describes **WHAT** the function accomplishes without describing **HOW** it does it.

#### 2. Operational Specifications
Describes **HOW** the function works step-by-step.

---

### Implementation 1: QR Code Processing

**File**: `backend/src/services/swimmingService.js`

#### Function Purpose
Processes QR code scanning for swimming pool attendance check-in.

#### Declarative Specification

```javascript
/**
 * @function processQRScan
 * @description Processes QR code scanning for swimming pool attendance check-in.
 * 
 * @precondition
 * - qrCodeValue is a non-empty string.
 * - qrCodeValue matches the pattern: "SWIMMING-{timestamp}-{random}".
 * - QR code exists in swimming_qr_codes table AND is_active = true.
 * - user object contains: { id, gender, role }.
 * - At least one active time slot exists for the current day.
 * 
 * @postcondition
 * - SUCCESS:
 *    - A new attendance record is added to swimming_attendance.
 *    - Record contains: time_slot_id, user_id, session_date, check_in_time, check_in_method='qr_scan'.
 *    - Time slot attendance count increases by 1.
 * - FAILURE:
 *    - No attendance record is created.
 *    - Returns an error response describing the specific failure reason.
 * 
 * @returns {Object} 
 *   {
 *     success: boolean,
 *     message: string,
 *     attendance?: Attendance,
 *     timeSlot?: TimeSlot,
 *     capacityExceeded?: boolean,
 *     alreadyCheckedIn?: boolean,
 *     error?: string
 *   }
 */
```

#### Operational Specification

```javascript
/**
 * @function processQRScan
 * @description Operational steps for swimming attendance QR scan processing.
 * 
 * OPERATIONAL STEPS:
 * 
 * 1. Validate QR Code:
 *    - Query swimming_qr_codes WHERE qr_code_value = qrCodeValue AND is_active = true.
 *    - If not found, return error "Invalid or inactive QR code".
 * 
 * 2. Retrieve Active Time Slots:
 *    - Query swimming_time_slots WHERE is_active = true AND matches today's weekday.
 *    - If none found, return error "No time slots available today".
 * 
 * 3. Determine Appropriate Time Slot:
 *    - Use determineTimeSlot() with a 10-minute rule:
 *         • If within 10 minutes of next slot → assign next slot.
 *         • If inside any slot → assign that slot.
 *         • If before first slot → assign first slot.
 *         • If after last slot → return error "All slots have ended".
 * 
 * 4. Validate User Eligibility:
 *    - validateUserEligibility(user, timeSlot):
 *         • Gender match OR restriction = 'mixed' OR role allows 'faculty_pg'.
 *    - If invalid → return "Access denied: gender/role restriction".
 * 
 * 5. Prevent Duplicate Check-In:
 *    - Query swimming_attendance for existing check-in (same user, date, and slot).
 *    - If found → return { alreadyCheckedIn: true, message: "Already checked in" }.
 * 
 * 6. Check Capacity:
 *    - Fetch current attendance count.
 *    - If count >= max_capacity → return { capacityExceeded: true, message: "Capacity full" }.
 * 
 * 7. Save Attendance:
 *    - Insert attendance record with check_in_method='qr_scan'.
 *    - Return success response with record and assigned time slot.
 */
```

#### Implementation Example

```javascript
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

#### Key Specification Principles

1. **Preconditions Define Valid Inputs**
   - QR code must be active and valid
   - User must have required fields (id, gender, role)
   - Time slots must exist

2. **Postconditions Define Guaranteed Outcomes**
   - Success: Attendance record exists in database
   - Failure: No record created, specific error message returned

3. **Declarative Specs Focus on WHAT**
   - "A new attendance record is added" (not HOW it's added)
   - "Time slot attendance count increases by 1" (the outcome)

4. **Operational Specs Focus on HOW**
   - Step-by-step algorithm
   - Specific queries and validation order
   - Detailed error handling at each step

---

### Implementation 2: Workout Saving with Calorie Calculation

**File**: `backend/src/services/gymService.js`

#### Declarative Specification

```javascript
/**
 * @function saveWorkout
 * @description Saves a workout session with exercises and calculates total calories burned.
 * 
 * @precondition
 * - user object contains: { id, weight }.
 * - user.weight is a positive number (in kg).
 * - exercises is a non-empty array.
 * - Each exercise contains: { name, sets, reps, duration, met_value }.
 * - met_value is a positive number representing metabolic equivalent.
 * - sets, reps, and duration are non-negative integers.
 * - duration is in minutes.
 * 
 * @postcondition
 * - SUCCESS:
 *    - A new workout record is created in gym_workouts table.
 *    - Record contains: user_id, session_date, total_duration, total_calories, status='completed'.
 *    - Each exercise is saved in workout_exercises table with calculated calories.
 *    - calories_burned = (met_value × weight × duration) / 60.
 *    - Returns workout summary with all exercises and totals.
 * - FAILURE:
 *    - No workout or exercise records are created.
 *    - Returns an error response describing the failure reason.
 * 
 * @returns {Object} 
 *   {
 *     success: boolean,
 *     message: string,
 *     workout?: {
 *       id: number,
 *       totalDuration: number,
 *       totalCalories: number,
 *       exercises: Array<Exercise>
 *     },
 *     error?: string
 *   }
 */
```

#### Operational Specification

```javascript
/**
 * @function saveWorkout
 * @description Operational steps for saving workout with calorie calculation.
 * 
 * OPERATIONAL STEPS:
 * 
 * 1. Validate Input Data:
 *    - Check user.weight exists and is positive.
 *    - Check exercises array is not empty.
 *    - For each exercise: validate met_value, sets, reps, duration are valid numbers.
 *    - If invalid → return error "Invalid workout data".
 * 
 * 2. Create Workout Session Record:
 *    - Insert new record into gym_workouts table.
 *    - Set user_id, session_date (current date), status='in_progress'.
 *    - If insert fails → return error "Failed to create workout session".
 * 
 * 3. Calculate and Save Each Exercise:
 *    - For each exercise in exercises array:
 *         • Calculate calories: (met_value × user.weight × duration) / 60.
 *         • Insert into workout_exercises table with workout_id, exercise details, calculated calories.
 *         • If any insert fails → rollback transaction, return error.
 * 
 * 4. Calculate Workout Totals:
 *    - Sum all exercise durations → total_duration.
 *    - Sum all calculated calories → total_calories.
 * 
 * 5. Update Workout Record:
 *    - Update gym_workouts with total_duration, total_calories.
 *    - Set status='completed'.
 *    - If update fails → return error "Failed to complete workout".
 * 
 * 6. Return Success Response:
 *    - Return workout summary with id, totals, and array of exercises with calories.
 */
```

#### Implementation

```javascript
// backend/src/services/gymService.js
export const saveWorkout = async (user, exercises) => {
  // STEP 1: Validate Input Data (PRECONDITION CHECKS)
  if (!user.weight || user.weight <= 0) {
    return { success: false, message: 'Invalid user weight' };
  }

  if (!exercises || exercises.length === 0) {
    return { success: false, message: 'Exercises array cannot be empty' };
  }

  for (const exercise of exercises) {
    if (!exercise.met_value || exercise.met_value <= 0) {
      return { success: false, message: `Invalid MET value for ${exercise.name}` };
    }
  }

  // STEP 2: Create Workout Session Record
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from('gym_workouts')
    .insert({
      user_id: user.id,
      session_date: new Date().toISOString().split('T')[0],
      status: 'in_progress'
    })
    .select()
    .single();

  if (workoutError) {
    return { success: false, message: 'Failed to create workout session' };
  }

  // STEP 3: Calculate and Save Each Exercise
  const savedExercises = [];
  
  for (const exercise of exercises) {
    // Calorie calculation formula: (MET × weight × duration) / 60
    const caloriesBurned = (exercise.met_value * user.weight * exercise.duration) / 60;

    const { data: savedExercise, error: exerciseError } = await supabaseAdmin
      .from('workout_exercises')
      .insert({
        workout_id: workout.id,
        exercise_name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        met_value: exercise.met_value,
        calories_burned: caloriesBurned
      })
      .select()
      .single();

    if (exerciseError) {
      // Rollback: Delete the workout record
      await supabaseAdmin.from('gym_workouts').delete().eq('id', workout.id);
      return { success: false, message: 'Failed to save exercise' };
    }

    savedExercises.push(savedExercise);
  }

  // STEP 4: Calculate Workout Totals
  const totalDuration = savedExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = savedExercises.reduce((sum, ex) => sum + ex.calories_burned, 0);

  // STEP 5: Update Workout Record
  const { error: updateError } = await supabaseAdmin
    .from('gym_workouts')
    .update({
      total_duration: totalDuration,
      total_calories: totalCalories,
      status: 'completed'
    })
    .eq('id', workout.id);

  if (updateError) {
    return { success: false, message: 'Failed to complete workout' };
  }

  // STEP 6: Return Success Response (POSTCONDITION SATISFIED)
  return {
    success: true,
    message: 'Workout saved successfully',
    workout: {
      id: workout.id,
      totalDuration,
      totalCalories,
      exercises: savedExercises
    }
  };
};
```

---

### Implementation 3: Time Slot Filtering

**File**: `backend/src/controllers/swimmingController.js`

#### Declarative Specification

```javascript
/**
 * @function getTimeSlots
 * @description Retrieves and filters time slots based on user eligibility.
 * 
 * @precondition
 * - user object contains: { id, gender, role }.
 * - user.gender is either 'male' or 'female'.
 * - user.role is one of: 'undergraduate', 'postgraduate', 'faculty', 'alumni'.
 * - At least one time slot exists in the database.
 * 
 * @postcondition
 * - SUCCESS:
 *    - Returns array of time slots where user meets eligibility criteria.
 *    - Each slot includes: id, start_time, end_time, gender_restriction, max_capacity, current_count, available_spots.
 *    - Filtered based on gender_restriction rules:
 *         • 'mixed' → all users can see.
 *         • 'male' → only male users can see.
 *         • 'female' → only female users can see.
 *         • 'faculty_pg' → only faculty and postgraduate users can see.
 *    - Slots are enriched with real-time attendance data.
 *    - Available spots = max_capacity - current_count.
 * - FAILURE:
 *    - Returns empty array if no slots match user's eligibility.
 *    - Returns error if database query fails.
 * 
 * @returns {Object} 
 *   {
 *     success: boolean,
 *     message: string,
 *     slots?: Array<{
 *       id: number,
 *       start_time: string,
 *       end_time: string,
 *       gender_restriction: string,
 *       max_capacity: number,
 *       current_count: number,
 *       available_spots: number
 *     }>,
 *     error?: string
 *   }
 */
```

#### Benefits of Good Specifications

1. **Clear Contract**: Both caller and implementer know exactly what to expect
2. **Easier Testing**: Specifications define test cases directly
3. **Prevents Bugs**: Clear preconditions prevent invalid inputs
4. **Documentation**: Specs serve as precise documentation
5. **Flexibility**: Implementation can change as long as specs are met

---

## Mutability

### What is Mutability?

**Mutability** refers to the ability to change data after it's created. Mutable objects can be modified, which can lead to bugs when multiple parts of code share references to the same object.

### Risks of Mutation

1. **Aliasing Bugs**: Two variables pointing to same object see each other's changes
2. **Unexpected Side Effects**: Functions modifying shared data
3. **Race Conditions**: Concurrent modifications causing inconsistency
4. **Hard to Debug**: Changes happen at distance from original data

---

### Implementation 1: Safe Profile Updates

**File**: `backend/src/controllers/authController.js`

#### The Problem: Direct Mutation

```javascript
// ❌ BAD: Direct mutation of request body
const updateProfile = async (req, res) => {
  // If we mutate req.body directly, other middleware or functions
  // that reference req.body will see unexpected changes
  req.body.name = req.body.name.trim();
  req.body.phone = req.body.phone || null;
  
  // Now req.body has been mutated - dangerous if shared!
  await supabaseAdmin.from('users_metadata').update(req.body);
};
```

**Why This is Dangerous:**
- Other middleware might still need the original `req.body`
- Logging middleware will see modified data
- Error handlers can't show what user actually sent
- Multiple requests might share the same object reference

#### The Solution: Build New Objects

```javascript
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

#### Key Principle: Building vs Mutating

**Building (Good):**
```javascript
// Create NEW object
const updateData = {};
if (name) updateData.name = name.trim();
```

**Mutating (Risky):**
```javascript
// Modify EXISTING object
req.body.name = req.body.name.trim();
```

---

### Implementation 2: Immutable Data Enrichment

**File**: `backend/src/controllers/swimmingController.js`

#### The Problem: Mutating Shared Arrays

```javascript
// ❌ BAD: Mutating original slot objects
const getTimeSlots = async (req, res) => {
  const { data } = await supabaseAdmin
    .from('swimming_time_slots')
    .select('*');

  // Danger! Adding properties to original objects
  for (const slot of data) {
    const count = await getAttendanceCount(slot.id);
    slot.currentCount = count; // MUTATION!
    slot.availableSpots = slot.max_capacity - count; // MUTATION!
  }

  // If 'data' is cached or used elsewhere, it now has unexpected properties
  return res.json(data);
};
```

**Why This is Dangerous:**
- If `data` is cached, the cache now has extra properties
- Other functions using the same data see unexpected fields
- Database layer might try to save the extra properties
- Hard to trace where properties were added

#### The Solution: Create New Objects with Spread Operator

```javascript
// ✅ GOOD: Create new objects, leave originals untouched
const getTimeSlots = async (req, res) => {
  const { data } = await supabaseAdmin
    .from('swimming_time_slots')
    .select('*');

  // Create NEW enriched objects using spread operator
  const enrichedData = await Promise.all(
    data.map(async (slot) => {
      const { count } = await getAttendanceCount(slot.id, today);
      
      // ...slot creates a COPY of all slot properties
      // Then we add new properties to the COPY
      return {
        ...slot,  // Spreads all properties into new object
        currentCount: count,
        availableSpots: slot.max_capacity - count
      };
    })
  );

  // Original 'data' array is completely unchanged
  // enrichedData contains new objects with additional fields
  return res.json({
    success: true,
    slots: enrichedData
  });
};
```

#### How Spread Operator Works

```javascript
const original = { id: 1, name: 'Pool A' };

// Spread creates a NEW object with copied properties
const copy = { ...original, currentCount: 5 };

console.log(original); // { id: 1, name: 'Pool A' } - unchanged!
console.log(copy);     // { id: 1, name: 'Pool A', currentCount: 5 } - new object!
```

---

### Implementation 3: Array Mutation in Sorting

**File**: `backend/src/utils/timeSlotDetermination.js`

#### The Problem: sort() Mutates Original Array

```javascript
// ❌ BAD: .sort() mutates the input array
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  // DANGER: Array.sort() modifies the original array IN PLACE!
  const sortedSlots = timeSlots.sort((a, b) => {
    const timeA = parseTime(a.start_time);
    const timeB = parseTime(b.start_time);
    return timeA - timeB;
  });

  // Even though we assigned to 'sortedSlots',
  // both 'sortedSlots' and 'timeSlots' point to the SAME array
  // The original timeSlots array is now reordered!

  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    // ... determine logic
  }
};

// PROBLEM IN CALLER:
const slots = getTimeSlots(); // Ordered by name
console.log(slots[0].name); // "Alpha Pool"

determineTimeSlot(slots, new Date());
console.log(slots[0].name); // "Beta Pool" - ORDER CHANGED! Bug!
```

**Why This is Dangerous:**
- Caller's array is reordered without warning
- Other functions expecting original order break
- Hard to debug because mutation happens inside called function
- Violates principle of least surprise

#### The Solution: Copy Before Sorting

```javascript
// ✅ GOOD: Create a copy before sorting
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  // Create a COPY of the array using spread operator
  // Then sort the COPY, leaving original untouched
  const sortedSlots = [...timeSlots].sort((a, b) => {
    const timeA = parseTime(a.start_time);
    const timeB = parseTime(b.start_time);
    return timeA - timeB;
  });

  // Now sortedSlots is a NEW array, timeSlots is unchanged
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    // ... determine logic
  }
};

// NO PROBLEM IN CALLER:
const slots = getTimeSlots(); // Ordered by name
console.log(slots[0].name); // "Alpha Pool"

determineTimeSlot(slots, new Date());
console.log(slots[0].name); // "Alpha Pool" - UNCHANGED! Safe!
```

#### Mutating vs Non-Mutating Array Methods

**Mutating Methods (Dangerous):**
```javascript
array.sort()     // Reorders in place
array.reverse()  // Reverses in place
array.push()     // Adds to original
array.splice()   // Modifies in place
```

**Non-Mutating Methods (Safe):**
```javascript
array.map()      // Returns new array
array.filter()   // Returns new array
array.slice()    // Returns new array
[...array]       // Creates copy
```

---

### Mutations and Contracts

#### Documenting Mutation in Specifications

```javascript
/**
 * @function processData
 * @description Processes and enriches data array
 * 
 * @param {Array} data - Input data array
 * @mutates data - Sorts array in place and adds 'processed' flag to each element
 * 
 * @precondition data is a non-empty array
 * @postcondition 
 * - data is sorted by timestamp
 * - Each element has 'processed' property set to true
 * - Returns the count of processed items
 */
export const processData = (data) => {
  // CLEARLY DOCUMENTED that this function mutates input
  data.sort((a, b) => a.timestamp - b.timestamp);
  data.forEach(item => item.processed = true);
  return data.length;
};
```

#### Best Practices for Mutability

1. **Prefer Immutability**: Create new objects instead of modifying existing ones
2. **Document Mutations**: Clearly state in specs when functions mutate inputs
3. **Use Const**: Declare variables with `const` to prevent reassignment
4. **Copy Defensively**: Make copies of inputs before modifying
5. **Return New Objects**: Don't modify and return; create new object and return that

```javascript
// ✅ GOOD PATTERN: Immutable update
const updateUser = (user, changes) => {
  return {
    ...user,
    ...changes,
    updatedAt: new Date()
  };
};

// ❌ BAD PATTERN: Mutating update
const updateUser = (user, changes) => {
  user.name = changes.name;
  user.updatedAt = new Date();
  return user;
};
```

---

## Recursion

### What is Recursion?

**Recursion** is a problem-solving technique where a function calls itself to solve smaller instances of the same problem. Every recursive solution needs:
1. **Base Case**: The simplest instance that can be solved directly
2. **Recursive Case**: Breaking the problem into smaller subproblems
3. **Progress**: Each recursive call must move toward the base case

---

### Implementation 1: Nested Time Slot Structures

**Conceptual File**: `backend/src/utils/timeSlotDetermination.js`

#### Current Iterative Approach

```javascript
// Current implementation: Iterative loop
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  const sortedSlots = [...timeSlots].sort((a, b) => {
    const timeA = parseTime(a.start_time);
    const timeB = parseTime(b.start_time);
    return timeA - timeB;
  });

  // Iterative approach - loops through slots
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    
    if (isCurrentTimeInSlot(currentDateTime, slot)) {
      return { slot, error: false };
    }
    
    if (i < sortedSlots.length - 1) {
      const minutesUntilNext = getMinutesUntil(currentDateTime, sortedSlots[i + 1]);
      if (minutesUntilNext <= 10) {
        return { slot: sortedSlots[i + 1], error: false };
      }
    }
  }
  
  return { error: true, message: 'No appropriate time slot found' };
};
```

#### Recursive Approach for Nested Structures

**Problem**: What if time slots have nested sub-slots?

```
Weekly Schedule
├── Monday
│   ├── Morning Session (6:00-12:00)
│   │   ├── Slot 1 (6:00-8:00)
│   │   └── Slot 2 (8:00-12:00)
│   └── Evening Session (16:00-20:00)
│       ├── Slot 1 (16:00-18:00)
│       └── Slot 2 (18:00-20:00)
└── Tuesday
    └── ...
```

```javascript
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

**Why Recursion is Natural Here:**
- Same logic at each level: "Does time match this slot?"
- Tree-like structure: Each slot may have sub-slots
- Unknown depth: Could be 2 levels or 10 levels deep
- Clean code: No need for nested loops

---

### Implementation 2: Recursive QR Code Parsing

**File**: `backend/src/services/swimmingService.js`

#### Current Sequential Validation

```javascript
// Current approach: Sequential checks
export const processQRScan = async (qrCodeValue, user) => {
  // Step 1: Validate QR code
  if (qrError || !qrCode) {
    return { success: false, message: 'Invalid QR code' };
  }
  
  // Step 2: Get time slots
  if (!slotsSuccess || timeSlots.length === 0) {
    return { success: false, message: 'No slots' };
  }
  
  // Step 3: Determine slot
  if (slotDetermination.error) {
    return { success: false, message: slotDetermination.message };
  }
  
  // Each step depends on previous - narrowing problem space
};
```

#### Recursive Approach for Nested QR Codes

**Problem**: What if QR codes have nested structure?
- Format: `SWIMMING-POOL1-LANE2-ABC123`
- Each segment validates different level

```javascript
// ✅ Recursive QR parsing for nested structure
const parseQRSegments = (segments, index = 0) => {
  // BASE CASE: Reached the final identifier
  if (index >= segments.length - 1) {
    const finalId = segments[index];
    return { valid: true, identifier: finalId };
  }

  // Get current segment
  const currentSegment = segments[index];

  // VALIDATION: Check current level
  if (index === 0 && currentSegment !== 'SWIMMING') {
    return { valid: false, error: 'Must start with SWIMMING' };
  }

  if (index === 1 && !currentSegment.startsWith('POOL')) {
    return { valid: false, error: 'Second segment must be POOL' };
  }

  if (index === 2 && !currentSegment.startsWith('LANE')) {
    return { valid: false, error: 'Third segment must be LANE' };
  }

  // RECURSIVE CASE: Validate next level
  // Problem becomes smaller (fewer segments to check)
  return parseQRSegments(segments, index + 1);
};

// Usage
export const validateNestedQRCode = (qrCodeValue) => {
  // Split QR code: "SWIMMING-POOL1-LANE2-ABC123" -> ["SWIMMING", "POOL1", "LANE2", "ABC123"]
  const segments = qrCodeValue.split('-');

  // BASE CASE: Not enough segments
  if (segments.length < 2) {
    return { valid: false, error: 'QR code too short' };
  }

  // RECURSIVE VALIDATION
  return parseQRSegments(segments);
};

// Examples
validateNestedQRCode("SWIMMING-POOL1-ABC123");
// { valid: true, identifier: "ABC123" }

validateNestedQRCode("GYM-POOL1-ABC123");
// { valid: false, error: "Must start with SWIMMING" }
```

**Why Recursion Works:**
- Each segment is same type of problem: validation
- Problem gets smaller: fewer segments to check
- Clear base case: last segment
- Natural structure: each level depends on previous

---

### Implementation 3: Recursive Validation Chain

**Conceptual Pattern**: Progressive validation narrowing

```javascript
// ✅ Recursive validation pattern
const validateChain = (validations, data, index = 0) => {
  // BASE CASE: All validations passed
  if (index >= validations.length) {
    return { valid: true, data };
  }

  // Current validation step
  const currentValidation = validations[index];
  const result = currentValidation(data);

  // If current step fails, stop
  if (!result.valid) {
    return { valid: false, error: result.error, step: index };
  }

  // RECURSIVE CASE: Move to next validation
  // Problem gets smaller: fewer validations left
  return validateChain(validations, result.data, index + 1);
};

// Define validation steps
const qrScanValidations = [
  // Step 1: QR Code exists
  (data) => {
    if (!data.qrCode || !data.qrCode.is_active) {
      return { valid: false, error: 'Invalid QR code' };
    }
    return { valid: true, data };
  },
  
  // Step 2: Time slots available
  (data) => {
    if (!data.timeSlots || data.timeSlots.length === 0) {
      return { valid: false, error: 'No time slots' };
    }
    return { valid: true, data };
  },
  
  // Step 3: User eligible
  (data) => {
    if (!data.user.gender || !data.timeSlot.gender_restriction) {
      return { valid: false, error: 'Missing eligibility data' };
    }
    return { valid: true, data };
  },
  
  // Step 4: Capacity available
  (data) => {
    if (data.currentCount >= data.timeSlot.max_capacity) {
      return { valid: false, error: 'Capacity full' };
    }
    return { valid: true, data };
  }
];

// Usage
const result = validateChain(qrScanValidations, {
  qrCode: { is_active: true },
  timeSlots: [...],
  user: { gender: 'male' },
  timeSlot: { gender_restriction: 'male', max_capacity: 30 },
  currentCount: 25
});
```

**Why This is Recursive Thinking:**
- Each step narrows the problem space
- Clear base case: all validations done
- Each call handles one validation, delegates rest
- Early termination: stops on first failure

---

### Common Mistakes in Recursive Implementations

#### Mistake 1: No Base Case

```javascript
// ❌ BAD: Infinite recursion - no base case
const countSlots = (slots) => {
  if (slots.subSlots) {
    return countSlots(slots.subSlots); // Never stops!
  }
};

// ✅ GOOD: Has base case
const countSlots = (slots) => {
  // BASE CASE: No more sub-slots
  if (!slots.subSlots || slots.subSlots.length === 0) {
    return 1;
  }
  
  // RECURSIVE CASE
  return 1 + slots.subSlots.reduce((sum, sub) => sum + countSlots(sub), 0);
};
```

#### Mistake 2: No Progress Toward Base Case

```javascript
// ❌ BAD: Never gets closer to base case
const findSlot = (slots, index) => {
  if (index >= slots.length) return null;
  
  if (slots[index].available) {
    return slots[index];
  }
  
  // WRONG: index never changes, infinite loop!
  return findSlot(slots, index);
};

// ✅ GOOD: Makes progress (index increases)
const findSlot = (slots, index) => {
  if (index >= slots.length) return null;
  
  if (slots[index].available) {
    return slots[index];
  }
  
  // Progress: index + 1 gets us closer to base case
  return findSlot(slots, index + 1);
};
```

#### Mistake 3: Modifying Input in Recursive Call

```javascript
// ❌ BAD: Mutating shared data structure
const processSlots = (slots) => {
  if (slots.length === 0) return;
  
  const first = slots.shift(); // MUTATION! Affects original array
  processFirst(first);
  
  return processSlots(slots);
};

// ✅ GOOD: Pass slice without mutating
const processSlots = (slots, index = 0) => {
  if (index >= slots.length) return;
  
  processFirst(slots[index]); // No mutation
  
  return processSlots(slots, index + 1);
};
```

---

### Recursive Data Types

#### Definition
A **recursive data type** is defined in terms of itself.

#### Example: File System Structure

```javascript
// Recursive type: Directory contains directories
const facilityStructure = {
  name: 'Sports Complex',
  type: 'directory',
  children: [
    {
      name: 'Swimming Pool',
      type: 'directory',
      children: [
        {
          name: 'Time Slots',
          type: 'directory',
          children: [
            { name: 'Morning 6-8', type: 'file' },
            { name: 'Morning 8-10', type: 'file' }
          ]
        },
        {
          name: 'Attendance Records',
          type: 'directory',
          children: [...]
        }
      ]
    },
    {
      name: 'Gym',
      type: 'directory',
      children: [...]
    }
  ]
};

// Recursive function for recursive data type
const countFiles = (node) => {
  // BASE CASE: File has no children
  if (node.type === 'file') {
    return 1;
  }
  
  // RECURSIVE CASE: Directory has children
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
};

console.log(countFiles(facilityStructure)); // Total number of files
```

---

### Regular Expressions and Grammars

#### Regular Expressions in Sportivex

**File**: `backend/src/utils/swimmingValidation.js`

```javascript
// Time format validation using regex
export const validateTimeSlot = (data) => {
  const errors = [];
  
  // Regular expression defines a pattern (grammar for time format)
  // Pattern: HH:MM or HH:MM:SS
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format. Use HH:MM or HH:MM:SS');
  }
  
  return errors.length === 0;
};

// Grammar explanation:
// ^                    - Start of string
// ([0-1]?[0-9]|2[0-3]) - Hour: 0-23
// :                    - Literal colon
// [0-5][0-9]           - Minute: 00-59
// (:[0-5][0-9])?       - Optional seconds: 00-59
// $                    - End of string
```

#### QR Code Pattern Matching

```javascript
// QR code format validation
const qrCodeRegex = /^SWIMMING-\d{13}-[A-Z0-9]{8}$/;

/**
 * Grammar:
 * - SWIMMING        : Literal prefix
 * - \d{13}          : Exactly 13 digits (timestamp)
 * - [A-Z0-9]{8}     : 8 alphanumeric characters (random ID)
 */

const isValidQRFormat = (qrCode) => {
  return qrCodeRegex.test(qrCode);
};

// Valid: "SWIMMING-1702896543210-ABC12345"
// Invalid: "GYM-1702896543210-ABC12345"
```

---

## Code Review

### What is Code Review?

**Code review** is the systematic examination of code to identify issues in:
1. **Maintainability**: How easy is it to modify and extend?
2. **Readability**: How clear is the code?
3. **Coupling**: How dependent are modules on each other?
4. **Cohesion**: Do functions have a single, clear purpose?

---

### Issue 1: Tight Coupling Through Direct Imports

**File**: `backend/src/services/gymService.js`

#### The Problem

```javascript
// ❌ BAD: Direct import creates tight coupling
import { supabaseAdmin } from '../config/supabase.js';

export const saveWorkout = async (userId, workoutData) => {
  // Hardcoded dependency on supabaseAdmin
  const { data, error } = await supabaseAdmin
    .from('gym_workouts')
    .insert(workoutData);
  
  return data;
};

// PROBLEMS:
// 1. Can't test without real database
// 2. Can't swap database implementations
// 3. Can't use different DB for different environments
// 4. Hard to mock for unit tests
```

#### The Solution: Dependency Injection

```javascript
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

#### Benefits of Dependency Injection

1. **Testability**: Easy to pass mock objects
2. **Flexibility**: Swap implementations without changing code
3. **Isolation**: Test business logic without database
4. **Configuration**: Use different DBs per environment

```javascript
// Example: Different databases for different environments
const getDatabase = () => {
  if (process.env.NODE_ENV === 'test') {
    return testDatabase;
  }
  if (process.env.NODE_ENV === 'production') {
    return productionDatabase;
  }
  return developmentDatabase;
};

// All services use injected database
const db = getDatabase();
saveWorkout(userId, data, db);
```

---

### Issue 2: Magic Numbers

**File**: `backend/src/services/gymService.js`

#### The Problem

```javascript
// ❌ BAD: Magic numbers with no context
export const calculateCalories = (metValue, userWeight, duration) => {
  // What does 60 mean? Why divide by it?
  const calories = (metValue * userWeight * duration) / 60;
  return calories;
};

// File: timeSlotDetermination.js
export const determineTimeSlot = (timeSlots, currentDateTime) => {
  // Why 10? What does it represent?
  if (minutesUntilNext <= 10) {
    return nextSlot;
  }
};

// File: gymService.js
export const validateWorkout = (workout) => {
  // Why 3.5? What activity is this?
  const defaultMET = 3.5;
  
  // Why 5? Why 10?
  if (workout.duration < 5) return false;
  if (workout.sets > 10) return false;
};
```

#### The Solution: Named Constants

```javascript
// ✅ GOOD: Extract to named constants

// File: constants/gym.constants.js
export const GYM_CONSTANTS = {
  // Calorie calculation
  MINUTES_PER_HOUR: 60, // Convert hour-based MET to per-minute
  
  // MET values for different activities
  DEFAULT_EXERCISE_MET_VALUE: 3.5, // Light activity baseline
  WALKING_MET: 3.3,
  RUNNING_MET: 7.0,
  SWIMMING_MET: 8.0,
  
  // Workout validation
  MIN_WORKOUT_DURATION_MINUTES: 5, // Minimum for valid workout
  MAX_SETS_PER_EXERCISE: 10, // Prevent unrealistic data entry
  MIN_REPS_PER_SET: 1,
  MAX_REPS_PER_SET: 100
};

// File: constants/swimming.constants.js
export const SWIMMING_CONSTANTS = {
  // Check-in timing
  TIME_SLOT_BUFFER_MINUTES: 10, // Grace period before slot starts
  
  // Capacity
  MAX_CAPACITY_DEFAULT: 30, // Default max users per slot
  MIN_CAPACITY: 5, // Minimum viable slot size
  
  // Booking
  BOOKING_ADVANCE_DAYS: 7, // How far ahead users can book
  CANCELLATION_HOURS: 2 // Minimum hours before slot to cancel
};

// Now use them:
import { GYM_CONSTANTS } from '../constants/gym.constants.js';

export const calculateCalories = (metValue, userWeight, duration) => {
  const { MINUTES_PER_HOUR } = GYM_CONSTANTS;
  
  // Now it's clear: converting from hourly MET to per-minute calories
  const calories = (metValue * userWeight * duration) / MINUTES_PER_HOUR;
  return calories;
};

// File: timeSlotDetermination.js
import { SWIMMING_CONSTANTS } from '../constants/swimming.constants.js';

export const determineTimeSlot = (timeSlots, currentDateTime) => {
  const { TIME_SLOT_BUFFER_MINUTES } = SWIMMING_CONSTANTS;
  
  // Clear: 10-minute grace period for arriving early
  if (minutesUntilNext <= TIME_SLOT_BUFFER_MINUTES) {
    return nextSlot;
  }
};
```

#### Benefits of Named Constants

1. **Readability**: Code is self-documenting
2. **Maintainability**: Change value in one place
3. **Searchability**: Easy to find all uses of a constant
4. **Type Safety**: Can add validation/comments
5. **No Typos**: Use constant name, not retyping numbers

---

### Issue 3: Violation of Single Responsibility Principle

**File**: `backend/src/controllers/swimmingController.js`

#### The Problem: God Function

```javascript
// ❌ BAD: One function doing too many things
const getTimeSlots = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Responsibility 1: Get user data
    const { data: user } = await supabaseAdmin
      .from('users_metadata')
      .select('gender, role')
      .eq('id', userId)
      .single();
    
    // Responsibility 2: Fetch all slots
    const { data: allSlots } = await supabaseAdmin
      .from('swimming_time_slots')
      .select('*')
      .eq('is_active', true);
    
    // Responsibility 3: Filter by gender
    const genderFiltered = allSlots.filter(slot => {
      if (slot.gender_restriction === 'mixed') return true;
      if (slot.gender_restriction === 'male' && user.gender !== 'male') return false;
      if (slot.gender_restriction === 'female' && user.gender !== 'female') return false;
      return true;
    });
    
    // Responsibility 4: Filter by role
    const roleFiltered = genderFiltered.filter(slot => {
      if (slot.gender_restriction === 'faculty_pg') {
        return user.role === 'faculty' || user.role === 'postgraduate';
      }
      return true;
    });
    
    // Responsibility 5: Get attendance counts
    const enrichedSlots = [];
    for (const slot of roleFiltered) {
      const { count } = await supabaseAdmin
        .from('swimming_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('time_slot_id', slot.id)
        .eq('session_date', new Date().toISOString().split('T')[0]);
      
      // Responsibility 6: Calculate availability
      enrichedSlots.push({
        ...slot,
        currentCount: count,
        availableSpots: slot.max_capacity - count,
        isFull: count >= slot.max_capacity
      });
    }
    
    // Responsibility 7: Format response
    return res.status(200).json({
      success: true,
      message: 'Time slots retrieved successfully',
      slots: enrichedSlots,
      totalSlots: enrichedSlots.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve time slots'
    });
  }
};

// PROBLEMS:
// - 150+ lines in one function
// - 7 different responsibilities
// - Hard to test individual pieces
// - Hard to reuse logic
// - Hard to understand flow
// - Violates Single Responsibility Principle
```

#### The Solution: Extract Focused Functions

```javascript
// ✅ GOOD: Split into focused, reusable functions

// Function 1: Filter by gender restriction
const filterSlotsByGender = (slots, userGender) => {
  return slots.filter(slot => {
    const restriction = slot.gender_restriction;
    
    if (restriction === 'mixed') return true;
    if (restriction === 'male') return userGender === 'male';
    if (restriction === 'female') return userGender === 'female';
    
    return false;
  });
};

// Function 2: Filter by role restriction
const filterSlotsByRole = (slots, userRole) => {
  return slots.filter(slot => {
    if (slot.gender_restriction === 'faculty_pg') {
      return userRole === 'faculty' || userRole === 'postgraduate';
    }
    return true;
  });
};

// Function 3: Combined eligibility filter
const filterSlotsByUserEligibility = (slots, user) => {
  const genderFiltered = filterSlotsByGender(slots, user.gender);
  const roleFiltered = filterSlotsByRole(genderFiltered, user.role);
  return roleFiltered;
};

// Function 4: Get attendance count for a single slot
const getSlotAttendanceCount = async (slotId, date) => {
  const { count } = await supabaseAdmin
    .from('swimming_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('time_slot_id', slotId)
    .eq('session_date', date);
  
  return count || 0;
};

// Function 5: Enrich single slot with attendance data
const enrichSlotWithAttendance = async (slot, date) => {
  const currentCount = await getSlotAttendanceCount(slot.id, date);
  
  return {
    ...slot,
    currentCount,
    availableSpots: slot.max_capacity - currentCount,
    isFull: currentCount >= slot.max_capacity
  };
};

// Function 6: Enrich multiple slots with attendance
const enrichSlotsWithAttendance = async (slots, date) => {
  return Promise.all(
    slots.map(slot => enrichSlotWithAttendance(slot, date))
  );
};

// Function 7: Fetch active time slots from database
const fetchActiveTimeSlots = async () => {
  const { data, error } = await supabaseAdmin
    .from('swimming_time_slots')
    .select('*')
    .eq('is_active', true);
  
  if (error) throw new Error('Failed to fetch time slots');
  return data;
};

// Main controller: Clean, readable, focused
const getTimeSlots = async (req, res) => {
  try {
    const user = req.user; // Assume user data attached by auth middleware
    const today = new Date().toISOString().split('T')[0];
    
    // Step 1: Fetch all active slots
    const allSlots = await fetchActiveTimeSlots();
    
    // Step 2: Filter by user eligibility
    const eligibleSlots = filterSlotsByUserEligibility(allSlots, user);
    
    // Step 3: Enrich with real-time attendance data
    const enrichedSlots = await enrichSlotsWithAttendance(eligibleSlots, today);
    
    // Step 4: Return formatted response
    return res.status(200).json({
      success: true,
      message: 'Time slots retrieved successfully',
      slots: enrichedSlots,
      totalSlots: enrichedSlots.length
    });
    
  } catch (error) {
    console.error('Get time slots error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve time slots',
      error: error.message
    });
  }
};
```

#### Benefits of Single Responsibility

1. **Testability**: Test each function independently
2. **Reusability**: Use `filterSlotsByGender` in other places
3. **Readability**: Main function reads like documentation
4. **Maintainability**: Change filtering logic in one place
5. **Debugging**: Easier to pinpoint which step failed

```javascript
// Easy to test individual functions
describe('filterSlotsByGender', () => {
  it('should return mixed slots for all users', () => {
    const slots = [
      { id: 1, gender_restriction: 'mixed' },
      { id: 2, gender_restriction: 'male' }
    ];
    
    const result = filterSlotsByGender(slots, 'female');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});

// Easy to reuse in different contexts
const adminGetAllSlots = async (req, res) => {
  const slots = await fetchActiveTimeSlots();
  const enriched = await enrichSlotsWithAttendance(slots, new Date());
  return res.json(enriched);
};
```

---

## Static Checking and Testing

### What is Static Checking?

**Static checking** finds errors in code without running it. Examples:
- Type checkers (TypeScript)
- Linters (ESLint)
- Schema validators (Zod)
- Compilers

**Benefits**: Catches bugs early, before code runs in production.

---

### Implementation 1: Schema Validation as Static Checking

**File**: `frontend/src/validator/auth.validator.ts`

#### Zod Schema Validation

```typescript
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

#### How Zod Provides Static Checking Benefits

```typescript
// ❌ Without Zod: No type safety, no validation
const register = async (req, res) => {
  const { email, password } = req.body;
  
  // No guarantee email is actually an email
  // No guarantee password meets requirements
  // Bugs slip through to database or business logic
  
  await createUser(email, password); // Might fail!
};

// ✅ With Zod: Validation + Type Safety
const register = async (req, res) => {
  // Parse validates AND provides TypeScript types
  const validatedData = registerSchema.parse(req.body);
  
  // TypeScript knows validatedData structure
  // validatedData.email is guaranteed valid email format
  // validatedData.password is guaranteed to meet complexity rules
  
  await createUser(validatedData); // Safe!
};
```

#### Custom Validation Logic

```typescript
// Time slot validation schema
export const timeSlotSchema = z.object({
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  maxCapacity: z.number()
    .int('Capacity must be integer')
    .min(1, 'Capacity must be at least 1')
    .max(100, 'Capacity cannot exceed 100'),
  
  genderRestriction: z.enum(['male', 'female', 'mixed', 'faculty_pg'])
  
}).refine(
  // Custom validation: end time must be after start time
  (data) => {
    const start = timeToMinutes(data.startTime);
    const end = timeToMinutes(data.endTime);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'] // Error attached to endTime field
  }
);

// Helper function
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};
```

---

### Implementation 2: Partition Testing

**File**: `backend/src/utils/swimmingValidation.js`

#### Understanding Partitions

**Partition**: A group of inputs that should behave the same way.

**Goal**: Test one example from each partition to ensure complete coverage without redundant tests.

#### Time Slot Validation Partitions

```javascript
export const validateTimeSlot = (data) => {
  const errors = [];
  
  // PARTITION 1: Required Fields
  // Equivalence class: Missing required fields
  if (!data.startTime) errors.push('Start time is required');
  if (!data.endTime) errors.push('End time is required');
  if (!data.maxCapacity) errors.push('Max capacity is required');
  
  // PARTITION 2: Format Validation
  // Equivalence class: Invalid time formats
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format. Use HH:MM or HH:MM:SS');
  }
  
  if (data.endTime && !timeRegex.test(data.endTime)) {
    errors.push('Invalid end time format. Use HH:MM or HH:MM:SS');
  }
  
  // PARTITION 3: Range Validation
  // Equivalence class: Out of range values
  if (data.maxCapacity && (data.maxCapacity < 1 || data.maxCapacity > 100)) {
    errors.push('Max capacity must be between 1 and 100');
  }
  
  // PARTITION 4: Logical Constraints
  // Equivalence class: Logically invalid combinations
  if (data.startTime && data.endTime) {
    const startMinutes = toMinutes(data.startTime);
    const endMinutes = toMinutes(data.endTime);
    
    if (endMinutes <= startMinutes) {
      errors.push('End time must be greater than start time');
    }
  }
  
  // PARTITION 5: Enum Values
  // Equivalence class: Invalid enum values
  const validRestrictions = ['male', 'female', 'mixed', 'faculty_pg'];
  if (data.genderRestriction && !validRestrictions.includes(data.genderRestriction)) {
    errors.push('Invalid gender restriction');
  }
  
  return errors.length === 0;
};
```

#### Test Cases Based on Partitions

```javascript
describe('validateTimeSlot - Partition Testing', () => {
  // PARTITION 1: Required Fields
  describe('Required Fields Partition', () => {
    it('should reject when start time is missing', () => {
      const data = { endTime: '10:00', maxCapacity: 30 };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    // Only test ONE missing field - represents entire partition
    // Don't need separate tests for each missing field
  });
  
  // PARTITION 2: Format Validation
  describe('Format Validation Partition', () => {
    it('should reject invalid time format', () => {
      const data = {
        startTime: '25:99', // Invalid: hour > 23, minute > 59
        endTime: '10:00',
        maxCapacity: 30
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    it('should reject non-time strings', () => {
      const data = {
        startTime: 'abc', // Invalid: not a time at all
        endTime: '10:00',
        maxCapacity: 30
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    // Test boundary of format: 23:59 (valid), 24:00 (invalid)
  });
  
  // PARTITION 3: Range Validation
  describe('Range Validation Partition', () => {
    it('should reject capacity below minimum', () => {
      const data = {
        startTime: '08:00',
        endTime: '10:00',
        maxCapacity: 0 // Invalid: < 1
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    it('should reject capacity above maximum', () => {
      const data = {
        startTime: '08:00',
        endTime: '10:00',
        maxCapacity: 101 // Invalid: > 100
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    it('should accept capacity at boundaries', () => {
      const data1 = { startTime: '08:00', endTime: '10:00', maxCapacity: 1 };
      const data2 = { startTime: '08:00', endTime: '10:00', maxCapacity: 100 };
      
      expect(validateTimeSlot(data1)).toBe(true); // Min boundary
      expect(validateTimeSlot(data2)).toBe(true); // Max boundary
    });
  });
  
  // PARTITION 4: Logical Constraints
  describe('Logical Constraints Partition', () => {
    it('should reject when end time before start time', () => {
      const data = {
        startTime: '10:00',
        endTime: '08:00', // Logically invalid
        maxCapacity: 30
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
    
    it('should reject when end time equals start time', () => {
      const data = {
        startTime: '10:00',
        endTime: '10:00', // No duration
        maxCapacity: 30
      };
      expect(validateTimeSlot(data)).toBe(false);
    });
  });
  
  // PARTITION 5: Valid Data
  describe('Valid Data Partition', () => {
    it('should accept valid time slot', () => {
      const data = {
        startTime: '08:00',
        endTime: '10:00',
        maxCapacity: 30,
        genderRestriction: 'mixed'
      };
      expect(validateTimeSlot(data)).toBe(true);
    });
  });
});
```

#### Benefits of Partition Testing

1. **Systematic Coverage**: Test all types of failures
2. **No Redundancy**: Don't test same partition twice
3. **Efficient**: Fewer tests, better coverage
4. **Clear Intent**: Each test represents a class of inputs

---

### Implementation 3: Black-box vs White-box Testing

#### Black-box Testing: Test Based on Specification

**Focus**: What the function should do, not how it does it.

```javascript
// Specification for validateUserEligibility
/**
 * @function validateUserEligibility
 * @param {Object} user - User with { gender, role }
 * @param {Object} timeSlot - Time slot with { gender_restriction }
 * @returns {Object} { isValid: boolean, message: string }
 * 
 * Rules:
 * - 'mixed' slots: everyone eligible
 * - 'male' slots: only males eligible
 * - 'female' slots: only females eligible
 * - 'faculty_pg' slots: only faculty and postgraduate eligible
 */

// Black-box tests: Based only on specification
describe('validateUserEligibility - Black-box Tests', () => {
  // Test Rule 1: Mixed slots
  it('should allow any user for mixed slots', () => {
    const timeSlot = { gender_restriction: 'mixed' };
    
    const maleUser = { gender: 'male', role: 'undergraduate' };
    const femaleUser = { gender: 'female', role: 'faculty' };
    
    expect(validateUserEligibility(maleUser, timeSlot).isValid).toBe(true);
    expect(validateUserEligibility(femaleUser, timeSlot).isValid).toBe(true);
  });
  
  // Test Rule 2: Male slots
  it('should allow only males for male slots', () => {
    const timeSlot = { gender_restriction: 'male' };
    
    const maleUser = { gender: 'male', role: 'undergraduate' };
    const femaleUser = { gender: 'female', role: 'undergraduate' };
    
    expect(validateUserEligibility(maleUser, timeSlot).isValid).toBe(true);
    expect(validateUserEligibility(femaleUser, timeSlot).isValid).toBe(false);
  });
  
  // Test Rule 3: Female slots
  it('should allow only females for female slots', () => {
    const timeSlot = { gender_restriction: 'female' };
    
    const maleUser = { gender: 'male', role: 'undergraduate' };
    const femaleUser = { gender: 'female', role: 'undergraduate' };
    
    expect(validateUserEligibility(maleUser, timeSlot).isValid).toBe(false);
    expect(validateUserEligibility(femaleUser, timeSlot).isValid).toBe(true);
  });
  
  // Test Rule 4: Faculty/PG slots
  it('should allow only faculty and postgraduate for faculty_pg slots', () => {
    const timeSlot = { gender_restriction: 'faculty_pg' };
    
    const facultyUser = { gender: 'male', role: 'faculty' };
    const pgUser = { gender: 'female', role: 'postgraduate' };
    const ugUser = { gender: 'male', role: 'undergraduate' };
    
    expect(validateUserEligibility(facultyUser, timeSlot).isValid).toBe(true);
    expect(validateUserEligibility(pgUser, timeSlot).isValid).toBe(true);
    expect(validateUserEligibility(ugUser, timeSlot).isValid).toBe(false);
  });
});
```

#### White-box Testing: Test Based on Implementation

**Focus**: Test specific code paths, branches, loops.

```javascript
// Actual implementation
export const validateUserEligibility = (user, timeSlot) => {
  const genderRestriction = timeSlot.gender_restriction;
  
  // Branch 1: Mixed
  if (genderRestriction === SwimmingGenderRestriction.MIXED) {
    return { isValid: true, message: 'User is eligible' };
  }
  
  // Branch 2: Faculty/PG
  if (genderRestriction === SwimmingGenderRestriction.FACULTY_PG) {
    if (user.role === 'faculty' || user.role === 'postgraduate') {
      return { isValid: true, message: 'User is eligible' };
    }
    return { isValid: false, message: 'Restricted to faculty/PG only' };
  }
  
  // Branch 3: Gender match
  if (genderRestriction === user.gender) {
    return { isValid: true, message: 'User is eligible' };
  }
  
  // Branch 4: Default rejection
  return { isValid: false, message: 'User does not meet slot restrictions' };
};

// White-box tests: Cover every branch
describe('validateUserEligibility - White-box Tests', () => {
  // Cover Branch 1
  it('should return immediately for mixed slots (branch 1)', () => {
    const result = validateUserEligibility(
      { gender: 'male', role: 'undergraduate' },
      { gender_restriction: 'mixed' }
    );
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('User is eligible');
  });
  
  // Cover Branch 2 - True path
  it('should pass faculty users through faculty_pg check (branch 2 true)', () => {
    const result = validateUserEligibility(
      { gender: 'male', role: 'faculty' },
      { gender_restriction: 'faculty_pg' }
    );
    expect(result.isValid).toBe(true);
  });
  
  // Cover Branch 2 - False path
  it('should reject undergrad from faculty_pg slots (branch 2 false)', () => {
    const result = validateUserEligibility(
      { gender: 'male', role: 'undergraduate' },
      { gender_restriction: 'faculty_pg' }
    );
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Restricted to faculty/PG only');
  });
  
  // Cover Branch 3
  it('should match gender for gender-restricted slots (branch 3)', () => {
    const result = validateUserEligibility(
      { gender: 'male', role: 'undergraduate' },
      { gender_restriction: 'male' }
    );
    expect(result.isValid).toBe(true);
  });
  
  // Cover Branch 4
  it('should reject on gender mismatch (branch 4 default)', () => {
    const result = validateUserEligibility(
      { gender: 'female', role: 'undergraduate' },
      { gender_restriction: 'male' }
    );
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('User does not meet slot restrictions');
  });
});
```

#### Black-box vs White-box Comparison

| Aspect | Black-box | White-box |
|--------|-----------|-----------|
| **Based on** | Specification | Implementation |
| **Knows** | What function should do | How function works internally |
| **Tests** | All spec requirements | All code paths, branches |
| **Changes when** | Spec changes | Code changes |
| **Example** | "Mixed slots allow everyone" | "Cover first if statement" |

**Best Practice**: Use both!
- Black-box ensures meeting requirements
- White-box ensures full code coverage

---

### Implementation 4: Unit Testing

**File**: `backend/tests/swimmingService.test.js`

#### What is a Unit Test?

A **unit test** tests a single unit (function, class, module) in isolation.

**Key Principles**:
1. Test one thing at a time
2. Fast execution
3. Independent (no dependencies on other tests)
4. Repeatable (same result every time)

#### Example Unit Tests

```javascript
import { determineTimeSlot } from '../src/utils/timeSlotDetermination.js';
import { validateUserEligibility } from '../src/utils/swimmingValidation.js';

describe('determineTimeSlot - Unit Tests', () => {
  // Test 1: User arrives during active slot
  it('should assign current slot when time is within slot range', () => {
    const slots = [
      { id: 1, start_time: '08:00', end_time: '10:00' },
      { id: 2, start_time: '10:00', end_time: '12:00' }
    ];
    
    // Current time: 9:00 AM (within first slot)
    const currentTime = new Date('2024-01-01T09:00:00');
    
    const result = determineTimeSlot(slots, currentTime);
    
    expect(result.error).toBe(false);
    expect(result.slot.id).toBe(1);
  });
  
  // Test 2: User arrives 5 minutes before slot (within buffer)
  it('should assign next slot when within 10-minute buffer', () => {
    const slots = [
      { id: 1, start_time: '08:00', end_time: '10:00' },
      { id: 2, start_time: '10:00', end_time: '12:00' }
    ];
    
    // Current time: 9:55 AM (5 minutes before next slot)
    const currentTime = new Date('2024-01-01T09:55:00');
    
    const result = determineTimeSlot(slots, currentTime);
    
    expect(result.error).toBe(false);
    expect(result.slot.id).toBe(2); // Should get next slot
  });
  
  // Test 3: User arrives after all slots end
  it('should return error when all slots have ended', () => {
    const slots = [
      { id: 1, start_time: '08:00', end_time: '10:00' },
      { id: 2, start_time: '10:00', end_time: '12:00' }
    ];
    
    // Current time: 2:00 PM (after all slots)
    const currentTime = new Date('2024-01-01T14:00:00');
    
    const result = determineTimeSlot(slots, currentTime);
    
    expect(result.error).toBe(true);
    expect(result.message).toContain('ended');
  });
  
  // Test 4: Empty slots array
  it('should return error when no slots provided', () => {
    const result = determineTimeSlot([], new Date());
    
    expect(result.error).toBe(true);
  });
});

describe('validateUserEligibility - Unit Tests', () => {
  // Test 1: Mixed slot acceptance
  it('should accept any user for mixed slots', () => {
    const user = { gender: 'male', role: 'undergraduate' };
    const slot = { gender_restriction: 'mixed' };
    
    const result = validateUserEligibility(user, slot);
    
    expect(result.isValid).toBe(true);
  });
  
  // Test 2: Gender mismatch rejection
  it('should reject female user from male slot', () => {
    const user = { gender: 'female', role: 'undergraduate' };
    const slot = { gender_restriction: 'male' };
    
    const result = validateUserEligibility(user, slot);
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('restriction');
  });
  
  // Test 3: Role-based access
  it('should accept faculty for faculty_pg slots', () => {
    const user = { gender: 'female', role: 'faculty' };
    const slot = { gender_restriction: 'faculty_pg' };
    
    const result = validateUserEligibility(user, slot);
    
    expect(result.isValid).toBe(true);
  });
});
```

#### Test-First Programming (TDD)

**Process**:
1. Write test first (it will fail)
2. Write minimum code to make test pass
3. Refactor code
4. Repeat

```javascript
// STEP 1: Write failing test first
describe('calculateCalories', () => {
  it('should calculate calories using MET formula', () => {
    const result = calculateCalories({
      metValue: 8.0,
      weight: 70,
      duration: 30
    });
    
    // Expected: (8.0 * 70 * 30) / 60 = 280 calories
    expect(result).toBe(280);
  });
});

// STEP 2: Write minimum code to pass
export const calculateCalories = ({ metValue, weight, duration }) => {
  return (metValue * weight * duration) / 60;
};

// STEP 3: Add more tests, refactor
describe('calculateCalories', () => {
  it('should handle zero duration', () => {
    const result = calculateCalories({
      metValue: 8.0,
      weight: 70,
      duration: 0
    });
    expect(result).toBe(0);
  });
  
  it('should handle decimal results', () => {
    const result = calculateCalories({
      metValue: 3.5,
      weight: 65,
      duration: 45
    });
    expect(result).toBeCloseTo(170.625, 2);
  });
});
```

---

## Summary

### Key Takeaways

#### Specifications
- **Preconditions**: What must be true before calling function
- **Postconditions**: What will be true after function executes
- **Declarative**: Describe WHAT function does
- **Operational**: Describe HOW function works step-by-step

#### Mutability
- **Prefer immutability**: Create new objects instead of mutating
- **Use spread operator**: `{...obj}` and `[...array]`
- **Document mutations**: Clearly state when functions modify inputs
- **Defensive copying**: Copy before sorting or modifying

#### Recursion
- **Base case**: Simplest instance solved directly
- **Recursive case**: Break into smaller subproblems
- **Progress**: Each call must move toward base case
- **Natural for**: Trees, nested structures, self-similar problems

#### Code Review
- **Dependency injection**: Pass dependencies as parameters
- **Named constants**: Replace magic numbers
- **Single responsibility**: Each function does one thing
- **Loose coupling**: Minimize dependencies between modules

#### Testing
- **Static checking**: Catch errors before running (Zod, TypeScript)
- **Partition testing**: Test one example from each equivalence class
- **Black-box**: Test based on specification
- **White-box**: Test based on implementation
- **Unit tests**: Test functions in isolation
- **TDD**: Write tests first, then implement

---


