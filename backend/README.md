# Sportivex Backend

Backend API for Sportivex - NUST's Sports Management System

## Overview

Sportivex backend is a Node.js/Express API that provides authentication and sports facility management features for NUST students, faculty, and alumni.

## Features

### Authentication System
- Custom JWT-based authentication
- bcrypt password hashing
- NUST email domain validation
- User profile management
- Role-based access control (student, faculty, alumni)

### Swimming Module
- QR code-based attendance check-in
- Time slot management with gender-based restrictions
- Real-time capacity tracking
- Waitlist management for full slots
- Trainer assignment
- Rules and regulations management

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Real-time**: Supabase Realtime

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── auth.js              # JWT configuration
│   │   └── supabase.js          # Supabase client setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── swimmingController.js # Swimming module logic
│   ├── middlewares/
│   │   └── auth.js              # Authentication and authorization middleware
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   └── swimming.js          # Swimming routes
│   ├── services/
│   │   └── swimmingService.js   # Swimming business logic
│   ├── utils/
│   │   ├── validation.js        # Auth validation utilities
│   │   ├── swimmingValidation.js # Swimming validation utilities
│   │   └── timeSlotDetermination.js # Time slot logic
│   └── server.js                # Main server file
├── database/
│   └── migrations/
│       └── swimming_module.sql  # Swimming module database schema
├── Documentation/
│   ├── AUTHENTICATION_API.md    # Auth API docs
│   ├── SWIMMING_API.md          # Swimming API docs
│   ├── SWIMMING_MODULE_README.md # Swimming setup guide
│   ├── SCHEMA.md                # Database schema docs
│   ├── JWT_MIGRATION_SUMMARY.md # JWT migration guide
│   └── MIGRATION_GUIDE.md       # General migration guide
├── tests/
│   ├── auth.config.test.js
│   └── jwt.middleware.test.js
├── package.json
├── .env.example
└── README.md                    # This file
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**

```bash
cd backend
npm install
```

2. **Set up environment variables**

Create a `.env` file in the backend root:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Frontend
FRONTEND_URL=http://localhost:5173
```

3. **Set up the database**

Run the database migrations in your Supabase SQL Editor:

```bash
# First, set up users_metadata table (see Documentation/SCHEMA.md)
# Then, set up swimming module:
```

Execute the contents of `database/migrations/swimming_module.sql` in Supabase SQL Editor.

4. **Run the server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Authentication

Base URL: `/api/auth`

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `POST /change-password` - Change password (requires auth)
- `POST /refresh-token` - Refresh JWT token (requires auth)

See `Documentation/AUTHENTICATION_API.md` for details.

### Swimming Module

Base URL: `/api/swimming`

**Time Slots:**
- `GET /time-slots` - Get all time slots
- `GET /time-slots/:id` - Get specific time slot
- `POST /time-slots` - Create time slot (admin only)
- `PUT /time-slots/:id` - Update time slot (admin only)
- `DELETE /time-slots/:id` - Delete time slot (admin only)

**Attendance:**
- `POST /attendance/scan-qr` - Scan QR code to check in
- `POST /attendance/check-in` - Manual check-in (admin only)
- `GET /attendance/:timeSlotId` - Get attendance for time slot
- `GET /attendance/current-count/:timeSlotId` - Get current count
- `GET /attendance/user/history` - Get user's attendance history

**Waitlist:**
- `POST /waitlist/join` - Join waitlist
- `DELETE /waitlist/leave` - Leave waitlist
- `GET /waitlist/:timeSlotId` - Get waitlist for time slot

**Rules:**
- `GET /rules` - Get all rules
- `POST /rules` - Create rule (admin only)
- `PUT /rules/:id` - Update rule (admin only)
- `DELETE /rules/:id` - Delete rule (admin only)

**QR Codes:**
- `GET /qr-codes` - Get all QR codes (admin only)
- `POST /qr-codes` - Create QR code (admin only)
- `PUT /qr-codes/:id` - Update QR code (admin only)
- `DELETE /qr-codes/:id` - Delete QR code (admin only)

See `Documentation/SWIMMING_API.md` for detailed API documentation.

## Authentication

All endpoints (except `/health`, `/api/auth/register`, `/api/auth/login`) require authentication.

Include JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

- **Students**: Can access swimming facilities, view schedules, check in
- **Faculty**: All student permissions + admin access to swimming module
- **Alumni**: Can access swimming facilities, view schedules, check in

Admin endpoints require `faculty` or `admin` role.

## Swimming Module Features

### QR Code Check-in System

1. User scans QR code at swimming pool reception
2. System validates QR code and determines appropriate time slot
3. System checks gender/role restrictions and capacity
4. System creates attendance record
5. User receives confirmation

**Time Slot Determination Logic:**
- If within 10 minutes of next slot → check in to next slot
- If during current slot → check in to current slot
- If before first slot → check in to first slot

### Gender-Based Restrictions

Time slots can be restricted to:
- Male students only
- Female students only
- Faculty/PG students only
- Mixed (all students)

### Real-time Updates

The swimming module uses Supabase Realtime for live updates:
- Attendance count updates
- Waitlist position changes
- Capacity changes

## Testing

```bash
# Run tests
npm test

