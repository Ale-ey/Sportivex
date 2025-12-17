# Software Engineering Concepts – Conceptual Questions (Sportivex)

Below are short conceptual questions (1–2 lines) based on MIT course concepts, each followed by a code snippet from actual Sportivex frontend and backend modules.

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

## 7) Static Checking and Testing (Validation, TDD, Black/White-box, Partitions, Unit Tests)

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

You can answer **one question per topic** for Assignment #2, and all questions for the full project, using the actual code snippets from Sportivex modules above.
