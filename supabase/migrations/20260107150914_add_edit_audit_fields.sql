-- Adicionar campos de auditoria para rastreamento de edições
ALTER TABLE public.questionarios
ADD COLUMN IF NOT EXISTS last_edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_edited_by text,
ADD COLUMN IF NOT EXISTS edit_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS edit_history jsonb DEFAULT '[]'::jsonb;

-- Índice para consultas de edição
CREATE INDEX IF NOT EXISTS idx_questionarios_last_edited
ON public.questionarios(last_edited_at DESC);

-- Comentários
COMMENT ON COLUMN public.questionarios.last_edited_at IS 'Timestamp da última edição';
COMMENT ON COLUMN public.questionarios.last_edited_by IS 'Identificador do usuário que editou';
COMMENT ON COLUMN public.questionarios.edit_count IS 'Número total de edições';
COMMENT ON COLUMN public.questionarios.edit_history IS 'Histórico completo de edições em JSONB';

-- Trigger para rastrear edições automaticamente
CREATE OR REPLACE FUNCTION public.track_questionnaire_edit()
RETURNS trigger AS $$
BEGIN
  IF OLD.respostas_completas IS DISTINCT FROM NEW.respostas_completas THEN
    NEW.edit_count = COALESCE(OLD.edit_count, 0) + 1;
    NEW.last_edited_at = now();

    NEW.edit_history = COALESCE(OLD.edit_history, '[]'::jsonb) ||
      jsonb_build_object(
        'edited_at', now(),
        'edited_by', NEW.last_edited_by,
        'edit_number', NEW.edit_count
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_questionnaire_edit_trigger ON public.questionarios;
CREATE TRIGGER track_questionnaire_edit_trigger
  BEFORE UPDATE ON public.questionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.track_questionnaire_edit();
