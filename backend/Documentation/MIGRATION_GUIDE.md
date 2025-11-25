# Migration Guide: Supabase Auth to Custom JWT

This guide will help you migrate from Supabase Authentication to custom JWT-based authentication with bcrypt password hashing.

## Overview of Changes

### What Changed

1. **Authentication System**: Replaced Supabase Auth with custom JWT tokens
2. **Password Storage**: Now using bcrypt for password hashing (10 salt rounds)
3. **Token Management**: JWT tokens expire after 1 hour (previously 7 days)
4. **Database Schema**: Modified `users_metadata` table structure
5. **User Storage**: All user data now in `users_metadata` table (no longer in `auth.users`)

### What Stayed the Same

- NUST email validation
- User roles (student, alumni, faculty)
- CMS ID validation
- Password requirements (minimum 6 characters)
- API response format

## Database Migration

### Step 1: Update Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing table if you want to start fresh (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS public.users_metadata CASCADE;

-- Create new users_metadata table with authentication fields
CREATE TABLE IF NOT EXISTS public.users_metadata (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_metadata_email 
  ON public.users_metadata USING btree (email) TABLESPACE pg_default;
  
CREATE INDEX IF NOT EXISTS idx_users_metadata_cms_id 
  ON public.users_metadata USING btree (cms_id) TABLESPACE pg_default;

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_users_metadata_updated_at ON users_metadata;
CREATE TRIGGER update_users_metadata_updated_at 
BEFORE UPDATE ON users_metadata 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Migrate Existing Users (If Applicable)

If you have existing users in Supabase Auth, you'll need to migrate them:

```sql
-- This is a template - adjust based on your actual schema
INSERT INTO public.users_metadata (
  email,
  password_hash,
  name,
  cms_id,
  role,
  institution,
  email_confirmed,
  email_confirmed_at,
  registration_date
)
SELECT 
  au.email,
  '$2a$10$TEMPORARY_HASH', -- Users will need to reset passwords
  au.raw_user_meta_data->>'name',
  (au.raw_user_meta_data->>'cms_id')::integer,
  au.raw_user_meta_data->>'role',
  COALESCE(au.raw_user_meta_data->>'institution', 'NUST'),
  au.email_confirmed_at IS NOT NULL,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users_metadata um 
  WHERE um.email = au.email
);

-- Note: Since we can't decrypt Supabase passwords, users must reset passwords
-- Send password reset emails to all migrated users
```

## Backend Code Changes

### Step 3: Install New Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### Step 4: Update Environment Variables

Create or update your `.env` file:

```env
# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

**Generate a Strong JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Update Code Files

The following files have been updated:

1. ✅ `src/controllers/authController.js` - Completely rewritten for custom JWT
2. ✅ `src/middlewares/auth.js` - Updated to verify JWT and query database
3. ✅ `src/routes/auth.js` - Updated to use new middleware
4. ✅ `src/config/auth.js` - Updated token expiration to 1 hour
5. ✅ `Documentation/SCHEMA.md` - Updated schema documentation
6. ✅ `Documentation/AUTHENTICATION_API.md` - Updated API documentation

### Step 6: Verify Backend Changes

Start your backend server:

```bash
cd backend
npm run dev
```

Check for errors in the console.

## Frontend Migration

### Step 7: Update Frontend Authentication

#### Update Authentication Service

If you have an auth service, update it to:

1. Store JWT token instead of Supabase session
2. Handle 1-hour token expiration
3. Remove Supabase client initialization

**Example:** `src/services/authService.ts`

```typescript
const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
  async register(userData: RegisterData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
```

#### Add Authorization Header to API Calls

Update your API client to include the JWT token:

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 8: Update Protected Routes

Update your route protection logic:

```typescript
// Example with React Router
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Step 9: Handle Token Refresh

Implement automatic token refresh:

```typescript
// Check token expiration and refresh if needed
function setupTokenRefresh() {
  setInterval(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // Refresh if token expires in less than 5 minutes
    if (expiresAt - now < fiveMinutes) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('token', data.data.token);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Logout user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }, 60000); // Check every minute
}

// Call this when app initializes
setupTokenRefresh();
```

## Testing the Migration

### Step 10: Test Authentication Flow

#### 1. Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "cmsId": 999999,
    "role": "student",
    "email": "test@seecs.nust.edu.pk",
    "password": "testPassword123"
  }'
```

Expected response should include:
- `success: true`
- `data.user` object with user info
- `data.access_token` (JWT token)
- `data.expires_in: "1h"`

#### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@seecs.nust.edu.pk",
    "password": "testPassword123"
  }'
```

#### 3. Test Protected Endpoint

```bash
# Replace YOUR_TOKEN with the token from login response
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Test Invalid Token

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

Expected: `401 Unauthorized` with error message

#### 5. Test Token Expiration

Wait for token to expire (1 hour) or manually test with an expired token.

### Step 11: Verify Database

Check that users are being created in the database:

```sql
SELECT id, email, name, cms_id, role, email_confirmed, created_at 
FROM public.users_metadata 
ORDER BY created_at DESC 
LIMIT 10;
```

Verify that `password_hash` is stored (should be a bcrypt hash starting with `$2a$` or `$2b$`):

```sql
SELECT email, password_hash 
FROM public.users_metadata 
LIMIT 1;
```

## Rollback Plan

If you need to rollback to Supabase Auth:

1. Keep a backup of your old code
2. Keep the old `auth.users` table intact during migration
3. If rollback is needed:
   - Restore old backend code
   - Re-enable Supabase Auth
   - Frontend will need to re-login users

## Common Issues and Solutions

### Issue: "Invalid token" errors

**Solution:** 
- Verify JWT_SECRET is set and matches on all instances
- Check token format: must be `Bearer <token>`
- Ensure token hasn't expired (1 hour lifetime)

### Issue: "User not found" after authentication

**Solution:**
- Verify users_metadata table exists
- Check if user was properly created during registration
- Verify database connection

### Issue: Password hashing errors

**Solution:**
- Ensure bcryptjs is installed: `npm list bcryptjs`
- Check Node.js version (requires Node 12+)

### Issue: Token expires too quickly

**Solution:**
- Current expiration is 1 hour (as requested)
- To change: Edit `src/config/auth.js`, change `expiresIn: '1h'` to desired value
- Options: '1h', '2h', '1d', '7d', etc.

### Issue: CORS errors from frontend

**Solution:**
- Verify FRONTEND_URL in backend .env
- Check CORS middleware configuration in server.js
- Ensure frontend is sending credentials correctly

## Security Checklist

After migration, verify:

- [ ] JWT_SECRET is strong (32+ characters) and unique
- [ ] JWT_SECRET is not committed to version control
- [ ] Passwords are being hashed with bcrypt (not stored in plain text)
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Token expiration is working (1 hour)
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected
- [ ] Expired tokens trigger re-authentication

## Performance Considerations

- JWT verification is faster than database lookups
- Middleware still queries database on each request to verify user exists
- Consider implementing token caching for high-traffic applications
- Consider implementing refresh tokens for better UX

## Future Enhancements

Consider implementing:

1. **Refresh Tokens**: Long-lived tokens that can generate new access tokens
2. **Token Blacklisting**: Server-side token invalidation for logout
3. **Email Verification**: Send confirmation emails on registration
4. **Password Reset**: Email-based password reset flow
5. **Rate Limiting**: Prevent brute force attacks
6. **Account Lockout**: Lock accounts after failed login attempts
7. **Audit Logging**: Track authentication events
8. **Multi-Factor Authentication (MFA)**: Additional security layer

## Support

For issues or questions:

1. Check the updated documentation:
   - `Documentation/SCHEMA.md`
   - `Documentation/AUTHENTICATION_API.md`
2. Review the code comments in:
   - `src/controllers/authController.js`
   - `src/middlewares/auth.js`
3. Check server logs for detailed error messages

## Migration Checklist

- [ ] Database schema updated
- [ ] Old users migrated (if applicable)
- [ ] Dependencies installed (bcryptjs, jsonwebtoken)
- [ ] Environment variables configured
- [ ] JWT_SECRET generated and set
- [ ] Backend code updated
- [ ] Backend tested and working
- [ ] Frontend authentication service updated
- [ ] Frontend API client updated (authorization headers)
- [ ] Protected routes updated
- [ ] Token refresh implemented
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Security checklist completed

---

**Migration completed!** Your application now uses custom JWT authentication with bcrypt password hashing.

