# Authentication API Documentation

This document describes the authentication API endpoints for the Sportivex
backend application using Supabase authentication.

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication Flow

The application uses Supabase authentication with JWT tokens for session
management. Users can register with NUST email addresses and receive JWT tokens
for authenticated requests.

## NUST Email Validation

Only official NUST email addresses are accepted for registration. The following
domains are supported:

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

## Endpoints

### 1. Register User

**POST** `/register`

Register a new user with NUST email, CMS ID, and role information.

#### Request Body

```json
{
    "name": "John Doe",
    "cmsId": 123456,
    "role": "student",
    "email": "john.doe@nust.edu.pk",
    "password": "password123"
}
```

#### Field Requirements

- `name`: Full name (required, minimum 2 characters)
- `cmsId`: CMS ID number (required, positive integer)
- `role`: Must be one of: "student", "alumni", "faculty"
- `email`: Must be a valid NUST email address (see supported domains below)
- `password`: Minimum 6 characters

#### Response

**Success (201):**

```json
{
    "success": true,
    "message": "User registered successfully. Please check your NUST email to confirm your account.",
    "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "cmsId": 123456,
        "role": "student",
        "email": "john.doe@nust.edu.pk",
        "emailConfirmed": false
    }
}
```

**Error (400):**

```json
{
    "success": false,
    "message": "All fields are required: name, cmsId, role, email, password"
}
```

**Error (400) - Invalid NUST Email:**

```json
{
    "success": false,
    "message": "Only NUST email addresses are allowed for registration"
}
```

### 2. Login User

**POST** `/login`

Authenticate user with email and password.

#### Request Body

```json
{
    "email": "john.doe@nust.edu.pk",
    "password": "password123"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": "user-uuid",
            "name": "John Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "emailConfirmed": true
        },
        "token": "jwt-token-here"
    }
}
```

**Error (401):**

```json
{
    "success": false,
    "message": "Invalid email or password"
}
```

### 3. Get User Profile

**GET** `/profile`

Get current user's profile information.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user-uuid",
            "name": "John Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "institution": "NUST"
        }
    }
}
```

### 4. Update User Profile

**PUT** `/profile`

Update current user's profile information.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Request Body

```json
{
    "user_metadata": {
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "+1234567890"
    }
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "user": {
            "id": "user-uuid",
            "email": "user@example.com",
            "metadata": {
                "first_name": "Jane",
                "last_name": "Smith",
                "phone": "+1234567890"
            }
        }
    }
}
```

### 5. Logout User

**POST** `/logout`

Logout current user and invalidate session.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### 6. Request Password Reset

**POST** `/request-password-reset`

Send password reset email to user.

#### Request Body

```json
{
    "email": "user@example.com"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Password reset email sent successfully"
}
```

### 7. Refresh Token

**POST** `/refresh-token`

Refresh expired JWT token using refresh token.

#### Request Body

```json
{
    "refresh_token": "supabase-refresh-token"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "user": {
            "id": "user-uuid",
            "email": "user@example.com",
            "emailConfirmed": true
        },
        "token": "new-jwt-token"
    }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
    "success": false,
    "message": "Error description"
}
```

### 401 Unauthorized

```json
{
    "success": false,
    "message": "Access token required"
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error"
}
```

## Environment Variables Required

Make sure to set up the following environment variables in your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Frontend Integration

### Authentication Flow

1. User registers/logs in via `/register` or `/login` endpoints
2. Store the JWT token from response
3. Include token in Authorization header for protected routes:
   `Authorization: Bearer <token>`
4. Handle token refresh when needed using `/refresh-token` endpoint

### Example Frontend Usage

```javascript
// Register a new user
const registerResponse = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "John Doe",
        cmsId: 123456,
        role: "student",
        email: "john.doe@nust.edu.pk",
        password: "password123",
    }),
});

const registerData = await registerResponse.json();
if (registerData.success) {
    console.log("Registration successful:", registerData.user);
}

// Login
const loginResponse = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email: "john.doe@nust.edu.pk",
        password: "password123",
    }),
});

const loginData = await loginResponse.json();
if (loginData.success) {
    localStorage.setItem("token", loginData.data.token);
    console.log("User logged in:", loginData.data.user);
}

// Authenticated request
const token = localStorage.getItem("token");
const profileResponse = await fetch("/api/auth/profile", {
    headers: {
        "Authorization": `Bearer ${token}`,
    },
});
```

## Security Notes

- JWT tokens expire after 7 days
- Use HTTPS in production
- Store tokens securely (not in localStorage for sensitive applications)
- Implement proper CORS configuration for production
- Validate all input data on both client and server side
