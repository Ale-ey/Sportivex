# Database Schema

## User Authentication

The application uses custom JWT-based authentication with bcrypt password
hashing. User credentials and data are stored in the `users_metadata` table in
Supabase (as a database, not using Supabase auth).

## Authentication Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Expire after 1 hour
- **Token Format**: Bearer token in Authorization header
- **Password Requirements**: Minimum 6 characters (can be customized in
  validation.js)

## NUST Email Domains

The system validates that users register with official NUST email addresses from
these domains:

- `nust.edu.pk` (Main domain)
- `ceme.nust.edu.pk` (College of Electrical and Mechanical Engineering)
- `mce.nust.edu.pk` (Military College of Engineering)
- `scme.nust.edu.pk` (School of Civil and Environmental Engineering)
- `pnec.nust.edu.pk` (Pakistan Navy Engineering College)
- `nca.nust.edu.pk` (National College of Arts)
- `mcs.nust.edu.pk` (Military College of Signals)
- `con.nust.edu.pk` (College of Nursing)
- `seecs.nust.edu.pk` (School of Electrical Engineering and Computer Science)
- `nit.nust.edu.pk` (National Institute of Transportation)
- `nbs.nust.edu.pk` (NUST Business School)
- `asab.nust.edu.pk` (Atta-ur-Rahman School of Applied Biosciences)
- `cas.nust.edu.pk` (College of Aeronautical Engineering)

## Database Tables

### users_metadata

Primary table for storing user accounts, credentials, and profile information.

#### Table Structure

