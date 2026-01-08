-- Fix: Remove duplicate RLS policies that were causing conflicts
-- Strategy: Rename the problematic policies first, then drop them by the new name
-- This ensures we're dropping the right ones and not the original working policies

-- Step 1: Rename the duplicate policies created in 20260108131000_add_rls_for_registration.sql
-- (These have slightly different names, so safe to drop directly)
-- "Users can insert their own profile" - already unique name, can drop directly
-- "Users can read their own profile" - already unique name, can drop directly

-- Step 2: Rename the conflicting policies created in 20260108131500_add_admin_rls_policies.sql
-- "Admins can read all profiles" - SAME NAME as existing policy! Must rename first

-- Rename the NEW "Admins can read all profiles" to something unique before dropping
-- Note: PostgreSQL will rename the MOST RECENTLY created policy with this name
ALTER POLICY "Admins can read all profiles" ON public.profiles
RENAME TO "TEMP_Admins_can_read_all_profiles_TO_DELETE";

-- Rename the NEW "Admins can update all profiles" to mark for deletion
ALTER POLICY "Admins can update all profiles" ON public.profiles
RENAME TO "TEMP_Admins_can_update_all_profiles_TO_DELETE";

-- Rename the NEW "Admins can delete profiles" to mark for deletion
ALTER POLICY "Admins can delete profiles" ON public.profiles
RENAME TO "TEMP_Admins_can_delete_profiles_TO_DELETE";

-- Step 3: Now safely drop all the problematic policies by their unique names

-- Drop the duplicates from 20260108131000
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;

-- Drop the renamed policies from 20260108131500
DROP POLICY IF EXISTS "TEMP_Admins_can_read_all_profiles_TO_DELETE" ON public.profiles;
DROP POLICY IF EXISTS "TEMP_Admins_can_update_all_profiles_TO_DELETE" ON public.profiles;
DROP POLICY IF EXISTS "TEMP_Admins_can_delete_profiles_TO_DELETE" ON public.profiles;

-- Note: The original working policies remain intact:
-- ✅ "Users can view own profile" (SELECT)
-- ✅ "Users can update own profile" (UPDATE)
-- ✅ "Users can insert own profile" (INSERT)
-- ✅ "Admins can view all profiles" (SELECT - the ORIGINAL one with get_user_type)

-- The register_technician() function still works because it uses SECURITY DEFINER
-- which bypasses RLS entirely.

COMMENT ON TABLE public.profiles IS
'User profiles table. RLS restored to original working state. Technician registration uses register_technician() function with SECURITY DEFINER.';
