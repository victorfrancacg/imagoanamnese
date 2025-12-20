import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from "@/types/questionnaire";
import { toast } from "@/hooks/use-toast";

export async function saveQuestionario(data: QuestionnaireData): Promise<{ success: boolean; id?: string }> {
  try {
    const { data: result, error } = await supabase
      .from('questionarios')
      .insert({
        nome: data.nome,
        idade: data.idade,
        sexo: data.sexo,
        sexo_outro: data.sexoOutro || null,
        tem_contraindicacao: data.temContraindicacao,
        contraindicacao_detalhes: data.contraindicacaoDetalhes || null,
        tomografia_anterior: data.tomografiaAnterior,
        alergia: data.alergia,
        alergia_detalhes: data.alergiaDetalhes || null,
        gravida: data.gravida,
        motivo_exame: data.motivoExame || null,
        sintomas: data.sintomas,
        sintomas_outros: data.sintomasOutros || null,
        cancer_mama: data.cancerMama,
        amamentando: data.amamentando,
        problema_prostata: data.problemaProstata,
        dificuldade_urinaria: data.dificuldadeUrinaria,
        aceita_riscos: data.aceitaRiscos ?? false,
        aceita_compartilhamento: data.aceitaCompartilhamento ?? false,
        assinatura_data: data.assinaturaData || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving questionario:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o questionário. Tente novamente.",
        variant: "destructive",
      });
      return { success: false };
    }

    toast({
      title: "Questionário salvo!",
      description: "Os dados foram salvos com sucesso no sistema.",
    });

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error saving questionario:', error);
    toast({
      title: "Erro ao salvar",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return { success: false };
  }
}