```sql
CREATE TABLE public.users_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying(255) NOT NULL,
  password_hash text NOT NULL,
  name character varying(255) NOT NULL,
  cms_id integer NOT NULL,
  role character varying(20) NOT NULL,
  institution character varying(100) NOT NULL DEFAULT 'NUST'::character varying,
  registration_date timestamp with time zone NULL DEFAULT now(),
  phone character varying(20) NULL,
  date_of_birth date NULL,
  address text NULL,
  profile_picture_url text NULL,
  bio text NULL,
  email_confirmed boolean NOT NULL DEFAULT false,
  email_confirmed_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT users_metadata_pkey PRIMARY KEY (id),
  CONSTRAINT users_metadata_email_key UNIQUE (email),
  CONSTRAINT users_metadata_cms_id_key UNIQUE (cms_id),
  CONSTRAINT users_metadata_role_check CHECK (
    (role)::text = ANY (
      ARRAY[
        'student'::character varying,
        'alumni'::character varying,
        'faculty'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_metadata_email 
  ON public.users_metadata USING btree (email) TABLESPACE pg_default;
  
CREATE INDEX IF NOT EXISTS idx_users_metadata_cms_id 
  ON public.users_metadata USING btree (cms_id) TABLESPACE pg_default;

-- Trigger for auto-updating updated_at timestamp
CREATE TRIGGER update_users_metadata_updated_at 
BEFORE UPDATE ON users_metadata 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `email`: User's email address (unique, must be NUST domain)
- `password_hash`: Bcrypt-hashed password (NEVER store plain text)
- `name`: Full name of the user (min 2 characters)
- `cms_id`: CMS ID number (unique, positive integer)
- `role`: User role - must be one of: student, alumni, faculty
- `institution`: Institution name (defaults to 'NUST')
- `email_confirmed`: Whether email has been confirmed (default: false)

**Optional Fields:**

- `registration_date`: ISO timestamp when user registered (auto-generated)
- `phone`: User's phone number
- `date_of_birth`: User's date of birth
- `address`: User's address
- `profile_picture_url`: URL to user's profile picture
- `bio`: User's biography/description
- `email_confirmed_at`: Timestamp when email was confirmed
- `created_at`: Record creation timestamp (auto-generated)
- `updated_at`: Last update timestamp (auto-updated by trigger)

#### Security Notes

- **Password Storage**: Passwords are hashed using bcrypt (10 salt rounds)
  before storage
- **JWT Tokens**: Contain user id, email, role, and cmsId in payload
- **Token Expiration**: All JWT tokens expire after 1 hour
- **Email Uniqueness**: Enforced at database level with unique constraint
- **CMS ID Uniqueness**: Enforced at database level with unique constraint
- **Role Validation**: Enforced at database level with CHECK constraint

#### Indexes

- `users_metadata_pkey`: Primary key index on `id`
- `users_metadata_email_key`: Unique index on `email` for fast email lookups
- `users_metadata_cms_id_key`: Unique index on `cms_id` for fast CMS ID searches
- `idx_users_metadata_email`: Additional index for email queries
- `idx_users_metadata_cms_id`: Additional index for CMS ID queries

#### Triggers

- `update_users_metadata_updated_at`: Automatically updates `updated_at`
  timestamp on row modification

## JWT Token Structure

Tokens are generated with the following payload:

```json
{
  "id": "user-uuid",
  "email": "user@nust.edu.pk",
  "role": "student",
  "cmsId": 123456,
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `id`: User's unique identifier
- `email`: User's email address
- `role`: User's role (student/alumni/faculty)
- `cmsId`: User's CMS ID
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (1 hour from iat)

## API Response Format

All API responses follow a consistent format:

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

### Token Error Response (Expired/Invalid)

```json
{
  "success": false,
  "message": "Token has expired. Please login again.",
  "code": "TOKEN_EXPIRED"
}
```

## Password Requirements

As defined in `utils/validation.js`:

- Minimum 6 characters
- Can include letters, numbers, and special characters
- Stored as bcrypt hash with 10 salt rounds

## Environment Variables Required

```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Migration from Supabase Auth

If migrating from Supabase Auth to custom JWT:

1. Export user data from `auth.users` table
2. Re-hash passwords (users will need to reset passwords)
3. Migrate user metadata to new `users_metadata` table structure
4. Update `user_id` references to use new `id` field
5. Remove foreign key constraints to `auth.users`
6. Update frontend to handle new authentication flow

## Future Enhancements

- Token blacklisting for logout
- Refresh token implementation (longer-lived tokens)
- Email verification system
- Password reset token table
- Rate limiting on authentication endpoints
- Multi-factor authentication (MFA)

---

# Swimming Module Database Schema

## Overview

The swimming module manages swimming pool time slots, attendance tracking,
waitlist management, QR code-based check-ins, and rules/regulations.

## Swimming Module Tables

### swimming_time_slots

Stores time slot information with gender restrictions and trainer assignments.

#### Table Structure

```sql
CREATE TABLE swimming_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  gender_restriction VARCHAR(20) NOT NULL CHECK (gender_restriction IN ('male', 'female', 'faculty_pg', 'mixed')),
  trainer_id UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE INDEX idx_swimming_time_slots_trainer ON swimming_time_slots(trainer_id);
CREATE INDEX idx_swimming_time_slots_active ON swimming_time_slots(is_active);
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `start_time`: Slot start time
- `end_time`: Slot end time
- `gender_restriction`: Access restriction (male, female, faculty_pg, mixed)
- `max_capacity`: Maximum number of swimmers (default: 20)

**Optional Fields:**

- `trainer_id`: Reference to trainer in users_metadata
- `is_active`: Whether slot is active (default: true)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

> **Note:** Swimming time slots are defined once and reused for every calendar
> day. Daily scheduling is controlled by associating attendance and waitlist
> entries with a specific `session_date`.

---

### swimming_attendance

Tracks real-time attendance for each time slot session (check-in only, no
checkout).

#### Table Structure

```sql
CREATE TABLE swimming_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES swimming_time_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_in_method VARCHAR(20) DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(time_slot_id, user_id, session_date)
);

CREATE INDEX idx_swimming_attendance_time_slot ON swimming_attendance(time_slot_id);
CREATE INDEX idx_swimming_attendance_user ON swimming_attendance(user_id);
CREATE INDEX idx_swimming_attendance_session_date ON swimming_attendance(session_date);
CREATE INDEX idx_swimming_attendance_date_slot ON swimming_attendance(session_date, time_slot_id);
CREATE INDEX idx_swimming_attendance_check_in_time ON swimming_attendance(check_in_time);
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `time_slot_id`: Reference to time slot
- `user_id`: Reference to user checking in
- `session_date`: Date of the session
- `check_in_time`: Timestamp of check-in
- `check_in_method`: Method used (qr_scan or manual)

**Constraints:**

- Unique constraint on (time_slot_id, user_id, session_date) - prevents
  duplicate check-ins
- Cascades on time slot deletion
- No checkout field - check-in is permanent per session

---

### swimming_qr_codes

Stores QR code identifiers for swimming pool locations.

#### Table Structure

```sql
CREATE TABLE swimming_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name VARCHAR(255) NOT NULL DEFAULT 'swimming_pool_reception',
  qr_code_value VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_swimming_qr_codes_value ON swimming_qr_codes(qr_code_value);
CREATE INDEX idx_swimming_qr_codes_active ON swimming_qr_codes(is_active);
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `location_name`: Name of the location (default: 'swimming_pool_reception')
- `qr_code_value`: Unique QR code identifier (format: SWIMMING-{uuid})
- `is_active`: Whether QR code is active

**Optional Fields:**

- `description`: Additional information about the QR code location
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

### swimming_waitlist

Manages users who want to join a time slot when it's at capacity.

#### Table Structure

```sql
CREATE TABLE swimming_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES swimming_time_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_metadata(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  position INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(time_slot_id, user_id, session_date)
);

CREATE INDEX idx_swimming_waitlist_time_slot ON swimming_waitlist(time_slot_id);
CREATE INDEX idx_swimming_waitlist_user ON swimming_waitlist(user_id);
CREATE INDEX idx_swimming_waitlist_session_date ON swimming_waitlist(session_date);
CREATE INDEX idx_swimming_waitlist_status ON swimming_waitlist(status);
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `time_slot_id`: Reference to time slot
- `user_id`: Reference to user on waitlist
- `session_date`: Date of the session
- `position`: Position in waitlist queue
- `status`: Waitlist status (pending, notified, confirmed, cancelled)

**Constraints:**

- Unique constraint on (time_slot_id, user_id, session_date)
- Position is auto-calculated when joining waitlist
- Positions are reordered when users leave

---

### swimming_rules_regulations

Stores rules and regulations content for the swimming pool.

#### Table Structure

```sql
CREATE TABLE swimming_rules_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users_metadata(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_swimming_rules_active ON swimming_rules_regulations(is_active);
CREATE INDEX idx_swimming_rules_order ON swimming_rules_regulations(display_order);
```

#### Field Descriptions

**Required Fields:**

- `id`: Primary key (UUID, auto-generated)
- `title`: Rule title (max 255 characters)
- `content`: Full rule text

**Optional Fields:**

- `category`: Rule category (general, safety, hygiene, checkin)
- `display_order`: Order for displaying rules (default: 0)
- `is_active`: Whether rule is active (default: true)
- `created_by`: Reference to admin who created the rule
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

### users_metadata Updates

Added gender field to support gender-based time slot restrictions.

```sql
ALTER TABLE users_metadata 
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));

