-- Add telefone and sexo columns to questionarios table
ALTER TABLE public.questionarios
  ADD COLUMN telefone TEXT,
  ADD COLUMN sexo TEXT;

-- Add check constraint for sexo values
ALTER TABLE public.questionarios
  ADD CONSTRAINT sexo_check CHECK (
    sexo IS NULL OR sexo IN ('masculino', 'feminino')
  );

-- Add comments for documentation
COMMENT ON COLUMN public.questionarios.telefone IS 'Telefone do paciente (apenas números, sem formatação)';
COMMENT ON COLUMN public.questionarios.sexo IS 'Sexo do paciente: masculino, feminino, ou null';
