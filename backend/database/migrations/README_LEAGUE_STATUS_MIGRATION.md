# League Status Auto-Update Migration

## ⚠️ IMPORTANT: This Migration is SAFE to Run

This migration (`update_leagues_auto_status.sql`) is **completely safe** to execute. It:

✅ **ONLY creates/updates functions and triggers**  
✅ **Does NOT modify any existing data**  
✅ **Does NOT drop any tables or columns**  
✅ **Uses safe SQL commands** (`CREATE OR REPLACE`, `DROP IF EXISTS`)

## What This Migration Does

1. **Creates `update_league_status()` function**: A function that can be called to update all league statuses based on dates
2. **Creates `trigger_update_league_status()` function**: A trigger function that automatically updates status when league dates are modified
3. **Creates a trigger**: Automatically runs the trigger function when dates are inserted/updated

## How to Run

### Option 1: Run via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `update_leagues_auto_status.sql`
4. Paste and execute

### Option 2: Run via psql
```bash
psql -h your-db-host -U your-user -d your-database -f backend/database/migrations/update_leagues_auto_status.sql
```

## What Happens After Running

- **Immediate**: The trigger will automatically update league statuses when dates are modified
- **On Fetch**: The backend service also updates statuses when leagues are fetched (double safety)
- **Manual**: You can call `SELECT update_league_status();` anytime to update all leagues

## Verification

After running, you can verify it worked:

```sql
-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'update_league_status';

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_leagues_auto_status';

-- Test: Update a league's start_date and see if status auto-updates
UPDATE leagues SET start_date = CURRENT_DATE + INTERVAL '1 day' WHERE id = 'some-league-id';
SELECT id, name, status FROM leagues WHERE id = 'some-league-id';
```

## Rollback (if needed)

If you need to remove this migration:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS trigger_leagues_auto_status ON leagues;

-- Remove functions
DROP FUNCTION IF EXISTS trigger_update_league_status();
DROP FUNCTION IF EXISTS update_league_status();
```

## Notes

- The backend service (`leagueService.js`) also updates statuses when fetching leagues, so even without this migration, statuses will be correct
- This migration adds an extra layer of safety by updating statuses at the database level
- The trigger only fires on INSERT/UPDATE of date fields, so it's very efficient

