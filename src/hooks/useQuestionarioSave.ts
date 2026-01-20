import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData, TipoExame } from "@/types/questionnaire";
import { toast } from "@/hooks/use-toast";
import { generateQuestionnairePDF, generateMamografiaPDF, generateDensitometriaPDF, generateRessonanciaPDF } from "@/lib/pdf";
import { cleanCpf, cleanTelefone } from "@/lib/utils";
import { extractSecurityAnswers, extractClinicalAnswers } from "@/lib/questionnaireTransform";

// Determina o status inicial baseado no tipo de exame
function getStatusInicial(tipoExame: TipoExame | null): string {
  // RM e TC precisam passar pelo assistente primeiro
  if (tipoExame === 'ressonancia' || tipoExame === 'tomografia') {
    return 'aguardando_assistente';
  }
  // Mamografia e Densitometria vão direto para o operador
  return 'aguardando_operador';
}

const N8N_WEBHOOK_URL = "https://n8n.imagoradiologia.cloud/webhook-test/fa6f0ca1-b005-4648-9d1d-e01b9186c622";

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
        cpf: cleanCpf(data.cpf),
        telefone: cleanTelefone(data.telefone),
        dataNascimento: data.dataNascimento,
        sexo: data.sexo,
        peso: data.peso,
        altura: data.altura,
        tipoExame: data.tipoExame,
        dataExame: data.dataExame,
      },
      respostas: {
        // Tomografia Computadorizada
        tcGravida: data.tcGravida,
        tcAmamentando: data.tcAmamentando,
        tcUsaMetformina: data.tcUsaMetformina,
        tcMarcapasso: data.tcMarcapasso,
        tcAlergiaContraste: data.tcAlergiaContraste,
        tcCirurgiaRenal: data.tcCirurgiaRenal,
        tcDoencaRenal: data.tcDoencaRenal,
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

async function syncToExternalDatabase(data: QuestionnaireData, lovableCloudId: string, pdfUrl: string | null): Promise<void> {
  try {
    const payload = {
      nome: data.nome,
      cpf: cleanCpf(data.cpf),
      telefone: cleanTelefone(data.telefone),
      data_nascimento: data.dataNascimento || null,
      sexo: data.sexo,
      peso: data.peso,
      altura: data.altura,
      tipo_exame: data.tipoExame || null,
      data_exame: data.dataExame || null,
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
      pdf_url: pdfUrl,
      lovable_cloud_id: lovableCloudId,
    };

    const { data: response, error } = await supabase.functions.invoke('sync-external-db', {
      body: payload,
    });

    if (error) {
      console.error('Erro ao sincronizar com banco externo:', error);
      return;
    }

    console.log('Dados sincronizados com banco externo:', response);
  } catch (error) {
    console.error('Erro ao sincronizar com banco externo:', error);
  }
}

export async function saveQuestionario(data: QuestionnaireData): Promise<{ success: boolean; id?: string; pdfUrl?: string }> {
  try {
    // 1. Salvar dados no banco local (Lovable Cloud)
    const cpfLimpo = cleanCpf(data.cpf);
    const telefoneLimpo = cleanTelefone(data.telefone);

    const { data: result, error } = await supabase
      .from('questionarios')
      .insert({
        nome: data.nome,
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
        sexo: data.sexo,
        data_nascimento: data.dataNascimento || null,
        tipo_exame: data.tipoExame || null,
        data_exame: data.dataExame || null,
        assinatura_data: data.assinaturaData || null,
        status: getStatusInicial(data.tipoExame || null),
        respostas_completas: {
          versao: '1.0',
          tipoExame: data.tipoExame || '',
          dadosPessoais: {
            nome: data.nome,
            cpf: cpfLimpo,
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
            assinaturaData: data.assinaturaData || undefined,
          },
          metadata: {
            preenchidoEm: new Date().toISOString(),
          },
        },
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

    // 2. Gerar PDF (usa PDF específico por tipo de exame)
    let pdfBlob: Blob;
    if (data.tipoExame === 'mamografia') {
      pdfBlob = generateMamografiaPDF(data, { paciente: data.assinaturaData });
    } else if (data.tipoExame === 'densitometria') {
      pdfBlob = generateDensitometriaPDF(data, { paciente: data.assinaturaData });
    } else if (data.tipoExame === 'ressonancia') {
      pdfBlob = generateRessonanciaPDF(data, { paciente: data.assinaturaData });
    } else {
      // TC - usar função genérica por enquanto (TODO: criar função específica)
      pdfBlob = generateRessonanciaPDF(data, { paciente: data.assinaturaData });
    }

    // 3. Fazer upload do PDF para o storage
    const pdfUrl = await uploadPDF(pdfBlob, result.id);

    // 4. Atualizar o questionário com a URL do PDF
    if (pdfUrl) {
      await updateQuestionarioWithPdfUrl(result.id, pdfUrl);
    }

    // 5. Enviar dados para webhook n8n e sincronizar com banco externo em paralelo
    await Promise.all([
      sendToWebhook(data, result.id, pdfUrl),
      syncToExternalDatabase(data, result.id, pdfUrl),
    ]);

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
