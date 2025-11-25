# Swimming Module - Setup and Usage Guide

## Overview

The Swimming Module is a comprehensive system for managing swimming pool operations at NUST, including:

- Time slot management with gender-based restrictions
- QR code-based attendance check-in system
- Real-time capacity tracking
- Waitlist management for full slots
- Trainer assignment
- Rules and regulations management

## Features

### 1. QR Code Scanning for Attendance

- **Scan-to-Check-In**: Users scan a QR code at the swimming pool reception to check in
- **Automatic Time Slot Detection**: System automatically determines which time slot to assign based on current time
- **10-Minute Rule**: If within 10 minutes of the next time slot, user is checked in to the next slot
- **No Checkout**: Check-in is permanent per session (no checkout required)
- **Duplicate Prevention**: Users cannot check in twice for the same time slot on the same day

### 2. Gender-Based Access Control

Time slots can be restricted by:
- **Male-only**: Only male students can check in
- **Female-only**: Only female students can check in
- **Faculty/PG**: Only faculty and postgraduate students can check in
- **Mixed**: All students can check in

### 3. Real-time Attendance Tracking

- Live attendance count per time slot
- Current capacity vs. maximum capacity display
- Real-time updates using Supabase Realtime
- Attendance history for each user

### 4. Capacity Management

- Each time slot has a maximum capacity (default: 20)
- Check-in is blocked when capacity is reached
- Users are prompted to join the waitlist when full

### 5. Waitlist System

- Queue-based waitlist for full time slots
- Automatic position assignment
- Position reordering when users leave
- Status tracking (pending, notified, confirmed, cancelled)

### 6. Trainer Assignment

- Assign trainers to specific time slots
- Display trainer information to users
- Flexible reassignment

### 7. Rules and Regulations

- Manage swimming pool rules
- Categorize rules (general, safety, hygiene, check-in)
- Display order management
- Active/inactive status

## Setup Instructions

### 1. Database Migration

Run the migration SQL file to create all necessary tables:

```bash
# Connect to your Supabase project and run:
psql -h <supabase-db-host> -d postgres -U postgres -f backend/database/migrations/swimming_module.sql
```

Or use the Supabase SQL Editor to execute the contents of `swimming_module.sql`.

### 2. Add Gender Field to Users

Ensure all users have their gender field populated:

```sql
-- Update existing users (if needed)
UPDATE users_metadata SET gender = 'male' WHERE email LIKE '%@seecs.nust.edu.pk';
-- Adjust based on your data
```

### 3. Create Initial Time Slots

Create time slots for your swimming pool schedule:

```bash
# Example: Create a time slot via API
curl -X POST http://localhost:3000/api/swimming/time-slots \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "09:00",
    "endTime": "10:30",
    "genderRestriction": "male",
    "maxCapacity": 20
  }'
```

> Time slots are defined once and automatically apply to every calendar day. Pair them with the desired `session_date` when creating attendance or waitlist entries.

### 4. Generate QR Codes

The migration automatically creates one QR code. To create additional QR codes:

```bash
curl -X POST http://localhost:3000/api/swimming/qr-codes \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "locationName": "Swimming Pool Main Entrance",
    "description": "QR code at main entrance"
  }'
```

Print the QR code value and place it at the designated location.

### 5. Configure Frontend

Update frontend environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## API Usage

### User Flow: Checking In

1. **User opens app** and navigates to swimming section
2. **User scans QR code** at reception using phone camera
3. **App sends QR code to backend:**

```javascript
const response = await fetch('/api/swimming/attendance/scan-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCodeValue: scannedQRCode
  })
});

const result = await response.json();

if (result.success) {
  // Show success message
  console.log('Checked in to:', result.timeSlot);
  console.log('Attendance ID:', result.attendance.id);
} else {
  // Handle errors (capacity full, already checked in, etc.)
  if (result.capacityExceeded) {
    // Prompt user to join waitlist
  }
}
```

4. **Backend processes check-in:**
   - Validates QR code
   - Determines appropriate time slot
   - Checks gender/role eligibility
   - Validates capacity
   - Creates attendance record
   - Returns success with details

5. **App displays confirmation** with time slot details

### Admin Flow: Managing Time Slots

1. **List all time slots:**

```javascript
const response = await fetch('/api/swimming/time-slots', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data } = await response.json();
console.log(data.timeSlots);
```

2. **Create new time slot:**

```javascript
const response = await fetch('/api/swimming/time-slots', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startTime: '14:00',
    endTime: '15:30',
    genderRestriction: 'female',
    maxCapacity: 25
  })
});
```

3. **View attendance:**

