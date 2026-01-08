-- Add RLS policies for admin to manage technician profiles

-- Policy: Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Policy: Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Policy: Allow admins to delete profiles (for rejecting technicians)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

COMMENT ON POLICY "Admins can read all profiles" ON public.profiles IS
'Allows admin users to view all technician profiles for management purposes';

COMMENT ON POLICY "Admins can update all profiles" ON public.profiles IS
'Allows admin users to update technician profiles (e.g., approve/reject registration)';

COMMENT ON POLICY "Admins can delete profiles" ON public.profiles IS
'Allows admin users to delete technician profiles when rejecting registration';
