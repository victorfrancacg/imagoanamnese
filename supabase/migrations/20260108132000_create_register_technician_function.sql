-- Function to register a new technician (bypasses RLS safely)
-- This is needed because newly registered users are not yet authenticated

CREATE OR REPLACE FUNCTION public.register_technician(
  user_id UUID,
  p_nome TEXT,
  p_cpf TEXT,
  p_professional_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This function runs with elevated permissions, bypassing RLS
SET search_path = public
AS $$
BEGIN
  -- Insert the new technician profile with status 'pendente'
  INSERT INTO public.profiles (id, nome, cpf, user_type, professional_id, status)
  VALUES (user_id, p_nome, p_cpf, 'tecnico', p_professional_id, 'pendente');
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.register_technician(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.register_technician IS
'Allows newly registered users to create their technician profile during signup. Runs with elevated permissions to bypass RLS. Always creates profiles with user_type=tecnico and status=pendente for security.';
