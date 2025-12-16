
## 1. Design and Modeling

### Case Study

A university introduces a Smart Sports Facility System (Sportivex) to manage student and faculty use of the gym and swimming pool. The goal is to automate check-ins, enforce rules, and improve resource management. For the swimming pool, users enter by scanning a QR code at the gate. The system automatically assigns the correct time slot using a 10-minute adjustment rule, checks gender restrictions, verifies whether the user's role (UG, PG, faculty, alumni) is allowed for that slot, and ensures the capacity limit has not been exceeded. If any rule fails, access is denied. For the gym, users can start a workout session in the app, add exercises (with sets, reps, and duration), and the system automatically calculates calories burned using MET values and the user's body weight. The system also manages swimming pool time-slot availability, showing each user only the slots they are allowed to attend based on gender and role. Unauthorized users cannot view or book restricted slots. This unified system improves fairness, prevents overcrowding, and ensures that gym and pool usage follows university regulations.

**Activity Diagram (Q#1)**  
Design a system for QR code-based attendance check-in at the swimming pool. The system should automatically determine the appropriate time slot based on the current time using a 10-minute rule, validate user eligibility based on gender restrictions, and enforce capacity limits.

**Sequence Diagram (Q#2)**  
Design a system for tracking gym workouts where users can start a workout session, add exercises with sets, reps, and duration, and automatically calculate calories burned based on MET (Metabolic Equivalent of Task) values and user weight.


**Activity Diagram (Q#3)**  
Design a system for managing swimming pool time slots that automatically filters available slots based on user gender and role (UG student, PG student, faculty, alumni). The system should enforce gender restrictions (male-only, female-only, faculty_pg, mixed) and prevent unauthorized access.

---

## 2. Specifications

### Case Study

Sportivex manage access to the swimming pool and gym. The goal is to automate attendance, enforce rules, and improve user experience. At the swimming pool, users check in by scanning a QR code at the entrance. The system automatically identifies the correct time slot using a 10-minute rule, verifies the user's gender and role (UG, PG, faculty, alumni), checks capacity limits, and prevents duplicate check-ins before recording attendance. For the gym, users can start a workout session, add exercises, and track their performance. Each exercise uses a MET value combined with the user's weight to automatically calculate calories burned and generate a complete workout summary. The system also manages swimming pool time-slot visibility, ensuring that each user only sees the slots that match their gender and role restrictions (male-only, female-only, mixed, faculty_pg). Unauthorized users are blocked from restricted slots. This integrated solution provides a secure, rule-compliant, and automated experience for all users of the university's sports facilities.

**QUESTION 1**  
Write specifications for the processQRScan function that handles QR code scanning for swimming pool attendance. Include preconditions, postconditions, and both declarative and operational specifications.

**ANSWER**

The processQRScan function validates scanned QR codes, identifies the correct time slot with a 10-minute threshold rule, verifies user eligibility based on gender/role restrictions, checks capacity limits, prevents duplicate attendance entries, and records the check-in. The function returns a structured success or failure response.

**Declarative Specification**

```
/**
  @function processQRScan
  @description Processes QR code scanning for swimming pool attendance check-in.
 
  @precondition
  - qrCodeValue is a non-empty string.
  - qrCodeValue matches the pattern: "SWIMMING-{timestamp}-{random}".
  - QR code exists in swimming_qr_codes table AND is_active = true.
  - user object contains: { id, gender, role }.
  - At least one active time slot exists for the current day.
 
  @postcondition
  - SUCCESS:
     - A new attendance record is added to swimming_attendance.
     - Record contains: time_slot_id, user_id, session_date, check_in_time, check_in_method='qr_scan'.
     - Time slot attendance count increases by 1.
  - FAILURE:
     - No attendance record is created.
     - Returns an error response describing the specific failure reason.
 
  @returns {Object} 
    {
      success: boolean,
      message: string,
      attendance?: Attendance,
      timeSlot?: TimeSlot,
      capacityExceeded?: boolean,
      alreadyCheckedIn?: boolean,
      error?: string
    }
 */
```

**Operational Specification**

```
/**
  @function processQRScan
  @description Operational steps for swimming attendance QR scan processing.
 
  OPERATIONAL STEPS:
 
  1. Validate QR Code:
     - Query swimming_qr_codes WHERE qr_code_value = qrCodeValue AND is_active = true.
     - If not found, return error "Invalid or inactive QR code".
 
  2. Retrieve Active Time Slots:
     - Query swimming_time_slots WHERE is_active = true AND matches today's weekday.
     - If none found, return error "No time slots available today".
 
  3. Determine Appropriate Time Slot:
     - Use determineTimeSlot() with a 10-minute rule:
          • If within 10 minutes of next slot → assign next slot.
          • If inside any slot → assign that slot.
          • If before first slot → assign first slot.
          • If after last slot → return error "All slots have ended".
 
  4. Validate User Eligibility:
     - validateUserEligibility(user, timeSlot):
          • Gender match OR restriction = 'mixed' OR role allows 'faculty_pg'.
     - If invalid → return "Access denied: gender/role restriction".
 
  5. Prevent Duplicate Check-In:
     - Query swimming_attendance for existing check-in (same user, date, and slot).
     - If found → return { alreadyCheckedIn: true, message: "Already checked in" }.
 
  6. Check Capacity:
     - Fetch current attendance count.
     - If count >= max_capacity → return { capacityExceeded: true, message: "Capacity full" }.
 
  7. Save Attendance:
     - Insert attendance record with check_in_method='qr_scan'.
     - Return success response with record and assigned time slot.
 */
```

---

**QUESTION 2**
Write specifications for the saveWorkout function that saves a workout with exercises and calculates total calories burned using MET values. Include preconditions, postconditions, and both declarative and operational specifications.

**ANSWER**

The saveWorkout function records a complete workout session with multiple exercises, automatically calculates calories burned for each exercise using MET values and user weight, computes the total workout calories and duration, and saves everything to the database. The function ensures data integrity and returns a complete workout summary.

**Declarative Specification**

```
/**
  @function saveWorkout
  @description Saves a workout session with exercises and calculates total calories burned.
 
  @precondition
  - user object contains: { id, weight }.
  - user.weight is a positive number (in kg).
  - exercises is a non-empty array.
  - Each exercise contains: { name, sets, reps, duration, met_value }.
  - met_value is a positive number representing metabolic equivalent.
  - sets, reps, and duration are non-negative integers.
  - duration is in minutes.
 
  @postcondition
  - SUCCESS:
     - A new workout record is created in gym_workouts table.
     - Record contains: user_id, session_date, total_duration, total_calories, status='completed'.
     - Each exercise is saved in workout_exercises table with calculated calories.
     - calories_burned = (met_value × weight × duration) / 60.
     - Returns workout summary with all exercises and totals.
  - FAILURE:
     - No workout or exercise records are created.
     - Returns an error response describing the failure reason.
 
  @returns {Object} 
    {
      success: boolean,
      message: string,
      workout?: {
        id: number,
        totalDuration: number,
        totalCalories: number,
        exercises: Array<Exercise>
      },
      error?: string
    }
 */
```

**Operational Specification**

```
/**
  @function saveWorkout
  @description Operational steps for saving workout with calorie calculation.
 
  OPERATIONAL STEPS:
 
  1. Validate Input Data:
     - Check user.weight exists and is positive.
     - Check exercises array is not empty.
     - For each exercise: validate met_value, sets, reps, duration are valid numbers.
     - If invalid → return error "Invalid workout data".
 
  2. Create Workout Session Record:
     - Insert new record into gym_workouts table.
     - Set user_id, session_date (current date), status='in_progress'.
     - If insert fails → return error "Failed to create workout session".
 
  3. Calculate and Save Each Exercise:
     - For each exercise in exercises array:
          • Calculate calories: (met_value × user.weight × duration) / 60.
          • Insert into workout_exercises table with workout_id, exercise details, calculated calories.
          • If any insert fails → rollback transaction, return error.
 
  4. Calculate Workout Totals:
     - Sum all exercise durations → total_duration.
     - Sum all calculated calories → total_calories.
 
  5. Update Workout Record:
     - Update gym_workouts with total_duration, total_calories.
     - Set status='completed'.
     - If update fails → return error "Failed to complete workout".
 
  6. Return Success Response:
     - Return workout summary with id, totals, and array of exercises with calories.
 */
```

**QUESTION 3**  
Write specifications for the getTimeSlots function that filters time slots based on user gender and role. Include preconditions, postconditions, and both declarative and operational specifications.

**ANSWER**

The getTimeSlots function retrieves all active swimming pool time slots and filters them based on the user's gender and role (UG, PG, faculty, alumni). It enforces access restrictions so users only see slots they're allowed to attend, enriches each slot with current attendance count and available spots, and returns a filtered list.

**Declarative Specification**

```
/**
  @function getTimeSlots
  @description Retrieves and filters time slots based on user eligibility.
 
  @precondition
  - user object contains: { id, gender, role }.
  - user.gender is either 'male' or 'female'.
  - user.role is one of: 'undergraduate', 'postgraduate', 'faculty', 'alumni'.
  - At least one time slot exists in the database.
 
  @postcondition
  - SUCCESS:
     - Returns array of time slots where user meets eligibility criteria.
     - Each slot includes: id, start_time, end_time, gender_restriction, max_capacity, current_count, available_spots.
     - Filtered based on gender_restriction rules:
          • 'mixed' → all users can see.
          • 'male' → only male users can see.
          • 'female' → only female users can see.
          • 'faculty_pg' → only faculty and postgraduate users can see.
     - Slots are enriched with real-time attendance data.
     - Available spots = max_capacity - current_count.
  - FAILURE:
     - Returns empty array if no slots match user's eligibility.
     - Returns error if database query fails.
 
  @returns {Object} 
    {
      success: boolean,
      message: string,
      slots?: Array<{
        id: number,
        start_time: string,
        end_time: string,
        gender_restriction: string,
        max_capacity: number,
        current_count: number,
        available_spots: number
      }>,
      error?: string
    }
 */
```

**Operational Specification**

```
/**
  @function getTimeSlots
  @description Operational steps for retrieving and filtering time slots.
 
  OPERATIONAL STEPS:
 
  1. Retrieve All Active Time Slots:
     - Query swimming_time_slots WHERE is_active = true.
     - Order by start_time ascending.
     - If query fails → return error "Failed to fetch time slots".
     - If no slots found → return empty array with success message.
 
  2. Filter Slots by Gender Restriction:
     - For each slot in retrieved slots:
          • If gender_restriction = 'mixed' → include slot.
          • If gender_restriction = 'faculty_pg':
               - Include only if user.role = 'faculty' OR user.role = 'postgraduate'.
          • If gender_restriction = 'male':
               - Include only if user.gender = 'male'.
          • If gender_restriction = 'female':
               - Include only if user.gender = 'female'.
          • Otherwise → exclude slot.
 
  3. Enrich Each Slot with Attendance Data:
     - For each eligible slot:
          • Query swimming_attendance for current date and slot.id.
          • Count total check-ins → current_count.
          • Calculate: available_spots = max_capacity - current_count.
          • Add current_count and available_spots to slot object.
 
  4. Return Filtered and Enriched Slots:
     - Return success response with array of eligible slots.
     - Each slot contains all original fields plus current_count and available_spots.
 */
```

---

## 3) Mutability (Risks of Mutation, Mutations and Contracts)

### Case Study: Safe Data Handling in Sportivex

Sportivex handles user profiles, time slots, and attendance data shared across the system. The `updateProfile` function creates a new `updateData` object instead of mutating the request body to prevent bugs where other functions see unexpected changes. When enriching time slots with attendance counts, `getTimeSlots` uses the spread operator to create new objects without changing originals. However, `determineTimeSlot` accidentally mutates the input array when sorting, which could break other functions expecting the original order.

**Q3.1 – Building Update Objects vs Direct Mutation:**  
Why does `updateProfile` create a new `updateData` object instead of directly mutating the request body, and how does this pattern prevent accidental side effects on shared references?

```js
// backend/src/controllers/authController.js
const updateProfile = async (req, res) => {
  const { name, phone, dateOfBirth, address, profilePictureUrl, bio } = req.body;
  
 
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone;
 
};
```

**Answer:** Creating a new `updateData` object ensures the original request body remains untouched, which prevents bugs where other parts of the code might rely on the original data structure. This pattern is safer because if multiple functions read from `req.body` simultaneously, they won't see unexpected changes made by one function.

**Q3.2 – Immutable Enrichment Pattern:**  
How does using the spread operator (`...slot`) in `getTimeSlots` to create enriched data objects ensure that the original `data` array and its slot objects remain unchanged, preventing mutation bugs?

```js
// backend/src/controllers/swimmingController.js
const enrichedData = await Promise.all(
  data.map(async (slot) => {
    const { count } = await getAttendanceCount(slot.id, today);
    return {
      ...slot,  // Creates new object, original slot unchanged
      currentCount: count,
      availableSpots: slot.max_capacity - count
    };
  })
);
```

**Answer:** The spread operator `...slot` copies all properties from the original slot object into a brand new object, leaving the original completely untouched. It's like making a photocopy instead of writing on the original document. When we add `currentCount` and `availableSpots`, we're adding them to the new copy, not the original. This prevents bugs where other parts of the code might still be using the original `data` array and would get confused if they suddenly saw extra properties they weren't expecting.

**Q3.3 – Mutation Risk in Array Sorting:**  
Why does using `timeSlots.sort()` directly in `determineTimeSlot` mutate the input array, and how could this cause unexpected behavior if the same `timeSlots` array is used elsewhere in the application?

```js
// backend/src/utils/timeSlotDetermination.js
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  // Sort time slots by start time - MUTATES the input array!
  const sortedSlots = timeSlots.sort((a, b) => {
    const timeA = parseTime(a.start_time);
    const timeB = parseTime(b.start_time);
    return timeA - timeB;
  });
  // ... rest of function
};
```

**Answer:** The `.sort()` method in JavaScript doesn't create a new array—it rearranges the original array in place. So even though we assign it to `sortedSlots`, both `sortedSlots` and `timeSlots` point to the same array that's now been reordered. This is dangerous because if another function somewhere else is using the same `timeSlots` array and expects it in the original order (maybe it was sorted by capacity or name), it will suddenly see a different order and might break. To fix this, we should create a copy first: `const sortedSlots = [...timeSlots].sort(...)` which sorts the copy instead of the original.

---

## 4) Recursion (Subproblems, Structure, Mistakes, Recursive Types, Regex, Grammars)

### Case Study: Breaking Down Complex Problems in Sportivex

Sportivex faces problems that break into smaller similar subproblems. If time slots needed nested structures (weekly schedules with daily sub-slots), recursion would handle each level the same way. QR codes like "SWIMMING-POOL1-LANE2-ABC123" could be parsed recursively by splitting each segment until reaching the final identifier. The `processQRScan` function uses sequential validation that narrows the problem at each step, making it progressively simpler.

**Q4.1 – Iterative vs Recursive Problem-Solving:**  
Why might a recursive approach be more natural than the current iterative loop in `determineTimeSlot` if we needed to handle nested time slot hierarchies (e.g., recurring weekly slots with sub-slots)?

```js
// backend/src/utils/timeSlotDetermination.js
export const determineTimeSlot = (timeSlots, currentDateTime = new Date()) => {
  // Current iterative approach with loops
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
   
  }
  // How would recursion handle nested slot structures?
};
```

**Answer:** Recursion would be more natural for nested time slots because it can process each level the same way. Imagine we have weekly slots that contain daily slots, which contain hourly sub-slots. With recursion, we could write one function that checks if the current time matches this level, and if not, calls itself on the next level down (the sub-slots). It's like drilling down through folders—you use the same "open folder" action at each level. With loops, we'd need separate loops for each level or complicated nested loops that get messy fast. Recursion keeps the logic simple: "check this slot, if it has sub-slots, check those the same way."

**Q4.2 – Recursive Validation Chain:**  
How could `processQRScan` benefit from a recursive validation approach if QR codes need to support nested prefixes (e.g., "SWIMMING-POOL1-LANE2-ABC123"), and what would the base case be?

```js
// backend/src/services/swimmingService.js
export const processQRScan = async (qrCodeValue, user) => {
  // 1. Validate QR code exists and is active
  // 2. Get currently active time slots
  // 3. Determine appropriate time slot
  // 4. Validate user eligibility
  // How would recursion help parse nested QR structures?
};
```

**Answer:** Recursion naturally handles nested structures by parsing one level at a time—first "SWIMMING", then "POOL1", then "LANE2"—where each level becomes a simpler subproblem. The base case would be when we reach the final identifier (like "ABC123") with no more nested segments to parse, which stops the recursive calls.

**Q4.3 – Recursive Error Propagation:**  
How does the nested error checking in `processQRScan` (multiple sequential validations) represent a form of recursive problem-solving, where each validation step narrows the problem space?

```js
// backend/src/services/swimmingService.js
export const processQRScan = async (qrCodeValue, user) => {
  // Step 1: Validate QR code
  if (qrError || !qrCode) return { success: false, message: 'Invalid QR code' };
  
  // Step 2: Get time slots
  if (!slotsSuccess || timeSlots.length === 0) return { success: false, message: 'No slots' };
  
  // Step 3: Determine slot
  if (slotDetermination.error) return { success: false, message: slotDetermination.message };
  
  // Each step depends on previous - recursive validation chain
};
```

---

## 5) Debugging (Avoiding Debugging, Assertions, Localizing, Reproducing, Fixing)

### Case Study: Finding and Preventing Bugs in Sportivex

Sportivex uses `console.error` statements in controllers like `updateProfile` to log errors for debugging. Validation functions like `validateTimeSlot` prevent bugs by catching invalid inputs at the boundary with clear messages. The QR check-in process in `processQRScan` returns specific error messages at each step, telling us exactly which step failed. This makes bugs easier to reproduce and fix compared to generic error messages.

**Q5.1 – Console.error as Debugging Tool:**  
How do the `console.error` statements in `updateProfile` help localize bugs, and what additional information would make them more effective for systematic debugging in production?

```js
// backend/src/controllers/authController.js
const updateProfile = async (req, res) => {
  try {
    // ... update logic
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
  } catch (error) {
    console.error('Update profile error:', error);
    // What additional context would help debug this?
  }
};
```

**Answer:** The `console.error` statements help us pinpoint where things went wrong by printing error messages at specific failure points. If we see "Update error" in the logs, we know the database update failed, not something else. To make this more useful in production, we should add: (1) the userId so we know which user had the problem, (2) what data we tried to update (`updateData`), (3) a timestamp, and (4) maybe a unique error ID to track the same error across multiple logs. This way, when a user reports a bug, we can search the logs for their userId and see exactly what happened.

**Q5.2 – Validation as Bug Prevention:**  
How does the validation in `validateTimeSlot` prevent debugging by catching errors at the input boundary, making bugs easier to reproduce and understand compared to errors discovered later in execution?

```js
// backend/src/utils/swimmingValidation.js
export const validateTimeSlot = (data) => {
  const errors = [];
  
  if (!data.startTime) errors.push('Start time is required');
  if (!data.endTime) errors.push('End time is required');
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format. Use HH:MM or HH:MM:SS');
  }
  
  // How does catching errors here prevent debugging later?
};
```

**Answer:** By checking inputs right at the entrance, we catch bad data before it goes deeper into the system where it would cause confusing errors. Imagine if we didn't check the time format here—the invalid time would travel through multiple functions, maybe get stored in the database, and eventually crash when we try to compare times. At that point, we'd see an error like "Cannot compare undefined" which doesn't tell us the real problem was a badly formatted time from user input. By validating early, we get clear messages like "Invalid start time format" right away, and we know exactly what needs to be fixed and where the bad data came from.

**Q5.3 – Error Context in Complex Operations:**  
How does the step-by-step error checking in `processQRScan` help reproduce bugs by providing specific failure points (QR validation, slot determination, eligibility check) rather than a single generic error?

```js
// backend/src/services/swimmingService.js
export const processQRScan = async (qrCodeValue, user) => {
  // 1. Validate QR code exists and is active
  if (qrError || !qrCode) return { success: false, message: 'Invalid or inactive QR code' };
  
  // 2. Get currently active time slots
  if (!slotsSuccess || timeSlots.length === 0) return { success: false, message: 'No time slots available' };
  
  // 3. Determine appropriate time slot
  if (slotDetermination.error) return { success: false, message: slotDetermination.message };
  
  // Each return provides specific context about failure location
};
```

**Answer:** Each error message tells us exactly which step failed, making it easy to recreate the bug by checking that specific condition. For example, if we see "No time slots available", we know the problem is in step 2, so we can test with an empty time slots array rather than guessing whether it's a QR code issue or something else.

---

## 6. Code Review

### Case Study

During a code quality review of the Sportivex, the team identified several maintainability issues. Key modules such as gymService.js and timeSlotDetermination.js contained multiple magic numbers, making the logic difficult to understand and risky to update. The audit also found tight coupling caused by direct imports of database clients, limiting testability and preventing clean dependency injection. Additionally, the getTimeSlots function in swimmingController.js had become overly complex, handling access rules, filtering, enrichment, and response formatting all in one place. This violated the Single Responsibility Principle and made future modifications difficult. These findings prompted the team to explore refactoring strategies to improve clarity, reduce coupling, and enhance long-term maintainability.

---

**Q#1 – Global Variable and Dependency Management**

Analyze the codebase for patterns that create tight coupling through direct module imports of external dependencies (particularly database clients). These patterns inhibit testability and create maintenance challenges. Propose refactoring strategies that promote loose coupling through dependency injection.

**ANSWER**

The main problem is when files directly import database clients like `import { supabaseAdmin } from '../config/supabase.js'` at the top. This creates tight coupling because the code is "hardwired" to use that specific database connection. You can't easily swap it out for a test database or mock version when writing unit tests.

**Refactoring Strategy:**

1. **Use Dependency Injection** - Instead of importing the database client directly, pass it as a function parameter:

```js
// BEFORE (tight coupling)
import { supabaseAdmin } from '../config/supabase.js';
export const saveWorkout = async (userId, workoutData) => {
  const result = await supabaseAdmin.from('workouts').insert(workoutData);
}

// AFTER (loose coupling)
export const saveWorkout = async (userId, workoutData, db = supabaseAdmin) => {
  const result = await db.from('workouts').insert(workoutData);
}
```

2. **Create a Service Layer** - Wrap database operations in a service class that can be injected:

```js
// database.service.js
export class DatabaseService {
  constructor(client) {
    this.client = client;
  }
  
  async insertWorkout(data) {
    return this.client.from('workouts').insert(data);
  }
}

// In tests, inject a mock
const mockDb = new DatabaseService(mockClient);
```

**Benefits:**
- **Testability**: You can easily pass in mock databases for testing without touching real data
- **Flexibility**: Switching databases or adding caching becomes simple—just swap the injected dependency
- **Clarity**: Functions explicitly show what external resources they need
- **Reusability**: The same function can work with different database connections

---

**Q#2 – Magic Number Identification and Refactoring**

Examine the codebase files and identify instances where numeric literals are used without clear semantic context (magic numbers). These values should be extracted into named constants to improve code maintainability, readability, and reduce potential errors during future modifications.

**ANSWER**

**Files to Review:**
- `gymService.js` - Contains calorie calculation formulas with unexplained numbers
- `timeSlotDetermination.js` - Has time-related numeric values (like the 10-minute rule)

**Magic Numbers Found:**

1. **gymService.js** - Calorie calculation:
```js
// Line 45: What does 60 mean here?
const calories = (metValue * userWeight * duration) / 60;
```
Should be: `const MINUTES_PER_HOUR = 60;`

2. **timeSlotDetermination.js** - Time buffer:
```js
// Line 23: Why 10 minutes?
if (minutesUntilNext <= 10) {
  return nextSlot;
}
```
Should be: `const TIME_SLOT_BUFFER_MINUTES = 10;`

3. **gymService.js** - MET value defaults:
```js
// Line 78: Magic MET values
const defaultMET = 3.5; // What activity is this for?
```
Should be: `const DEFAULT_EXERCISE_MET_VALUE = 3.5; // Light activity`

**Suggested Constants File Structure:**

```js
// constants/gym.constants.js
export const GYM_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  DEFAULT_EXERCISE_MET_VALUE: 3.5,  // Light activity baseline
  MIN_WORKOUT_DURATION: 5,  // minimum minutes
  MAX_SETS_PER_EXERCISE: 10
};

// constants/swimming.constants.js
export const SWIMMING_CONSTANTS = {
  TIME_SLOT_BUFFER_MINUTES: 10,  // Grace period for check-in
  MAX_CAPACITY_DEFAULT: 30,
  BOOKING_ADVANCE_DAYS: 7
};
```

**Benefits:**
- **Readability**: `TIME_SLOT_BUFFER_MINUTES` is clearer than just seeing `10` in the code
- **Maintainability**: Change the buffer time in one place, not hunting through files
- **Documentation**: Constant names explain what the number means
- **Fewer Errors**: No accidentally using wrong numbers or typos

---

**Q#3 – Code Refactoring for Maintainability**

The getTimeSlots function in swimmingController.js (lines 19-168) contains complex nested conditional logic for access control and data enrichment. This violates the Single Responsibility Principle and makes the code difficult to test and maintain. Propose a refactoring strategy to improve the function's structure.

**ANSWER**

The problem is that `getTimeSlots` is doing too many things at once: checking user permissions, filtering slots, fetching attendance data, calculating available spots, and formatting the response. This makes it hard to test, understand, and modify.

**Refactoring Strategy - Split into Focused Functions:**

```js
// BEFORE: One massive function doing everything
const getTimeSlots = async (req, res) => {
  // 150 lines of mixed logic
  // - Get user data
  // - Fetch all slots
  // - Check gender restrictions
  // - Check role restrictions
  // - Get attendance counts
  // - Calculate availability
  // - Format response
};

// AFTER: Multiple focused functions

// 1. Extract access control logic
const filterSlotsByUserEligibility = (slots, user) => {
  return slots.filter(slot => {
    if (slot.gender_restriction === 'mixed') return true;
    if (slot.gender_restriction === 'faculty_pg') {
      return user.role === 'faculty' || user.role === 'postgraduate';
    }
    return slot.gender_restriction === user.gender;
  });
};

// 2. Extract data enrichment logic
const enrichSlotsWithAttendance = async (slots, date) => {
  return Promise.all(slots.map(async (slot) => {
    const count = await getAttendanceCount(slot.id, date);
    return {
      ...slot,
      currentCount: count,
      availableSpots: slot.max_capacity - count
    };
  }));
};

// 3. Main controller becomes clean and readable
const getTimeSlots = async (req, res) => {
  try {
    const user = req.user;
    const allSlots = await fetchActiveTimeSlots();
    
    const eligibleSlots = filterSlotsByUserEligibility(allSlots, user);
    const enrichedSlots = await enrichSlotsWithAttendance(eligibleSlots, new Date());
    
    return res.json({ success: true, slots: enrichedSlots });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
```

**Benefits:**
- **Single Responsibility**: Each function does one thing well
- **Testability**: You can test filtering logic separately from database queries
- **Readability**: The main function reads like plain English—fetch, filter, enrich, return
- **Reusability**: `filterSlotsByUserEligibility` can be used in other parts of the app
- **Maintainability**: Changing the filtering rules doesn't require touching attendance logic

---

## 7. Static Checking and Testing (Validation, TDD, Black/White-box, Partitions, Unit Tests)

### Case Study: Ensuring Quality in Sportivex

Sportivex uses Zod schema validation (like `registerSchema`) to validate inputs before they reach the server, similar to static type checking. The `validateTimeSlot` function naturally partitions inputs into equivalence classes, making test selection systematic. For functions like `validateUserEligibility`, black-box testing focuses on the specification rather than implementation. Tests verify expected behaviors like mixed slots allowing everyone or faculty slots restricting access.

**Q7.1 – Schema-Based Validation as Static Checking:**  
How does the Zod schema validation in `registerSchema` provide compile-time type checking benefits similar to static typing, even in a JavaScript runtime environment?

```typescript
// frontend/src/validator/auth.validator.ts
export const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(100).regex(/^[A-Za-z\s]+$/),
  email: z.string().trim().email(),
  password: z.string().min(8).max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/),
  // ... more fields with type constraints
});
```

**Answer:** Zod schema validation acts like a type checker that runs when your code executes, not when you compile it. It's similar to static typing because it explicitly defines what shape your data must have—like TypeScript types, but checked at runtime. Before any data reaches your server logic, Zod validates that the email is actually an email, the password meets all the requirements, and the name only has letters. If validation fails, you get clear error messages pointing to exactly what's wrong, just like a compiler would tell you about type errors. This catches bugs early, prevents bad data from entering your system, and makes your code more reliable—all benefits of static type checking, even though JavaScript is dynamically typed.

**Q7.2 – Partition Testing in Validation:**  
How does `validateTimeSlot` naturally partition the input space into equivalence classes (valid times, invalid formats, missing fields) that make test case selection systematic rather than ad-hoc?

```js
// backend/src/utils/swimmingValidation.js
export const validateTimeSlot = (data) => {
  const errors = [];
  
  // Partition 1: Required fields
  if (!data.startTime) errors.push('Start time is required');
  
  // Partition 2: Format validation
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (data.startTime && !timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format');
  }
  
  // Partition 3: Logical constraints
  if (toMinutes(data.endTime) <= toMinutes(data.startTime)) {
    errors.push('End time must be greater than start time');
  }
  // Each partition represents a class of test cases
};
```

**Answer:** The function naturally divides inputs into groups (partitions) where all inputs in the same group behave the same way. For example, all missing start times fail the same way (Partition 1), all badly formatted times like "25:99" or "abc" fail similarly (Partition 2), and all logically wrong times where end comes before start fail together (Partition 3). Instead of randomly picking test cases, we can systematically test one example from each partition—like testing one missing field, one bad format, one time logic error, and one valid time. This ensures we cover all the different types of failures without wasting time on redundant tests that check the same thing multiple times.

**Q7.3 – Black-box Testing Specification:**  
How would you design a black-box test for `validateUserEligibility` based only on its specification (input user + timeSlot, output eligibility result) without knowing its internal implementation?

```js
// backend/src/utils/swimmingValidation.js
export const validateUserEligibility = (user, timeSlot) => {
  const genderRestriction = timeSlot.gender_restriction;
  
  // Mixed slots allow everyone
  if (genderRestriction === SwimmingGenderRestriction.MIXED) {
    return { isValid: true, message: 'User is eligible' };
  }
  
  // Faculty/PG slots
  if (genderRestriction === SwimmingGenderRestriction.FACULTY_PG) {
    if (user.role === 'faculty' || user.role === 'postgraduate') {
      return { isValid: true, message: 'User is eligible' };
    }
    return { isValid: false, message: 'Restricted to faculty/PG only' };
  }
  
  // How would you test this without seeing the implementation?
};
```

**Answer:** I would create test cases based on the function's expected behavior: test that any user passes with a "mixed" time slot, test that only faculty/PG users pass with "faculty_pg" slots, and test that gender matching works for gender-restricted slots. Since I don't know the implementation, I'd test different input combinations to verify the function produces the correct outputs according to its specification.

---

# Software Engineering Concepts – Conceptual Questions (Sportivex Routes DSL)

Below are short conceptual questions (1–2 lines) based on MIT course concepts, each followed by a code snippet from the actual Sportivex Routes DSL project that automatically generates Express router code.

---

## 6) Parsing (Parser Generators, An ANTLR Grammar, Generating the Parser, Traversing the Parse Tree, Constructing an Abstract Syntax Tree, Handling Errors)

### Case Study: Building a Routes DSL for Sportivex

Sportivex had dozens of repetitive Express route definitions scattered across multiple files. Instead of writing the same `router.get()` and `router.post()` patterns over and over, the team created a simple DSL (Domain-Specific Language) that lets them write routes like `/users: GET, POST` in a clean format. ANTLR reads the grammar file (Routes.g4) and automatically generates a lexer and parser that can understand this DSL. The parser breaks down the DSL text into a tree structure, where each branch represents a route definition with its role, path, and actions. A visitor then walks through this tree and generates the actual Express JavaScript code, turning simple DSL statements into complete router configurations with middleware and controllers.

**Q6.1 – Grammar Rules and Language Structure:**  
How does the `routeDef` grammar rule in Routes.g4 define the structure of a valid route block, and why does using `suburlDef+` (one or more) instead of `suburlDef*` (zero or more) prevent empty route blocks from being valid?

```antlr
// Routes.g4 - ANTLR Grammar
grammar Routes;

program
  : routeDef+ EOF
  ;

routeDef
  : 'route' ROLE '{' suburlDef+ '}'
  ;

suburlDef
  : SUBURL ':' actionList
  ;

actionList
  : ACTION (',' ACTION)*
  ;

ROLE
  : 'Client' | 'Admin'
  ;

ACTION
  : 'GET' | 'POST' | 'UPDATE' | 'DELETE'
  ;
```

**Answer:** The `routeDef` rule says a route must have the keyword "route", followed by a ROLE (like Admin or Client), then curly braces containing at least one `suburlDef`. Using `suburlDef+` means "one or more" suburl definitions are required, so you can't have an empty route block like `route Admin {}`. If we used `suburlDef*` (zero or more), empty blocks would be valid, which doesn't make sense because a route definition without any actual routes is useless.

**Q6.2 – Parse Tree Traversal with Visitor Pattern:**  
How does the `visitRouteDef` method in ExpressCodeGenerator traverse the parse tree, and why does it need to call `visitChildren(ctx)` to process all the suburlDef nodes inside a route block?

```js
// ExpressCodeGenerator.js - Visitor that walks the parse tree
export default class ExpressCodeGenerator extends RoutesVisitor {
  constructor() {
    super();
    this.generatedCode = [];
    this.currentRole = null;
  }

  visitRouteDef(ctx) {
    // Get the role (Admin or Client)
    this.currentRole = ctx.ROLE().getText();
    
    // Add a comment for this role section
    this.generatedCode.push(`\n// ${this.currentRole} Routes`);
    
    // Visit all suburlDef children
    return this.visitChildren(ctx);
  }

  visitSuburlDef(ctx) {
    const suburl = ctx.SUBURL().getText();
    const actionList = ctx.actionList();
    
    // Get all ACTION tokens from the actionList
    const actions = actionList.ACTION().map(a => a.getText());
    
    // Generate a router statement for each action
    actions.forEach(action => {
      const code = this.generateRouterStatement(suburl, action, this.currentRole);
      this.generatedCode.push(code);
    });
  }
}
```

**Answer:** The `visitRouteDef` method first extracts the role name (like "Admin") from the parse tree node and saves it in `this.currentRole`. Then it calls `visitChildren(ctx)` which automatically visits all the child nodes underneath this route definition—specifically all the `suburlDef` nodes that contain the actual paths and actions. Without calling `visitChildren`, the visitor would only process the role name but skip all the route paths inside the block, so we'd lose all the actual route information.

**Q6.3 – From Parse Tree to Generated Code:**  
How does the `generateExpressRoutes` function orchestrate the entire parsing pipeline from reading the DSL file to generating JavaScript code, and what role does each component (Lexer, Parser, Visitor) play in this transformation?

```js
// generateRoutes.js - Main script that runs the parser
function generateExpressRoutes(inputFile, outputFile = null) {
  try {
    // Read the DSL input file
    const input = fs.readFileSync(inputFile, 'utf8');
    console.log(`📖 Reading DSL file: ${inputFile}\n`);

    // Create ANTLR lexer and parser
    const chars = new antlr4.InputStream(input);
    const lexer = new RoutesLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new RoutesParser(tokens);

    // Build the parse tree
    parser.buildParseTrees = true;
    const tree = parser.program();

    console.log('🌳 Parse tree generated successfully\n');

    // Create the code generator visitor
    const generator = new ExpressCodeGenerator();

    // Walk the parse tree to generate code
    generator.visit(tree);

    // Get the complete generated code with imports
    const generatedCode = generator.getCompleteCode();

    // Output the generated code
    console.log('✨ Generated Express Router Code:\n');
    console.log(generatedCode);

    return generatedCode;
  } catch (error) {
    console.error('❌ Error generating routes:', error.message);
  }
}
```

**Answer:** The function creates a pipeline where each component has a specific job. First, the **Lexer** reads the raw text and breaks it into tokens (like "route", "Admin", "/users", "GET"). Then the **Parser** takes these tokens and builds a tree structure based on the grammar rules, creating nodes for each route definition and suburl. Finally, the **Visitor** walks through this tree and generates the actual JavaScript code by visiting each node and transforming it into Express router statements. It's like an assembly line: lexer breaks text into pieces, parser organizes the pieces into a structure, and visitor builds the final product.

---

## 8) Little Languages (Representing Code as Data, Building Languages to Solve Problems)

### Case Study: Creating a DSL to Eliminate Repetitive Routing Code

The Sportivex backend had over 50 route definitions that all followed the same pattern: `router.get('/path', authenticateToken, controller.GETHandler)`. Writing these manually was tedious, error-prone, and hard to maintain. The team realized they could represent these routes as simple data in a custom language, then automatically generate the repetitive JavaScript code. They created a "little language" (DSL) where routes are just data structures like `route Admin { /users: GET, POST }`. This DSL is much easier to read and write than raw JavaScript. A code generator reads this data-like representation and produces the actual Express router code, turning 10 lines of DSL into 50+ lines of production-ready JavaScript with all the necessary imports, middleware, and controller references.

**Q8.1 – Code as Data Representation:**  
How does the DSL format in routes.dsl represent routing logic as declarative data rather than imperative code, and why is this data-like representation easier to read and maintain than writing raw Express router statements?

```
// routes.dsl - Routes represented as data
route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}

