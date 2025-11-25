# Badminton Module Setup

## Issue: 500 Errors on Badminton APIs

If you're getting 500 errors on all badminton API endpoints, it's likely because the database tables haven't been created yet.

## Solution: Run the Database Migration

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Migration**
   - Open the file: `backend/database/migrations/badminton_module.sql`
   - Copy the entire contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute the migration

3. **Verify Tables Created**
   After running the migration, you should have these tables:
   - `badminton_courts` (2 courts will be created automatically)
   - `badminton_availability`
   - `badminton_matches`

## What the Migration Creates

- **badminton_courts**: 2 courts (Court 1 and Court 2)
- **badminton_availability**: Tracks which users are available to play
- **badminton_matches**: Stores match information with teams, courts, and timing
- **Function**: `check_court_availability` - Checks if a court is available at a given time

## After Migration

Once the migration is complete, restart your backend server and the APIs should work correctly.

## Testing

After running the migration, test these endpoints:
- `GET /api/badminton/availability/me` - Should return your availability status
- `GET /api/badminton/courts` - Should return 2 courts
- `GET /api/badminton/players/available` - Should return available players (empty initially)

