# Swimming Module API Documentation

## Overview

The Swimming Module API provides endpoints for managing swimming pool time slots, attendance tracking via QR code scanning, waitlist management, and rules/regulations. All endpoints require authentication unless otherwise specified.

## Base URL

```
http://localhost:3000/api/swimming
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow the standard API response format:

### Success Response

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Time Slots Endpoints

### Get All Time Slots

Get all time slots with optional filters.

**Endpoint:** `GET /time-slots`

**Auth Required:** Yes

**Query Parameters:**

- `gender` (optional): Filter by gender restriction (male, female, faculty_pg, mixed)
- `active` (optional): Filter by active status (true/false)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "timeSlots": [
      {
        "id": "uuid",
        "start_time": "09:00:00",
        "end_time": "10:30:00",
        "gender_restriction": "male",
        "trainer_id": "uuid",
        "trainer": {
          "id": "uuid",
          "name": "John Doe",
          "email": "trainer@nust.edu.pk"
        },
        "max_capacity": 20,
        "is_active": true,
        "currentCount": 15,
        "availableSpots": 5,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### Get Time Slot by ID

Get specific time slot details.

**Endpoint:** `GET /time-slots/:id`

**Auth Required:** Yes

**URL Parameters:**

- `id`: Time slot UUID

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "timeSlot": {
      "id": "uuid",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "gender_restriction": "male",
      "trainer_id": "uuid",
      "trainer": {
        "id": "uuid",
        "name": "John Doe",
        "email": "trainer@nust.edu.pk"
      },
      "max_capacity": 20,
      "is_active": true,
      "currentCount": 15,
      "availableSpots": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Create Time Slot

Create a new time slot (admin/faculty only).

**Endpoint:** `POST /time-slots`

**Auth Required:** Yes (admin/faculty only)

**Request Body:**

```json
{
  "startTime": "09:00",
  "endTime": "10:30",
  "genderRestriction": "male",
  "trainerId": "uuid (optional)",
  "maxCapacity": 20
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Time slot created successfully",
  "data": {
    "timeSlot": {
      "id": "uuid",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "gender_restriction": "male",
      "trainer_id": "uuid",
      "max_capacity": 20,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Update Time Slot

Update an existing time slot (admin/faculty only).

**Endpoint:** `PUT /time-slots/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: Time slot UUID

**Request Body:** (all fields optional)

```json
{
  "startTime": "09:00",
  "endTime": "10:30",
  "genderRestriction": "male",
  "trainerId": "uuid",
  "maxCapacity": 25,
  "isActive": true
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Time slot updated successfully",
  "data": {
    "timeSlot": {
      "id": "uuid",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "gender_restriction": "male",
      "trainer_id": "uuid",
      "max_capacity": 25,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Delete Time Slot

Delete a time slot (admin/faculty only).

**Endpoint:** `DELETE /time-slots/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: Time slot UUID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Time slot deleted successfully"
}
```

---

## Attendance Endpoints

### Scan QR Code

Scan QR code at swimming pool reception to check in.

**Endpoint:** `POST /attendance/scan-qr`

**Auth Required:** Yes

**Request Body:**

```json
{
  "qrCodeValue": "SWIMMING-uuid-or-value"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": "uuid",
    "checkInTime": "2024-01-01T09:05:00Z",
    "sessionDate": "2024-01-01"
  },
  "timeSlot": {
    "id": "uuid",
    "startTime": "09:00:00",
    "endTime": "10:30:00",
    "genderRestriction": "male",
    "trainerName": "John Doe",
    "currentCount": 16,
    "maxCapacity": 20
  },
  "slotDeterminationReason": "current_slot",
  "slotMessage": "Check-in for current slot (09:00:00 - 10:30:00)"
}
```

**Error Response (409 Conflict) - Already Checked In:**

```json
{
  "success": false,
  "message": "You have already checked in for this time slot today",
  "alreadyCheckedIn": true
}
```

**Error Response (409 Conflict) - Capacity Exceeded:**

```json
{
  "success": false,
  "message": "This time slot has reached maximum capacity",
  "capacityExceeded": true,
  "timeSlot": {
    "id": "uuid",
    "startTime": "09:00:00",
    "endTime": "10:30:00",
    "currentCount": 20,
    "maxCapacity": 20
  }
}
```

**Error Response (400 Bad Request) - Gender Restriction:**

```json
{
  "success": false,
  "message": "This time slot is restricted to male swimmers only"
}
```

---

### Manual Check-in

Manually check in a user (admin/faculty only).

**Endpoint:** `POST /attendance/check-in`

**Auth Required:** Yes (admin/faculty only)

**Request Body:**

```json
{
  "userId": "uuid",
  "timeSlotId": "uuid",
  "sessionDate": "2024-01-01"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Manual check-in successful",
  "data": {
    "attendance": {
      "id": "uuid",
      "time_slot_id": "uuid",
      "user_id": "uuid",
      "session_date": "2024-01-01",
      "check_in_time": "2024-01-01T09:05:00Z",
      "check_in_method": "manual",
      "created_at": "2024-01-01T09:05:00Z",
      "updated_at": "2024-01-01T09:05:00Z"
    }
  }
}
```

---

### Get Attendance for Time Slot

Get attendance list for a specific time slot and date.

**Endpoint:** `GET /attendance/:timeSlotId`

**Auth Required:** Yes

**URL Parameters:**

- `timeSlotId`: Time slot UUID

**Query Parameters:**

- `date` (optional): Session date in YYYY-MM-DD format (defaults to today)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "id": "uuid",
        "time_slot_id": "uuid",
        "user_id": "uuid",
        "session_date": "2024-01-01",
        "check_in_time": "2024-01-01T09:05:00Z",
        "check_in_method": "qr_scan",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@nust.edu.pk",
          "cms_id": 123456,
          "gender": "male",
          "role": "student"
        },
        "created_at": "2024-01-01T09:05:00Z",
        "updated_at": "2024-01-01T09:05:00Z"
      }
    ],
    "count": 1,
    "sessionDate": "2024-01-01",
    "timeSlot": {
      "id": "uuid",
      "start_time": "09:00:00",
      "end_time": "10:30:00",
      "max_capacity": 20
    }
  }
}
```

---

### Get Current Attendance Count

Get current attendance count for a time slot.

**Endpoint:** `GET /attendance/current-count/:timeSlotId`

**Auth Required:** Yes

**URL Parameters:**

- `timeSlotId`: Time slot UUID

**Query Parameters:**

- `date` (optional): Session date in YYYY-MM-DD format (defaults to today)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentCount": 15,
    "maxCapacity": 20,
    "availableSpots": 5,
    "sessionDate": "2024-01-01"
  }
}
```

---

### Get User Attendance History

Get logged-in user's attendance history.

**Endpoint:** `GET /attendance/user/history`

**Auth Required:** Yes

**Query Parameters:**

- `limit` (optional): Number of records to return (default: 50)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "time_slot_id": "uuid",
        "user_id": "uuid",
        "session_date": "2024-01-01",
        "check_in_time": "2024-01-01T09:05:00Z",
        "check_in_method": "qr_scan",
        "time_slot": {
          "id": "uuid",
          "start_time": "09:00:00",
          "end_time": "10:30:00",
          "gender_restriction": "male",
          "max_capacity": 20
        },
        "created_at": "2024-01-01T09:05:00Z",
        "updated_at": "2024-01-01T09:05:00Z"
      }
    ],
    "count": 1
  }
}
```

---

## Waitlist Endpoints

### Join Waitlist

Join waitlist for a time slot when capacity is full.

**Endpoint:** `POST /waitlist/join`

**Auth Required:** Yes

**Request Body:**

```json
{
  "timeSlotId": "uuid",
  "sessionDate": "2024-01-01"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "waitlist": {
    "id": "uuid",
    "position": 3,
    "status": "pending"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "You are already on the waitlist for this time slot"
}
```

---

### Leave Waitlist

Remove yourself from waitlist.

**Endpoint:** `DELETE /waitlist/leave`

**Auth Required:** Yes

**Request Body:**

```json
{
  "timeSlotId": "uuid",
  "sessionDate": "2024-01-01"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully removed from waitlist"
}
```

---

### Get Waitlist

Get waitlist for a specific time slot.

**Endpoint:** `GET /waitlist/:timeSlotId`

**Auth Required:** Yes

**URL Parameters:**

- `timeSlotId`: Time slot UUID

**Query Parameters:**

- `date` (optional): Session date in YYYY-MM-DD format (defaults to today)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "waitlist": [
      {
        "id": "uuid",
        "time_slot_id": "uuid",
        "user_id": "uuid",
        "session_date": "2024-01-01",
        "position": 1,
        "status": "pending",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@nust.edu.pk"
        },
        "created_at": "2024-01-01T09:00:00Z",
        "updated_at": "2024-01-01T09:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

## Rules and Regulations Endpoints

### Get All Rules

Get all active rules and regulations.

**Endpoint:** `GET /rules`

**Auth Required:** Yes

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "uuid",
        "title": "Pool Hours",
        "content": "The swimming pool is open during designated time slots only.",
        "category": "general",
        "display_order": 1,
        "is_active": true,
        "created_by": "uuid",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### Create Rule

Create a new rule (admin/faculty only).

**Endpoint:** `POST /rules`

**Auth Required:** Yes (admin/faculty only)

**Request Body:**

```json
{
  "title": "New Rule",
  "content": "Rule description here",
  "category": "safety",
  "displayOrder": 5
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Rule created successfully",
  "data": {
    "rule": {
      "id": "uuid",
      "title": "New Rule",
      "content": "Rule description here",
      "category": "safety",
      "display_order": 5,
      "is_active": true,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Update Rule

Update a rule (admin/faculty only).

**Endpoint:** `PUT /rules/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: Rule UUID

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Rule",
  "content": "Updated description",
  "category": "safety",
  "displayOrder": 10,
  "isActive": true
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Rule updated successfully",
  "data": {
    "rule": {
      "id": "uuid",
      "title": "Updated Rule",
      "content": "Updated description",
      "category": "safety",
      "display_order": 10,
      "is_active": true,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T09:00:00Z"
    }
  }
}
```

---

### Delete Rule

Delete a rule (admin/faculty only).

**Endpoint:** `DELETE /rules/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: Rule UUID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Rule deleted successfully"
}
```

---

## QR Code Management Endpoints

### Get All QR Codes

Get all QR codes (admin/faculty only).

**Endpoint:** `GET /qr-codes`

**Auth Required:** Yes (admin/faculty only)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "qrCodes": [
      {
        "id": "uuid",
        "location_name": "Swimming Pool Reception",
        "qr_code_value": "SWIMMING-uuid",
        "is_active": true,
        "description": "Main QR code at reception desk",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### Create QR Code

Create a new QR code (admin/faculty only).

**Endpoint:** `POST /qr-codes`

**Auth Required:** Yes (admin/faculty only)

**Request Body:**

```json
{
  "locationName": "Swimming Pool Entrance",
  "description": "Secondary QR code at entrance"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "QR code created successfully",
  "data": {
    "qrCode": {
      "id": "uuid",
      "location_name": "Swimming Pool Entrance",
      "qr_code_value": "SWIMMING-1234567890-abc123",
      "is_active": true,
      "description": "Secondary QR code at entrance",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Update QR Code

Update a QR code (admin/faculty only).

**Endpoint:** `PUT /qr-codes/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: QR code UUID

**Request Body:** (all fields optional)

```json
{
  "locationName": "Updated Location",
  "description": "Updated description",
  "isActive": false
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "QR code updated successfully",
  "data": {
    "qrCode": {
      "id": "uuid",
      "location_name": "Updated Location",
      "qr_code_value": "SWIMMING-1234567890-abc123",
      "is_active": false,
      "description": "Updated description",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T09:00:00Z"
    }
  }
}
```

---

### Delete QR Code

Delete a QR code (admin/faculty only).

**Endpoint:** `DELETE /qr-codes/:id`

**Auth Required:** Yes (admin/faculty only)

**URL Parameters:**

- `id`: QR code UUID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

## QR Code Scanning Flow

### How It Works

1. **User scans QR code** at swimming pool reception using mobile app
2. **App sends QR code value** to `/attendance/scan-qr` endpoint
3. **Backend validates**:
   - QR code exists and is active
   - User is authenticated
   - Gets time slots for current day
   - Determines appropriate time slot based on current time:
     - If within 10 minutes of next slot → assigns to next slot
     - Otherwise → assigns to current/upcoming slot
   - Validates user eligibility (gender/role restrictions)
   - Checks capacity limits
   - Checks for duplicate check-in
4. **Backend creates attendance record**
5. **Backend returns success** with time slot details
6. **App displays confirmation** to user
7. **Real-time updates** broadcast to all clients

### Time Slot Determination Rules

- **Within 10 minutes of next slot**: User is checked in to the next slot
- **During a slot**: User is checked in to the current slot
- **Before first slot**: User is checked in to the first slot
- **After last slot**: Error - all slots have ended
- **Between slots**: User is checked in to the next upcoming slot

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / Validation error |
| 401 | Unauthorized / Invalid token |
| 403 | Forbidden / Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (already checked in, capacity full) |
| 500 | Internal server error |

---

## Real-time Updates

The swimming module uses Supabase Realtime for live updates:

- Subscribe to `swimming_attendance` table for real-time check-ins
- Subscribe to `swimming_waitlist` table for waitlist changes
- Updates are broadcast when:
  - User checks in
  - User joins/leaves waitlist
  - Capacity changes

To subscribe to real-time updates on the frontend:

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to attendance changes
const attendanceSubscription = supabase
  .channel('swimming_attendance_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'swimming_attendance' },
    (payload) => {
      console.log('Attendance changed:', payload);
      // Update UI
    }
  )
  .subscribe();
```

---

## Gender Restrictions

Time slots can have the following gender restrictions:

- **male**: Only male students
- **female**: Only female students
- **faculty_pg**: Only faculty and postgraduate students
- **mixed**: All students regardless of gender

Users must have their gender field set in their profile to check in to gender-specific slots.

---

## Notes

- All timestamps are in ISO 8601 format with timezone
- All dates are in YYYY-MM-DD format
- Session dates use server timezone
- QR codes start with "SWIMMING-" prefix
- Check-in is permanent (no checkout functionality)
- Users can only check in once per session per day
- Capacity enforcement is strict - use waitlist when full

