# Database Schema

## User Authentication

The application uses custom JWT-based authentication with bcrypt password hashing. User credentials and data are stored in the `users_metadata` table in Supabase (as a database, not using Supabase auth).

## Authentication Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Expire after 1 hour
- **Token Format**: Bearer token in Authorization header
- **Password Requirements**: Minimum 6 characters (can be customized in validation.js)

## NUST Email Domains

The system validates that users register with official NUST email addresses from these domains:

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

- **Password Storage**: Passwords are hashed using bcrypt (10 salt rounds) before storage
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

- `update_users_metadata_updated_at`: Automatically updates `updated_at` timestamp on row modification

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
