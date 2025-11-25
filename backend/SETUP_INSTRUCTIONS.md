# Sportivex Backend Setup Instructions

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Supabase account and project

## Environment Setup

1. **Create a `.env` file** in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3000

# JWT Configuration (if needed)
JWT_SECRET=your_jwt_secret_here
```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and API keys

## Database Setup

The server will automatically create dummy data in the `users_metadata` table
when it starts. Make sure your Supabase database has the following table
structure:

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

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Manual Node.js execution

```bash
node src/server.js
```

## What Happens on Startup

When you run the server, it will:

1. ✅ Start the Express server on the specified port (default: 3000)
2. 🔍 Check if dummy data already exists in the database
3. 📝 If no dummy data exists, it will automatically insert 5 dummy users:
   - Ahmad Ali Khan (Student, CMS ID: 12345)
   - Fatima Sheikh (Student, CMS ID: 12346)
   - Dr. Muhammad Hassan (Faculty, CMS ID: 98765)
   - Sara Ahmed (Alumni, CMS ID: 12347)
   - Usman Malik (Student, CMS ID: 12348)

## API Endpoints

- **Health Check:** `GET /health`
- **Auth Endpoints:** `POST /api/auth/*` (see AUTHENTICATION_API.md for details)

## Troubleshooting

1. **"Missing Supabase environment variables" error:**
   - Make sure your `.env` file exists and contains all required variables
   - Check that the file is in the root directory (same level as package.json)

2. **Database connection issues:**
   - Verify your Supabase URL and keys are correct
   - Ensure your Supabase project is active
   - Check if the `users_metadata` table exists in your database

3. **Port already in use:**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `npx kill-port 3000`

## Dummy Data Management

The server includes functions to manage dummy data:

- **Auto-insertion:** Runs automatically on first startup
- **Duplicate prevention:** Won't insert if dummy data already exists
- **Clear data:** Use the service functions to clear dummy data if needed

## Next Steps

After the server starts successfully:

1. Check the console output for confirmation of dummy data insertion
2. Visit `http://localhost:3000/health` to verify the server is running
3. Check your Supabase dashboard to see the inserted dummy data

