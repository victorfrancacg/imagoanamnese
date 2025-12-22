import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from "@/types/questionnaire";
import { toast } from "@/hooks/use-toast";
import { generateQuestionnairePDF } from "@/lib/generatePDF";

const N8N_WEBHOOK_URL = "https://n8n.imagoradiologia.cloud/webhook-test/ddd7a19f-0f74-464c-9dd8-b30d7ed6ddac";

async function uploadPDF(pdfBlob: Blob, questionarioId: string): Promise<string | null> {
  try {
    const fileName = `questionario_${questionarioId}_${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('questionarios-pdfs')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      return null;
    }

    // Obter URL pública do PDF
    const { data: publicUrlData } = supabase.storage
      .from('questionarios-pdfs')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload do PDF:', error);
    return null;
  }
}

async function updateQuestionarioWithPdfUrl(questionarioId: string, pdfUrl: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('questionarios')
      .update({ pdf_url: pdfUrl })
      .eq('id', questionarioId);

    if (error) {
      console.error('Erro ao atualizar URL do PDF:', error);
    }
  } catch (error) {
    console.error('Erro ao atualizar URL do PDF:', error);
  }
}

async function sendToWebhook(data: QuestionnaireData, savedId: string, pdfUrl: string | null): Promise<void> {
  try {
    const webhookPayload = {
      id: savedId,
      timestamp: new Date().toISOString(),
      pdfUrl: pdfUrl,
      paciente: {
        nome: data.nome,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        sexo: data.sexo,
        peso: data.peso,
        altura: data.altura,
        tipoExame: data.tipoExame,
        dataExame: data.dataExame,
      },
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
        assinatura: data.assinaturaData ? true : false,
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

    console.log("Dados enviados para n8n webhook com sucesso");
  } catch (error) {
    console.error("Erro ao enviar para webhook n8n:", error);
  }
}

export async function saveQuestionario(data: QuestionnaireData): Promise<{ success: boolean; id?: string; pdfUrl?: string }> {
  try {
    // 1. Salvar dados no banco
    const { data: result, error } = await supabase
      .from('questionarios')
      .insert({
        nome: data.nome,
        cpf: data.cpf,
        data_nascimento: data.dataNascimento || null,
        sexo: data.sexo,
        peso: data.peso,
        altura: data.altura,
        tipo_exame: data.tipoExame || null,
        data_exame: data.dataExame || null,
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

    // 2. Gerar PDF
    const pdfBlob = generateQuestionnairePDF(data);

    // 3. Fazer upload do PDF para o storage
    const pdfUrl = await uploadPDF(pdfBlob, result.id);

    // 4. Atualizar o questionário com a URL do PDF
    if (pdfUrl) {
      await updateQuestionarioWithPdfUrl(result.id, pdfUrl);
    }

    // 5. Enviar dados para o webhook n8n
    await sendToWebhook(data, result.id, pdfUrl);

    toast({
      title: "Questionário salvo!",
      description: "Os dados foram salvos com sucesso no sistema.",
    });

    return { success: true, id: result.id, pdfUrl: pdfUrl || undefined };
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