```javascript
const response = await fetch('/api/swimming/attendance/{timeSlotId}?date=2024-01-15', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data } = await response.json();
console.log('Attendance:', data.attendance);
console.log('Count:', data.count);
```

## Real-time Updates

### Subscribe to Attendance Changes

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to attendance changes
const attendanceChannel = supabase
  .channel('swimming_attendance_updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'swimming_attendance'
    },
    (payload) => {
      console.log('New check-in:', payload.new);
      // Update UI with new attendance
      updateAttendanceCount();
    }
  )
  .subscribe();

// Unsubscribe when component unmounts
// attendanceChannel.unsubscribe();
```

### Subscribe to Waitlist Changes

```javascript
const waitlistChannel = supabase
  .channel('swimming_waitlist_updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'swimming_waitlist'
    },
    (payload) => {
      console.log('Waitlist updated:', payload);
      // Update waitlist UI
      refreshWaitlist();
    }
  )
  .subscribe();
```

## Time Slot Determination Logic

The system uses the following logic to determine which time slot to assign:

```
Current Time: 09:05 AM
Time Slots:
  - Slot 1: 09:00 AM - 10:30 AM
  - Slot 2: 10:45 AM - 12:15 PM
  - Slot 3: 02:00 PM - 03:30 PM

Scenarios:
1. Check-in at 09:05 AM → Slot 1 (current slot)
2. Check-in at 10:35 AM → Slot 2 (within 10 minutes of next slot)
3. Check-in at 10:20 AM → Slot 1 (still in current slot, not within 10 min of next)
4. Check-in at 01:50 PM → Slot 3 (within 10 minutes of next slot)
5. Check-in at 12:30 PM → Slot 3 (next upcoming slot)
```

## Error Handling

### Common Errors and Solutions

| Error | Reason | Solution |
|-------|--------|----------|
| "Invalid QR code" | QR code doesn't exist or is inactive | Check QR code value, ensure it's active |
| "Already checked in" | User already checked in today | Show attendance confirmation instead |
| "Capacity exceeded" | Time slot is full | Prompt user to join waitlist |
| "Gender restriction" | User gender doesn't match slot | Show appropriate time slots for user |
| "No time slots available" | No slots for current day | Show error or show next day's slots |
| "All slots have ended" | Current time is after last slot | Show next day's schedule |

## Testing

### Test QR Code Scanning

1. Create a test QR code in the database
2. Use QR code testing tool or generate actual QR code image
3. Test scanning with different scenarios:
   - Before first slot
   - During a slot
   - Within 10 minutes of next slot
   - Between slots
   - After last slot

### Test Capacity Management

1. Set a time slot capacity to 2
2. Have 2 users check in
3. Try to check in a 3rd user → should fail with capacity exceeded
4. 3rd user joins waitlist
5. Verify waitlist position

### Test Gender Restrictions

1. Create male-only time slot
2. Try to check in with female user → should fail
3. Try to check in with male user → should succeed

## Production Considerations

### Security

- Rate limit QR scan endpoint to prevent spam
- Validate QR codes are scanned from authorized locations
- Monitor for suspicious patterns (multiple check-ins in short time)
- Regularly rotate QR codes for security

### Performance

- Database indexes are already optimized
- Consider caching time slot data
- Use Supabase Realtime connection pooling
- Monitor attendance table growth (archive old records)

### Monitoring

Monitor these metrics:
- Average check-in time
- Capacity utilization per time slot
- Waitlist usage frequency
- Failed check-in attempts
- QR code scan errors

### Backup

- Regular database backups
- Export attendance records periodically
- Backup QR code values securely

## Troubleshooting

### QR Code Not Working

1. Check if QR code is active in database
2. Verify QR code format (should start with "SWIMMING-")
3. Check server logs for validation errors
4. Ensure user has valid authentication token

### Time Slot Not Auto-Detecting

1. Check server timezone configuration
2. Verify time slot schedule in database
3. Check time slot is active (`is_active = true`)
4. Review time slot determination logic logs

### Capacity Not Updating

1. Check Supabase Realtime connection
2. Verify attendance records are being created
3. Check for database constraint errors
4. Refresh frontend subscriptions

## Support

For issues or questions:
1. Check API documentation: `SWIMMING_API.md`
2. Review database schema: `SCHEMA.md`
3. Check server logs for errors
4. Contact system administrator

## Future Enhancements

Potential features to add:
- Email notifications for waitlist position updates
- SMS notifications for check-in confirmation
- Mobile app with QR scanner
- Admin dashboard with analytics
- Automatic attendance reminders
- Booking system for future sessions
- Trainer scheduling interface
- Equipment tracking and management

