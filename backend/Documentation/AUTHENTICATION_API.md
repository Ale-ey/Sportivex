# Authentication API Documentation

This document describes the authentication API endpoints for the Sportivex backend application using custom JWT authentication with bcrypt password hashing.

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication Flow

The application uses custom JWT-based authentication:

1. **Registration**: User creates account with NUST email → receives JWT token
2. **Login**: User authenticates → receives JWT token (expires in 1 hour)
3. **Protected Requests**: Include JWT token in Authorization header
4. **Token Refresh**: Use refresh endpoint with valid token to get new token
5. **Logout**: Client-side token removal (optional server-side blacklisting)

### Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret, expire after 1 hour
- **Token Format**: Bearer token in Authorization header
- **NUST Email Validation**: Only NUST domain emails accepted

## NUST Email Validation

Only official NUST email addresses are accepted for registration. The following domains are supported:

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

## Public Endpoints (No Authentication Required)

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
    "password": "securePassword123"
}
```

#### Field Requirements

- `name`: Full name (required, minimum 2 characters)
- `cmsId`: CMS ID number (required, positive integer, unique)
- `role`: Must be one of: "student", "alumni", "faculty"
- `email`: Must be a valid NUST email address (unique)
- `password`: Minimum 6 characters

#### Response

**Success (201):**

```json
{
    "success": true,
    "message": "User registered successfully. Please check your NUST email to confirm your account.",
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "emailConfirmed": false,
            "institution": "NUST"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_in": "1h"
    }
}
```

**Error (400) - Missing Fields:**

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

**Error (400) - Email Already Exists:**

```json
{
    "success": false,
    "message": "User with this email already exists"
}
```

**Error (400) - CMS ID Already Exists:**

```json
{
    "success": false,
    "message": "User with this CMS ID already exists"
}
```

---

### 2. Login User

**POST** `/login`

Authenticate user with email and password.

#### Request Body

```json
{
    "email": "john.doe@nust.edu.pk",
    "password": "securePassword123"
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
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "emailConfirmed": true,
            "institution": "NUST"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_in": "1h"
    }
}
```

**Error (400) - Missing Fields:**

```json
{
    "success": false,
    "message": "Email and password are required"
}
```

**Error (401) - Invalid Credentials:**

```json
{
    "success": false,
    "message": "Invalid email or password"
}
```

---

### 3. Request Password Reset

**POST** `/request-password-reset`

Request a password reset email (requires email service implementation).

#### Request Body

```json
{
    "email": "john.doe@nust.edu.pk"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "If an account with that email exists, a password reset link has been sent."
}
```

> **Note**: Returns success even if email doesn't exist (prevents email enumeration attacks)

---

### 4. Reset Password

**POST** `/reset-password`

Reset password using reset token (requires password reset token implementation).

#### Request Body

```json
{
    "token": "reset-token-here",
    "newPassword": "newSecurePassword123"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Password reset functionality to be implemented with email service"
}
```

> **Note**: This endpoint is a placeholder for future email service integration

---

## Protected Endpoints (Authentication Required)

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### 5. Get User Profile

**GET** `/profile`

Get current authenticated user's profile information.

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "John Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "institution": "NUST",
            "phone": "+92-300-1234567",
            "dateOfBirth": "2000-01-01",
            "address": "Islamabad, Pakistan",
            "profilePictureUrl": "https://example.com/profile.jpg",
            "bio": "Computer Science student at NUST",
            "emailConfirmed": true,
            "registrationDate": "2024-01-15T10:30:00.000Z"
        }
    }
}
```

**Error (404):**

```json
{
    "success": false,
    "message": "User not found"
}
```

---

### 6. Update User Profile

**PUT** `/profile`

Update current user's profile information.

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body

All fields are optional. Only include fields you want to update:

```json
{
    "name": "Jane Doe",
    "phone": "+92-300-7654321",
    "dateOfBirth": "2000-06-15",
    "address": "Rawalpindi, Pakistan",
    "profilePictureUrl": "https://example.com/new-profile.jpg",
    "bio": "Updated bio text"
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
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "Jane Doe",
            "cmsId": 123456,
            "role": "student",
            "email": "john.doe@nust.edu.pk",
            "phone": "+92-300-7654321",
            "dateOfBirth": "2000-06-15",
            "address": "Rawalpindi, Pakistan",
            "profilePictureUrl": "https://example.com/new-profile.jpg",
            "bio": "Updated bio text"
        }
    }
}
```

**Error (400):**

```json
{
    "success": false,
    "message": "Failed to update profile"
}
```

> **Note**: Email, CMS ID, and role cannot be updated through this endpoint

---

### 7. Change Password

**POST** `/change-password`

Change password for authenticated user.

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request Body

```json
{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
}
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

**Error (400):**

```json
{
    "success": false,
    "message": "Current password and new password are required"
}
```

**Error (401):**

```json
{
    "success": false,
    "message": "Current password is incorrect"
}
```

---

### 8. Refresh Token

**POST** `/refresh-token`

Generate a new JWT token using current valid token.

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "john.doe@nust.edu.pk",
            "role": "student",
            "cmsId": 123456
        },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_in": "1h"
    }
}
```

**Error (404):**

```json
{
    "success": false,
    "message": "User not found"
}
```

