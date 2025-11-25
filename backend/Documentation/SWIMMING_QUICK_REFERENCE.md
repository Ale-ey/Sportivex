# Swimming Module - Quick Reference Guide

## Quick Setup (5 Steps)

1. **Run Database Migration**
   ```bash
   # Execute swimming_module.sql in Supabase SQL Editor
   ```

2. **Add Gender to Users**
   ```sql
   UPDATE users_metadata SET gender = 'male' WHERE ...;
   ```

3. **Create Time Slots**
   ```bash
   POST /api/swimming/time-slots
   ```

4. **Get QR Code**
   ```bash
   GET /api/swimming/qr-codes
   # Print and place at reception
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## API Endpoints (Quick Reference)

### User Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/time-slots` | List slots | ✅ |
| GET | `/time-slots/:id` | Slot details | ✅ |
| POST | `/attendance/scan-qr` | QR check-in | ✅ |
| GET | `/attendance/user/history` | My history | ✅ |
| GET | `/attendance/:slotId` | View attendance | ✅ |
| GET | `/attendance/current-count/:slotId` | Live count | ✅ |
| POST | `/waitlist/join` | Join waitlist | ✅ |
| DELETE | `/waitlist/leave` | Leave waitlist | ✅ |
| GET | `/waitlist/:slotId` | View waitlist | ✅ |
| GET | `/rules` | View rules | ✅ |

### Admin Endpoints

| Method | Endpoint | Purpose | Role |
|--------|----------|---------|------|
| POST | `/time-slots` | Create slot | Faculty/Admin |
| PUT | `/time-slots/:id` | Update slot | Faculty/Admin |
| DELETE | `/time-slots/:id` | Delete slot | Faculty/Admin |
| POST | `/attendance/check-in` | Manual check-in | Faculty/Admin |
| POST | `/rules` | Create rule | Faculty/Admin |
| PUT | `/rules/:id` | Update rule | Faculty/Admin |
| DELETE | `/rules/:id` | Delete rule | Faculty/Admin |
| GET | `/qr-codes` | List QR codes | Faculty/Admin |
| POST | `/qr-codes` | Create QR code | Faculty/Admin |
| PUT | `/qr-codes/:id` | Update QR code | Faculty/Admin |
| DELETE | `/qr-codes/:id` | Delete QR code | Faculty/Admin |

## Time Slot Determination (10-Min Rule)

```
Current Time vs Slots:

Slot A: 09:00-10:30
Slot B: 11:00-12:30
Slot C: 02:00-03:30

09:15 → Slot A (current)
10:20 → Slot A (current, not within 10min of next)
10:50 → Slot B (within 10min)
11:15 → Slot B (current)
12:45 → Slot C (next upcoming)
01:50 → Slot C (within 10min)
```

## Gender Restrictions

| Value | Who Can Access |
|-------|----------------|
| `male` | Male students only |
| `female` | Female students only |
| `faculty_pg` | Faculty & PG students |
| `mixed` | All students |

## QR Code Check-in Flow

```
1. User scans QR code
2. App → POST /attendance/scan-qr { qrCodeValue }
3. Backend validates QR code
4. Backend determines time slot (10-min rule)
5. Backend checks gender/role
6. Backend checks capacity
7. Backend creates attendance
8. App shows confirmation
```

## Common Requests

### Create Time Slot

```bash
POST /api/swimming/time-slots
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "startTime": "09:00",
  "endTime": "10:30",
  "genderRestriction": "male",
  "maxCapacity": 20
}
```

> Time slots are defined once and reused every day; pair them with `session_date` when recording attendance or waitlist entries.

### QR Code Check-in

```bash
POST /api/swimming/attendance/scan-qr
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "qrCodeValue": "SWIMMING-abc123"
}
```

### Join Waitlist

```bash
POST /api/swimming/waitlist/join
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "timeSlotId": "uuid",
  "sessionDate": "2024-01-15"
}
```

