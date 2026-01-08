-- Remove a policy recursiva
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Cria função que bypassa RLS usando SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_type(user_id UUID)
RETURNS user_type AS $$
  SELECT user_type FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recria a policy usando a função (sem recursão)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.get_user_type(auth.uid()) = 'admin'
  );
