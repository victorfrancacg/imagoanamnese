import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuestionnaireData } from '@/types/questionnaire';
import { cleanCpf, cleanTelefone } from '@/lib/utils';
import { extractSecurityAnswers, extractClinicalAnswers } from '@/lib/questionnaireTransform';

interface UpdateInput {
  id: string;
  data: QuestionnaireData;
  editedBy: string;
}

/**
 * Hook para atualizar questionários existentes
 * Atualiza tanto as colunas planas quanto o JSONB respostas_completas
 * O trigger automático cuida dos campos de auditoria (last_edited_at, edit_count, edit_history)
 */
export function useQuestionarioUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data, editedBy }: UpdateInput) => {
      // Montar estrutura JSONB completa
      const respostasCompletas = {
        versao: '1.0',
        tipoExame: data.tipoExame,
        dadosPessoais: {
          nome: data.nome,
          cpf: cleanCpf(data.cpf),
          dataNascimento: data.dataNascimento,
          sexo: data.sexo,
          peso: data.peso,
          altura: data.altura,
          telefone: data.telefone,
          dataExame: data.dataExame,
        },
        seguranca: extractSecurityAnswers(data),
        clinicas: extractClinicalAnswers(data),
        consentimento: {
          aceitaRiscos: data.aceitaRiscos ?? false,
          aceitaCompartilhamento: data.aceitaCompartilhamento ?? false,
          assinaturaData: data.assinaturaData,
        },
        metadata: {
          editadoEm: new Date().toISOString(),
          editadoPor: editedBy,
        },
      };

      // Atualizar no Supabase
      // IMPORTANTE: last_edited_by é setado aqui, mas last_edited_at, edit_count e edit_history
      // são atualizados automaticamente pelo trigger track_questionnaire_edit_trigger
      const { data: result, error } = await supabase
        .from('questionarios')
        .update({
          // Colunas planas (para queries rápidas)
          nome: data.nome,
          cpf: cleanCpf(data.cpf),
          telefone: cleanTelefone(data.telefone),
          sexo: data.sexo,
          data_nascimento: data.dataNascimento,
          tipo_exame: data.tipoExame,
          data_exame: data.dataExame,
          // JSONB completo (para histórico e dados detalhados)
          respostas_completas: respostasCompletas,
          // Campo de auditoria (trigger cuida do resto)
          last_edited_by: editedBy,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries para forçar re-fetch dos dados atualizados
      queryClient.invalidateQueries({ queryKey: ['questionario', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['questionarios'] });

      toast({
        title: "Alterações salvas!",
        description: "O questionário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar questionário:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    },
  });
}
