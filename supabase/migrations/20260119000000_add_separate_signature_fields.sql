-- Adicionar campos separados para assinaturas de assistente e operador
-- Isso permite que RM/TC tenha ambas as assinaturas no PDF final

-- Campos para assinatura do assistente
ALTER TABLE public.questionarios
ADD COLUMN IF NOT EXISTS assinatura_assistente TEXT,
ADD COLUMN IF NOT EXISTS nome_assistente TEXT,
ADD COLUMN IF NOT EXISTS registro_assistente TEXT;

-- Campos para assinatura do operador
ALTER TABLE public.questionarios
ADD COLUMN IF NOT EXISTS assinatura_operador TEXT,
ADD COLUMN IF NOT EXISTS nome_operador TEXT,
ADD COLUMN IF NOT EXISTS registro_operador TEXT;

-- Remover campo obsoleto
ALTER TABLE public.questionarios
DROP COLUMN IF EXISTS assinatura_tecnico;

-- Comentários explicativos
COMMENT ON COLUMN public.questionarios.assinatura_assistente IS 'Base64 da assinatura digital do assistente (RM/TC)';
COMMENT ON COLUMN public.questionarios.nome_assistente IS 'Nome do técnico que assinou como assistente';
COMMENT ON COLUMN public.questionarios.registro_assistente IS 'Registro profissional formatado do assistente (ex: CRBM-2 nº 1234)';

COMMENT ON COLUMN public.questionarios.assinatura_operador IS 'Base64 da assinatura digital do operador';
COMMENT ON COLUMN public.questionarios.nome_operador IS 'Nome do técnico que assinou como operador';
COMMENT ON COLUMN public.questionarios.registro_operador IS 'Registro profissional formatado do operador (ex: COREN-SP 123456)';
