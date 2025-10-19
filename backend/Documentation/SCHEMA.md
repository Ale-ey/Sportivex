# Database Schema

## User Authentication

The application uses Supabase authentication which manages the following user
fields:

### auth.users (Supabase managed)

- `id` (uuid) - Primary key
- `email` (text) - User email address
- `email_confirmed_at` (timestamp) - Email confirmation timestamp
- `created_at` (timestamp) - User creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `user_metadata` (jsonb) - Custom user metadata
- `app_metadata` (jsonb) - Application-specific metadata

### Custom User Metadata Structure

```json
{
    "name": "string",
    "cms_id": "integer",
    "role": "student|alumni|faculty",
    "institution": "NUST",
    "registration_date": "timestamp"
}
```

### Field Descriptions

- `name`: Full name of the user (required, min 2 characters)
- `cms_id`: CMS ID number (required, positive integer)
- `role`: User role - must be one of: student, alumni, faculty
- `institution`: Always "NUST" for NUST-affiliated users
- `registration_date`: ISO timestamp when user registered

### NUST Email Domains

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

## Custom Tables

### users_metadata

A custom table for storing additional user information beyond what's available
in Supabase's built-in auth system.

#### Table Structure

```sql
CREATE TABLE users_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    cms_id INTEGER UNIQUE,
    role VARCHAR(20) CHECK (role IN ('student', 'alumni', 'faculty')),
    institution VARCHAR(100) DEFAULT 'NUST',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Field Descriptions

- `id`: Primary key (UUID, auto-generated)
- `user_id`: Foreign key referencing auth.users(id)
- `name`: Full name of the user
- `cms_id`: CMS ID number (unique, positive integer)
- `role`: User role - must be one of: student, alumni, faculty
- `institution`: Institution name (defaults to 'NUST')
- `registration_date`: ISO timestamp when user registered
- `phone`: User's phone number
- `date_of_birth`: User's date of birth
- `address`: User's address
- `profile_picture_url`: URL to user's profile picture
- `bio`: User's biography/description
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp (auto-updated)

#### Security

- Row Level Security (RLS) is enabled
- Users can only view, update, and insert their own metadata
- Automatic cascade delete when user is removed from auth.users

#### Indexes

- `idx_users_metadata_user_id`: Index on user_id for faster lookups
- `idx_users_metadata_cms_id`: Index on cms_id for faster searches

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

## Authentication

- JWT tokens are used for session management
- Tokens expire after 7 days
- Supabase handles password hashing and email verification
- Service role key is used for server-side operations
