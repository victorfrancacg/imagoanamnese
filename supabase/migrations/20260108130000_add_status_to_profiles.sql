-- Add status column to profiles table
-- Status values: 'pendente', 'ativo', 'inativo'
ALTER TABLE public.profiles
ADD COLUMN status TEXT DEFAULT 'pendente';

-- Add check constraint to ensure valid status values
ALTER TABLE public.profiles
ADD CONSTRAINT status_check CHECK (status IN ('pendente', 'ativo', 'inativo'));

-- Set existing profiles to 'ativo' (retroactive compatibility)
UPDATE public.profiles
SET status = 'ativo'
WHERE status IS NULL OR status = 'pendente';

COMMENT ON COLUMN public.profiles.status IS 'Status do técnico: pendente (aguardando aprovação), ativo (aprovado), inativo (desativado)';
