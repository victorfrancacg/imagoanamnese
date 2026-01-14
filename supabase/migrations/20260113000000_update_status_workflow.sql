-- Migration: Atualizar fluxo de status com assistente/operador
-- Novos status: aguardando_assistente, aguardando_operador, finalizado, cancelado

-- 1. Remover a constraint antiga PRIMEIRO
ALTER TABLE "public"."questionarios" DROP CONSTRAINT IF EXISTS "status_check";

-- 2. Migrar registros existentes baseado no tipo de exame

-- TC e RM vão para aguardando_assistente
UPDATE "public"."questionarios"
SET status = 'aguardando_assistente'
WHERE status = 'aguardando_revisao'
  AND tipo_exame IN ('tomografia', 'ressonancia');

-- Mamografia e Densitometria vão para aguardando_operador
UPDATE "public"."questionarios"
SET status = 'aguardando_operador'
WHERE status = 'aguardando_revisao'
  AND tipo_exame IN ('mamografia', 'densitometria');

-- Qualquer outro caso (tipo_exame null ou desconhecido) vai para aguardando_operador
UPDATE "public"."questionarios"
SET status = 'aguardando_operador'
WHERE status = 'aguardando_revisao';

-- 3. Adicionar nova constraint com os 4 status
ALTER TABLE "public"."questionarios"
ADD CONSTRAINT "status_check"
CHECK ((status = ANY (ARRAY[
  'aguardando_assistente'::text,
  'aguardando_operador'::text,
  'finalizado'::text,
  'cancelado'::text
])));

-- 4. Remover o DEFAULT antigo
ALTER TABLE "public"."questionarios" ALTER COLUMN status DROP DEFAULT;