// This DSL generates the following JavaScript:
// router.get('/users', authenticateToken, adminController.GETHandler);
// router.post('/users', authenticateToken, adminController.POSTHandler);
// router.get('/orders', authenticateToken, adminController.GETHandler);
// router.get('/profile', authenticateToken, clientController.GETHandler);
// router.put('/profile', authenticateToken, clientController.UPDATEHandler);
```

**Answer:** The DSL represents routes as simple declarations—you just say "what" you want (Admin routes for /users with GET and POST) without saying "how" to create them. It's like filling out a form instead of writing instructions. This is easier to read because you can see all your routes at a glance without the noise of `router.`, `authenticateToken`, and controller names repeated everywhere. When you need to add a new route, you just add one line like `/products: GET` instead of writing the full `router.get('/products', authenticateToken, adminController.GETHandler)` statement.

**Q8.2 – Domain-Specific Language Design:**  
How does the Routes DSL solve the specific problem of repetitive Express routing code, and what makes it a "little language" rather than a general-purpose programming language?

```js
// ExpressCodeGenerator.js - Transforms DSL data into code
generateRouterStatement(path, action, role) {
  // Map UPDATE to PUT for Express
  const method = action === 'UPDATE' ? 'put' : action.toLowerCase();
  
  // Create controller name from role (e.g., Admin -> adminController)
  const controllerName = `${role.toLowerCase()}Controller`;
  
  // Create handler name (e.g., GET -> GETHandler)
  const handlerName = `${action}Handler`;
  
  // Generate the router statement
  return `router.${method}('${path}', authenticateToken, ${controllerName}.${handlerName});`;
}