### Get Attendance Count

```bash
GET /api/swimming/attendance/current-count/:timeSlotId?date=2024-01-15
Authorization: Bearer <user-token>
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad request | Check request format |
| 401 | Unauthorized | Add/refresh token |
| 403 | Forbidden | Check role permissions |
| 404 | Not found | Check resource exists |
| 409 | Conflict | Already checked in / full |
| 500 | Server error | Check logs |

## Common Errors

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Invalid QR code" | QR code inactive/not found | Check QR code value |
| "Already checked in" | Duplicate check-in | Show confirmation instead |
| "Capacity exceeded" | Slot is full | Prompt to join waitlist |
| "Gender restriction" | Wrong gender for slot | Show appropriate slots |
| "No time slots available" | No slots today | Show next day |

## Database Tables (Quick)

```
swimming_time_slots      → Time slot definitions
swimming_attendance      → Check-in records
swimming_qr_codes        → QR code values
swimming_waitlist        → Waitlist entries
swimming_rules_regulations → Pool rules
users_metadata.gender    → User gender field
```

## Key Validations

✅ QR code exists and active
✅ User is authenticated
✅ Gender matches slot restriction
✅ Capacity not exceeded
✅ No duplicate check-in
✅ Time slot is active
✅ Valid session date

## Files to Know

```
Controllers: src/controllers/swimmingController.js
Routes:      src/routes/swimming.js
Services:    src/services/swimmingService.js
Utils:       src/utils/timeSlotDetermination.js
             src/utils/swimmingValidation.js
Migration:   database/migrations/swimming_module.sql
```

## Testing Checklist

- [ ] QR code scanning works
- [ ] Time slot determination correct
- [ ] Gender restrictions enforced
- [ ] Capacity limits enforced
- [ ] Waitlist functions work
- [ ] Duplicate check-in prevented
- [ ] Admin endpoints secured
- [ ] Real-time updates working

## Environment Variables

```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_secret
PORT=3000
```

## Real-time Subscription (Frontend)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

supabase
  .channel('attendance')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'swimming_attendance' },
    (payload) => console.log('Update:', payload)
  )
  .subscribe();
```

## Useful SQL Queries

### Get Today's Attendance

```sql
SELECT * FROM swimming_attendance 
WHERE session_date = CURRENT_DATE;
```

### Get Active QR Codes

```sql
SELECT * FROM swimming_qr_codes 
WHERE is_active = true;
```

### Get Active Slots

```sql
SELECT * FROM swimming_time_slots 
WHERE is_active = true 
ORDER BY start_time;
```

### Get Waitlist Position

```sql
SELECT position FROM swimming_waitlist 
WHERE user_id = 'user-uuid' 
AND time_slot_id = 'slot-uuid' 
AND session_date = '2024-01-15';
```

## Support Resources

📚 Full API Docs: `SWIMMING_API.md`
📖 Setup Guide: `SWIMMING_MODULE_README.md`
🔧 Implementation: `SWIMMING_IMPLEMENTATION_SUMMARY.md`
💾 Database Schema: `SCHEMA.md`

## Quick Troubleshooting

**Server won't start?**
→ Check `.env` file exists with all variables

**QR scan fails?**
→ Check QR code is active in database

**Capacity not updating?**
→ Check Supabase Realtime connection

**Gender restriction not working?**
→ Verify user has gender field set

**Time slot not auto-detecting?**
→ Check server timezone configuration

## Production Deployment

1. ✅ Run migration SQL
2. ✅ Set production env vars
3. ✅ Configure CORS
4. ✅ Set up monitoring
5. ✅ Test all endpoints
6. ✅ Generate QR codes
7. ✅ Train staff
8. ✅ Launch! 🚀

---

**Base URL**: `http://localhost:3000/api/swimming`

**All endpoints require**: `Authorization: Bearer <token>`

**Admin endpoints require**: Faculty or Admin role

**Documentation**: See `Documentation/` folder