> **Note**: Token must still be valid (not expired) to refresh. If token is expired, user must login again.

---

### 9. Logout User

**POST** `/logout`

Logout current user (client-side token removal recommended).

#### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200):**

```json
{
    "success": true,
    "message": "Logged out successfully. Please remove the token from client storage."
}
```

> **Note**: With JWT, logout is primarily handled client-side by removing the token. Server-side token blacklisting can be implemented for additional security.

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized (No Token)

```json
{
    "success": false,
    "message": "Access token required"
}
```

### 401 Unauthorized (Token Expired)

```json
{
    "success": false,
    "message": "Token has expired. Please login again.",
    "code": "TOKEN_EXPIRED"
}
```

### 401 Unauthorized (Invalid Token)

```json
{
    "success": false,
    "message": "Invalid token format",
    "code": "INVALID_TOKEN"
}
```

### 403 Forbidden (Email Not Confirmed)

```json
{
    "success": false,
    "message": "Please confirm your email address to access this resource"
}
```

### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Internal server error"
}
```

---

## Environment Variables Required

Set up the following environment variables in your `.env` file:

```env
# Database (Supabase as database only, not auth)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_recommended

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Frontend Integration

### Installation

```bash
npm install axios
```

### Authentication Service Example

```javascript
// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/auth';

class AuthService {
  // Register new user
  async register(userData) {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  // Login user
  async login(email, password) {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
```

### Axios Interceptor for Authentication

```javascript
// src/services/api.js
import axios from 'axios';
import authService from './authService';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Token expired - redirect to login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Example

```javascript
// Register
import authService from './services/authService';

const handleRegister = async () => {
  try {
    const result = await authService.register({
      name: "John Doe",
      cmsId: 123456,
      role: "student",
      email: "john.doe@nust.edu.pk",
      password: "securePassword123"
    });
    
    if (result.success) {
      console.log('User registered:', result.data.user);
      // Redirect to dashboard or home
    }
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.message);
  }
};

// Login
const handleLogin = async () => {
  try {
    const result = await authService.login(
      "john.doe@nust.edu.pk",
      "securePassword123"
    );
    
    if (result.success) {
      console.log('User logged in:', result.data.user);
      // Redirect to dashboard
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
  }
};

// Protected API call
import api from './services/api';

const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    console.log('Profile:', response.data.data.user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

---

## Security Best Practices

1. **Token Storage**:
   - Use `localStorage` or `sessionStorage` for web apps
   - Use secure storage (Keychain/Keystore) for mobile apps
   - Never store tokens in cookies without `httpOnly` flag

2. **HTTPS**:
   - Always use HTTPS in production
   - Never send tokens over unencrypted connections

3. **Token Expiration**:
   - Tokens expire after 1 hour
   - Implement automatic token refresh or re-login flow
   - Clear expired tokens from client storage

4. **Password Requirements**:
   - Minimum 6 characters (can be increased in validation.js)
   - Consider adding complexity requirements
   - Never log or expose passwords

5. **CORS Configuration**:
   - Configure allowed origins in production
   - Restrict API access to known frontend domains

6. **Rate Limiting**:
   - Implement rate limiting on authentication endpoints
   - Prevent brute force attacks

7. **Input Validation**:
   - All inputs are validated on server-side
   - Frontend validation is for UX only, not security

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "cmsId": 123456,
    "role": "student",
    "email": "john.doe@nust.edu.pk",
    "password": "securePassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@nust.edu.pk",
    "password": "securePassword123"
  }'
```

### Get Profile (Replace TOKEN with actual JWT)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

---

## Token Refresh Strategy

Since tokens expire after 1 hour, implement one of these strategies:

1. **Automatic Refresh**: Call `/refresh-token` when token is close to expiration
2. **On-Demand Refresh**: Refresh token when you receive a `TOKEN_EXPIRED` error
3. **Re-login**: Require user to login again after token expires

Example automatic refresh:

```javascript
// Decode JWT to get expiration time
function getTokenExpiration(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000; // Convert to milliseconds
}

// Refresh token 5 minutes before expiration
setInterval(async () => {
  const token = authService.getToken();
  if (token) {
    const expiresAt = getTokenExpiration(token);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt - now < fiveMinutes) {
      try {
        const response = await api.post('/auth/refresh-token');
        localStorage.setItem('token', response.data.data.token);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        authService.logout();
        window.location.href = '/login';
      }
    }
  }
}, 60000); // Check every minute
```

---

## Troubleshooting

### "Invalid token" Error

- Check if token is properly formatted: `Bearer <token>`
- Verify JWT_SECRET matches between token generation and verification
- Ensure token hasn't expired

### "User not found" Error

- Verify user exists in `users_metadata` table
- Check if user ID in token matches database

### "Token has expired" Error

- Implement token refresh or re-login flow
- Current token lifetime is 1 hour

### Database Connection Issues

- Verify Supabase credentials in `.env`
- Check if `users_metadata` table exists
- Ensure proper permissions on the table

---

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset with email tokens
- [ ] Token blacklisting for secure logout
- [ ] Refresh tokens (longer-lived, can generate new access tokens)
- [ ] Multi-factor authentication (MFA)
- [ ] OAuth integration (Google, Microsoft)
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed login attempts
- [ ] Audit logging for security events
