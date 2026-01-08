-- Dropar a policy existente primeiro
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Dropar a função existente
DROP FUNCTION IF EXISTS public.get_user_type(UUID);

-- Recriar a função com COALESCE para lidar com profiles inexistentes
CREATE FUNCTION public.get_user_type(user_id UUID)
RETURNS user_type AS $$
  SELECT COALESCE(
    (SELECT user_type FROM public.profiles WHERE id = user_id LIMIT 1),
    'tecnico'::user_type
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recriar a policy
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.get_user_type(auth.uid()) = 'admin'
  );
