-- Add RLS policy to allow users to create their own profile during registration
-- This is necessary for the technician self-registration feature

-- Policy: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS
'Allows authenticated users to create their own profile during registration';

COMMENT ON POLICY "Users can read their own profile" ON public.profiles IS
'Allows authenticated users to read their own profile data';
