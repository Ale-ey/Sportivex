## 6) Parsing – Implementation (Sportivex Routes DSL)

### How we implemented it

We used **ANTLR 4** as a parser generator to turn the textual Routes DSL into a structured representation that our code generator can work with. The language is defined once in `Routes.g4`, where we specify parser rules like `program`, `routeDef`, and `suburlDef`, and lexer rules like `ROLE`, `ACTION`, and `SUBURL`. From this single grammar file, we run ANTLR with the JavaScript target, which generates `RoutesLexer.js`, `RoutesParser.js`, `RoutesVisitor.js`, and `RoutesListener.js`. In `generateRoutes.js`, we wire these pieces together: we read `routes.dsl` from disk, feed it into `RoutesLexer` and `RoutesParser` to build a parse tree (`parser.program()`), and then use a custom visitor, `ExpressCodeGenerator`, to walk that parse tree. `ExpressCodeGenerator` extends the generated `RoutesVisitor` and overrides `visitProgram`, `visitRouteDef`, and `visitSuburlDef` to extract each role, sub‑URL, and HTTP action. For every `(role, path, action)` combination, it calls `generateRouterStatement`, which maps actions like `GET` or `UPDATE` into the appropriate Express method (e.g., `get`, `put`) and builds the final `router.method('/path', authenticateToken, controller.Handler)` lines. At the end, `getCompleteCode()` wraps all generated statements with the import lines, router creation, and export, producing a ready‑to‑use Express router module.

### Why we implemented it this way

We chose an ANTLR‑based parsing pipeline because it lets us describe the DSL once, in a clear grammar, and then rely on a proven parser generator instead of hand‑writing brittle string parsing code. This approach scales better as the language evolves: adding a new HTTP verb or role means changing `Routes.g4` and regenerating the parser, not hunting through ad‑hoc regexes. Using the visitor pattern separates syntax from behavior; ANTLR is responsible for building the parse tree, and `ExpressCodeGenerator` focuses only on the routing semantics and code generation. This makes the system easier to test and reason about: we can parse the same DSL file with different visitors (for logging, analysis, or codegen) without touching the grammar. Overall, this design reduces parsing bugs, keeps the language definition centralized, and gives us a clean pipeline from DSL text to production Express code.

---

## 8) Little Languages – Implementation (Routes DSL for Express)

### How we implemented it

We implemented a **little language (DSL)** specifically for declaring HTTP routes and permissions, instead of writing those routes directly in JavaScript. The syntax lives in `Routes.g4` and is intentionally small: a `program` is just one or more `route` blocks, each `route` associates a `ROLE` (like `Admin` or `Client`) with a set of `suburlDef` entries, and each `suburlDef` ties a `SUBURL` (such as `/users` or `/profile`) to an `actionList` of HTTP verbs (`GET`, `POST`, `UPDATE`, `DELETE`). A concrete example is stored in `routes.dsl`, where we write declarative blocks like:

```text
route Admin {
  /users: GET, POST
  /orders: GET
}

route Client {
  /profile: GET, UPDATE
}
```

Our generator, `ExpressCodeGenerator`, treats this file as pure data: for every role, it collects the sub‑URLs and actions, and turns them into Express router calls by following deterministic naming conventions (e.g., `Admin` → `adminController`, `GET` → `GETHandler`, `UPDATE` → `put`). The top‑level script `generateRoutes.js` connects everything: it reads `routes.dsl`, parses it with the ANTLR‑generated parser, runs the visitor, and outputs a complete `router` module that can be imported into an Express app.

### Why we implemented it this way

We built this little language to solve a very concrete problem in the backend: there were many repetitive, boilerplate‑heavy Express route definitions that all followed the same pattern but differed only in role, path, and HTTP method. By designing a tiny DSL that only talks about those three concepts, we eliminated most of the duplication and made the routing policy much easier to see and change. Representing routes as data in `routes.dsl` means that reviewing or modifying the API is a matter of editing a short, declarative file instead of scanning through long JavaScript modules. The DSL also enforces consistency—every route goes through the same generator and middleware pipeline—and makes it straightforward to add new routes or roles without touching low‑level Express code. In short, using a focused little language gave us clearer configuration, fewer bugs from copy‑paste errors, and a maintainable way to grow the routing layer over time.



## 2. Concurrency

### Implementation: Concurrent QR Scanning with Pessimistic Locking

**File**: `backend/src/services/swimmingServiceWithADT.js`

#### How it's implemented

The implementation uses pessimistic locking via a `withLock()` function that acquires an exclusive lock on a resource key (e.g., `attendance:{slotId}:{date}`) before entering a critical section. Inside the lock, it reads current attendance, creates an `AttendanceADT` instance for validation, performs the check-in operation atomically, and persists to database—all while holding the lock. After releasing the lock, it uses message passing (Socket.IO) to broadcast updates to all users. The lock has a timeout (5 seconds) to prevent deadlocks.

#### What it's doing

The `processQRScanWithConcurrency` function handles simultaneous QR code scans from multiple users when checking into swimming pool time slots. It prevents race conditions where two users could both read the same capacity count (e.g., 19/20), both see availability, and both get accepted—exceeding capacity. By locking the specific time slot resource, only one user can read-modify-write at a time. After User A completes and releases the lock, User B acquires it, reads the updated count (20/20), and correctly gets rejected for being at capacity.

#### Benefits

- **Race Condition Prevention**: Locks ensure only one user can modify attendance at a time
- **Capacity Guarantee**: Impossible to exceed max capacity even with simultaneous requests
- **Consistent State**: All users see the same attendance count after each operation
- **Real-time Updates**: Message passing notifies all users when capacity changes
- **Deadlock Prevention**: Timeout on locks prevents indefinite waiting

#### Code Snippet

```464:539:backend/src/services/swimmingServiceWithADT.js
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

---