# Run specific test file
npm test -- auth.config.test.js
```

## Development

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add route to `src/server.js`
4. Document API in `Documentation/`
5. Update SCHEMA.md if database changes

### Code Style

- Use ES modules (import/export)
- Follow existing code structure
- Add JSDoc comments for functions
- Handle errors gracefully
- Validate all inputs
- Use meaningful variable names

## Database

### Tables

**Authentication:**
- `users_metadata` - User accounts and profiles

**Swimming Module:**
- `swimming_time_slots` - Time slot definitions
- `swimming_attendance` - Attendance records
- `swimming_qr_codes` - QR code values
- `swimming_waitlist` - Waitlist entries
- `swimming_rules_regulations` - Rules and regulations

See `Documentation/SCHEMA.md` for complete schema documentation.

## Deployment

### Environment Variables

Ensure all environment variables are set in production:
- Use strong JWT_SECRET (32+ characters)
- Use production Supabase credentials
- Set NODE_ENV to 'production'
- Configure CORS for frontend domain

### Security Considerations

- JWT tokens expire after 1 hour
- Passwords are hashed with bcrypt (10 rounds)
- Email validation enforces NUST domains
- Rate limiting should be implemented
- QR codes can be deactivated for security

### Monitoring

Monitor these metrics:
- API response times
- Authentication failures
- Database connection pool
- QR scan success/failure rate
- Capacity utilization

## Documentation

Comprehensive documentation is available in the `Documentation/` folder:

- **AUTHENTICATION_API.md** - Authentication endpoints and usage
- **SWIMMING_API.md** - Swimming module API documentation
- **SWIMMING_MODULE_README.md** - Swimming module setup and usage guide
- **SCHEMA.md** - Complete database schema documentation
- **JWT_MIGRATION_SUMMARY.md** - JWT authentication migration guide
- **MIGRATION_GUIDE.md** - General migration guidelines

## Troubleshooting

### Common Issues

**Server won't start:**
- Check if `.env` file exists and has all required variables
- Ensure Supabase credentials are correct
- Check if port 3000 is already in use

**Database connection errors:**
- Verify Supabase URL and keys
- Check network connectivity
- Ensure Supabase project is active

**Authentication errors:**
- Check JWT_SECRET is set
- Verify token format (Bearer token)
- Check token hasn't expired

**QR code scanning issues:**
- Verify QR code is active in database
- Check QR code format (starts with "SWIMMING-")
- Ensure user has valid authentication token

## Support

For issues or questions:
1. Check documentation in `Documentation/` folder
2. Review API documentation
3. Check server logs for errors
4. Contact system administrator

## Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Follow commit message conventions
5. Create pull request with clear description

## License

Proprietary - NUST Sportivex Project

## Contact

For technical questions or support, contact the development team.