CREATE INDEX idx_users_metadata_gender ON users_metadata(gender);
```

**New Field:**

- `gender`: User gender (male, female, other) - used for time slot access
  control

---

## Swimming Module Features

### QR Code Scanning for Attendance

- QR codes placed at swimming pool reception
- Users scan QR code through mobile app
- Backend validates QR code and determines appropriate time slot
- Automatic time slot determination:
  - Within 10 minutes of next slot → assigns to next slot
  - During current slot → assigns to current slot
  - Before first slot → assigns to first slot
- No checkout functionality - check-in is permanent per session

### Time Slot Determination Logic

The system automatically determines which time slot to assign based on:

1. Current time and date
2. Available time slots for current day
3. 10-minute threshold rule:
   - If current time + 10 minutes >= next slot start → next slot
   - Otherwise → current/upcoming slot

### Gender-Based Access Control

Time slots can restrict access based on:

- **male**: Only male students
- **female**: Only female students
- **faculty_pg**: Only faculty and postgraduate students
- **mixed**: All students regardless of gender

### Capacity Management

- Each time slot has a maximum capacity
- Check-in is blocked when capacity is reached
- Users can join waitlist when slot is full
- Real-time capacity tracking

### Waitlist System

- Users join waitlist when slot is at capacity
- Queue position is automatically assigned
- Positions are reordered when users leave
- Status tracking (pending, notified, confirmed, cancelled)

---

## Swimming Module Indexes

All tables have appropriate indexes for performance:

**swimming_time_slots:**

- Primary key on `id`
- Index on `trainer_id` for trainer lookups
- Index on `is_active` for active slot queries

**swimming_attendance:**

- Primary key on `id`
- Index on `time_slot_id` for slot attendance
- Index on `user_id` for user history
- Index on `session_date` for date-based queries
- Composite index on `(session_date, time_slot_id)` for efficient session
  lookups
- Index on `check_in_time` for time-based queries

**swimming_qr_codes:**

- Primary key on `id`
- Unique index on `qr_code_value` for validation
- Index on `is_active` for active code queries

**swimming_waitlist:**

- Primary key on `id`
- Index on `time_slot_id` for slot waitlist
- Index on `user_id` for user waitlist history
- Index on `session_date` for date-based queries
- Index on `status` for status filtering

**swimming_rules_regulations:**

- Primary key on `id`
- Index on `is_active` for active rules
- Index on `display_order` for ordered display

---

## Swimming Module Triggers

All swimming tables have auto-update triggers for `updated_at`:

```sql
CREATE TRIGGER update_swimming_time_slots_updated_at 
BEFORE UPDATE ON swimming_time_slots 
FOR EACH ROW EXECUTE FUNCTION update_swimming_updated_at_column();

-- Similar triggers for all other tables
```

---

## Real-time Updates

The swimming module uses Supabase Realtime for live updates:

- `swimming_attendance` table changes broadcast attendance updates
- `swimming_waitlist` table changes broadcast waitlist position updates
- Frontend can subscribe to these changes for real-time UI updates

---

## Security Considerations

- All swimming endpoints require authentication
- Admin/faculty-only endpoints for management operations
- Gender and role validation enforced at check-in
- QR codes can be deactivated for security
- Unique constraints prevent duplicate check-ins
- Capacity limits strictly enforced

---

## Migration Notes

To set up the swimming module:

1. Run `backend/database/migrations/swimming_module.sql`
2. Add gender field to existing user profiles
3. Create initial time slots
4. Generate QR codes for pool locations
5. Set up Supabase Realtime subscriptions (if needed)

See `SWIMMING_API.md` for complete API documentation.
