-- ============================================
-- GYM ATTENDANCE DEBUG QUERIES
-- Run these in Supabase SQL Editor to debug
-- ============================================

-- 1. Check if there are ANY records in gym_attendance table
SELECT 
  COUNT(*) as total_records,
  MIN(session_date) as earliest_date,
  MAX(session_date) as latest_date,
  MIN(check_in_time) as earliest_checkin,
  MAX(check_in_time) as latest_checkin
FROM gym_attendance;

-- 2. Check all records with basic info
SELECT 
  id,
  user_id,
  registration_id,
  session_date,
  check_in_time,
  check_in_method,
  created_at
FROM gym_attendance
ORDER BY check_in_time DESC
LIMIT 10;

-- 3. Check today's records (using current date)
SELECT 
  id,
  user_id,
  registration_id,
  session_date,
  check_in_time,
  check_in_method
FROM gym_attendance
WHERE session_date = CURRENT_DATE
ORDER BY check_in_time DESC;

-- 4. Check records with user information (join test)
SELECT 
  ga.id,
  ga.user_id,
  ga.session_date,
  ga.check_in_time,
  ga.check_in_method,
  u.id as user_exists,
  u.name,
  u.email,
  u.cms_id,
  u.role
FROM gym_attendance ga
LEFT JOIN users_metadata u ON ga.user_id = u.id
ORDER BY ga.check_in_time DESC
LIMIT 10;

-- 5. Check today's records with user info
SELECT 
  ga.id,
  ga.user_id,
  ga.session_date,
  ga.check_in_time,
  ga.check_in_method,
  u.name,
  u.email,
  u.cms_id,
  u.role,
  u.gender
FROM gym_attendance ga
LEFT JOIN users_metadata u ON ga.user_id = u.id
WHERE ga.session_date = CURRENT_DATE
ORDER BY ga.check_in_time DESC;

-- 6. Check if session_date format matches (YYYY-MM-DD)
SELECT 
  id,
  session_date,
  session_date::text as session_date_text,
  CURRENT_DATE as today,
  CURRENT_DATE::text as today_text,
  (session_date = CURRENT_DATE) as is_today
FROM gym_attendance
ORDER BY check_in_time DESC
LIMIT 5;

-- 7. Check recent records (last 24 hours) regardless of session_date
SELECT 
  ga.id,
  ga.user_id,
  ga.session_date,
  ga.check_in_time,
  ga.check_in_method,
  u.name,
  u.email,
  u.cms_id
FROM gym_attendance ga
LEFT JOIN users_metadata u ON ga.user_id = u.id
WHERE ga.check_in_time >= NOW() - INTERVAL '24 hours'
ORDER BY ga.check_in_time DESC;

-- 8. Check if there are any records with NULL user_id or registration_id
SELECT 
  COUNT(*) as records_with_null_user,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_id,
  COUNT(CASE WHEN registration_id IS NULL THEN 1 END) as null_registration_id
FROM gym_attendance;

-- 9. Full query matching backend logic (exact match)
SELECT 
  ga.*,
  json_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'cms_id', u.cms_id,
    'gender', u.gender,
    'role', u.role,
    'profile_picture_url', u.profile_picture_url
  ) as user
FROM gym_attendance ga
LEFT JOIN users_metadata u ON ga.user_id = u.id
WHERE ga.session_date = CURRENT_DATE
ORDER BY ga.check_in_time DESC
LIMIT 100;

-- 10. Check all records regardless of date (for testing)
SELECT 
  ga.*,
  json_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'cms_id', u.cms_id,
    'gender', u.gender,
    'role', u.role,
    'profile_picture_url', u.profile_picture_url
  ) as user
FROM gym_attendance ga
LEFT JOIN users_metadata u ON ga.user_id = u.id
ORDER BY ga.check_in_time DESC
LIMIT 100;

-- 11. Check which table a specific QR code is in (replace 'YOUR_QR_CODE_VALUE' with actual QR code)
SELECT 
  'gym_qr_codes' as table_name,
  qr_code_value,
  is_active,
  created_at
FROM gym_qr_codes
WHERE qr_code_value = 'YOUR_QR_CODE_VALUE'
UNION ALL
SELECT 
  'swimming_qr_codes' as table_name,
  qr_code_value,
  is_active,
  created_at
FROM swimming_qr_codes
WHERE qr_code_value = 'YOUR_QR_CODE_VALUE';

-- 12. List all gym QR codes
SELECT 
  id,
  qr_code_value,
  description,
  location,
  is_active,
  created_at
FROM gym_qr_codes
ORDER BY created_at DESC;

-- 13. List all swimming QR codes
SELECT 
  id,
  qr_code_value,
  location_name,
  description,
  is_active,
  created_at
FROM swimming_qr_codes
ORDER BY created_at DESC;

-- 14. Check if any gym attendance records exist
SELECT 
  COUNT(*) as total_gym_attendance,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(session_date) as earliest_date,
  MAX(session_date) as latest_date
FROM gym_attendance;

-- 15. Check if any swimming attendance records exist (to verify they're separate)
SELECT 
  COUNT(*) as total_swimming_attendance,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(session_date) as earliest_date,
  MAX(session_date) as latest_date
FROM swimming_attendance;

