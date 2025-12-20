import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from "@/types/questionnaire";
import { toast } from "@/hooks/use-toast";
import { generateQuestionnaireHTML } from "@/components/questionnaire/Summary";

const N8N_WEBHOOK_URL = "https://n8n.imagoradiologia.cloud/webhook-test/ddd7a19f-0f74-464c-9dd8-b30d7ed6ddac";

async function sendToWebhook(data: QuestionnaireData, savedId: string): Promise<void> {
  try {
    // Gera o HTML do questionário
    const htmlContent = generateQuestionnaireHTML(data);

    const webhookPayload = {
      id: savedId,
      timestamp: new Date().toISOString(),
      paciente: {
        nome: data.nome,
        idade: data.idade,
        sexo: data.sexo,
        sexoOutro: data.sexoOutro || null,
      },
      html: htmlContent,
      respostas: {
        temContraindicacao: data.temContraindicacao,
        contraindicacaoDetalhes: data.contraindicacaoDetalhes || null,
        tomografiaAnterior: data.tomografiaAnterior,
        alergia: data.alergia,
        alergiaDetalhes: data.alergiaDetalhes || null,
        gravida: data.gravida,
        motivoExame: data.motivoExame || null,
        sintomas: data.sintomas,
        sintomasOutros: data.sintomasOutros || null,
        cancerMama: data.cancerMama,
        amamentando: data.amamentando,
        problemaProstata: data.problemaProstata,
        dificuldadeUrinaria: data.dificuldadeUrinaria,
      },
      consentimento: {
        aceitaRiscos: data.aceitaRiscos,
        aceitaCompartilhamento: data.aceitaCompartilhamento,
        assinatura: data.assinaturaData || null,
      },
    };

    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
      mode: "no-cors",
    });

    console.log("Dados e HTML enviados para n8n webhook com sucesso");
  } catch (error) {
    console.error("Erro ao enviar para webhook n8n:", error);
    // Não bloqueia o fluxo principal se o webhook falhar
  }
}

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

    // Enviar dados para o webhook n8n após salvar com sucesso
    await sendToWebhook(data, result.id);

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
