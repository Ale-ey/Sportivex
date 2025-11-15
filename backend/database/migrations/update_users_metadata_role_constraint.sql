-- Drop the existing role check constraint
ALTER TABLE public.users_metadata 
DROP CONSTRAINT IF EXISTS users_metadata_role_check;

-- Add new role check constraint with updated values: ug, pg, alumni, faculty
ALTER TABLE public.users_metadata 
ADD CONSTRAINT users_metadata_role_check CHECK (
  (role)::text = ANY (
    ARRAY[
      'ug'::text,
      'pg'::text,
      'alumni'::text,
      'faculty'::text
    ]
  )
);