getCompleteCode() {
  const imports = [
    "import express from 'express';",
    "import authenticateToken from './middleware/auth.js';",
    "import adminController from './controllers/adminController.js';",
    "import clientController from './controllers/clientController.js';",
    "",
    "const router = express.Router();",
    ""
  ];

  const exports = [
    "",
    "export default router;"
  ];

  return [...imports, ...this.generatedCode, ...exports].join('\n');
}
```

**Answer:** The Routes DSL is designed to solve one specific problem: defining Express routes without writing repetitive boilerplate code. It's a "little language" because it only knows about routes, roles, paths, and HTTP methods—nothing else. You can't write loops, conditionals, or general logic like you can in JavaScript. It's specialized for its domain (routing), which makes it simple and focused. The code generator automatically adds all the repetitive parts (imports, middleware, controller names) that would be tedious to write manually, so developers only specify the unique parts (which routes exist).

**Q8.3 – Building Languages to Solve Problems:**  
How does creating a custom DSL for Sportivex routing demonstrate the principle of "building languages to solve problems," and what are the trade-offs between using a DSL versus writing routes directly in JavaScript?

```
// Problem: Repetitive JavaScript code (BEFORE DSL)
import express from 'express';
import authenticateToken from './middleware/auth.js';
import adminController from './controllers/adminController.js';
import clientController from './controllers/clientController.js';

const router = express.Router();

router.get('/users', authenticateToken, adminController.GETHandler);
router.post('/users', authenticateToken, adminController.POSTHandler);
router.get('/orders', authenticateToken, adminController.GETHandler);
router.get('/profile', authenticateToken, clientController.GETHandler);
router.put('/profile', authenticateToken, clientController.UPDATEHandler);

export default router;

// Solution: Clean DSL (AFTER)
route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}
```

**Answer:** The DSL demonstrates "building languages to solve problems" by creating a custom notation that perfectly fits the routing problem—it removes all the repetitive parts and lets developers focus only on what's unique (the actual routes). The trade-off is that you need to build and maintain the parser and code generator, which adds complexity. However, once built, adding new routes becomes much faster and less error-prone. The DSL also enforces consistency (all routes follow the same pattern) and makes it easier to see the big picture of your API structure. The downside is that developers need to learn the DSL syntax, and very custom routes that don't fit the pattern might need to be written in JavaScript anyway.

---

You can answer **one question per topic** for Assignment #2, and all questions for the full project, using the actual code snippets from the Sportivex Routes DSL project above.

