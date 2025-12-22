-- Adicionar novos campos para Dados Pessoais
ALTER TABLE public.questionarios
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS data_nascimento date,
ADD COLUMN IF NOT EXISTS peso numeric,
ADD COLUMN IF NOT EXISTS altura numeric,
ADD COLUMN IF NOT EXISTS tipo_exame text,
ADD COLUMN IF NOT EXISTS data_exame date;

-- Remover a coluna idade, pois será calculada a partir da data de nascimento
ALTER TABLE public.questionarios DROP COLUMN IF EXISTS idade;