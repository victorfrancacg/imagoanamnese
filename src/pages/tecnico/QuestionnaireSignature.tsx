import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, Radio, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';
import type { Tables } from '@/integrations/supabase/types';
import { SignatureCanvas } from '@/components/tecnico/SignatureCanvas';
import { generateFinalMamografiaPDF, generateFinalDensitometriaPDF, generateFinalRessonanciaPDF, generateFinalTomografiaPDF } from '@/lib/pdf';
import { QuestionnaireData } from '@/types/questionnaire';

type Questionario = Tables<'questionarios'>;

// Chave para sessionStorage (deve ser igual à usada em MamografiaDesenho)
const getStorageKey = (questionarioId: string) => `desenho_mamas_${questionarioId}`;

// Função para converter dados do banco para QuestionnaireData
function convertToQuestionnaireData(questionario: Questionario): QuestionnaireData {
  const respostas = questionario.respostas_completas;

  return {
    // Dados pessoais
    nome: respostas.dadosPessoais.nome,
    cpf: respostas.dadosPessoais.cpf,
    telefone: respostas.dadosPessoais.telefone,
    dataNascimento: respostas.dadosPessoais.dataNascimento,
    sexo: respostas.dadosPessoais.sexo,
    peso: respostas.dadosPessoais.peso,
    altura: respostas.dadosPessoais.altura,
    tipoExame: respostas.tipoExame as any,
    dataExame: respostas.dadosPessoais.dataExame,

    // Consentimento
    aceitaRiscos: respostas.consentimento.aceitaRiscos,
    aceitaCompartilhamento: respostas.consentimento.aceitaCompartilhamento,
    assinaturaData: questionario.assinatura_data || respostas.consentimento.assinaturaData,

    // Segurança
    ...respostas.seguranca,

    // Clínicas
    ...respostas.clinicas,
  } as QuestionnaireData;
}

// Função para fazer upload do PDF final
async function uploadFinalPDF(pdfBlob: Blob, questionarioId: string): Promise<string | null> {
  try {
    const fileName = `questionario_final_${questionarioId}_${Date.now()}.pdf`;

    const { data, error } = await supabase.storage
      .from('questionarios-pdfs')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Erro ao fazer upload do PDF final:', error);
      return null;
    }

    // Obter URL pública do PDF
    const { data: publicUrlData } = supabase.storage
      .from('questionarios-pdfs')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload do PDF final:', error);
    return null;
  }
}

export default function QuestionnaireSignature() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [assinaturaTecnico, setAssinaturaTecnico] = useState<string>('');
  const [showTelecomandoDialog, setShowTelecomandoDialog] = useState(false);
  const [telecomandoChoice, setTelecomandoChoice] = useState<boolean | null>(null);
  const [finalizationResult, setFinalizationResult] = useState<{ status: string; pdfUrl: string | null } | null>(null);
  const [desenhoMamas, setDesenhoMamas] = useState<string | null>(null);

  // Buscar desenho do sessionStorage (para mamografia)
  useEffect(() => {
    if (id) {
      const savedDrawing = sessionStorage.getItem(getStorageKey(id));
      setDesenhoMamas(savedDrawing);
    }
  }, [id]);

  // Buscar dados do questionário
  const { data: questionario, isLoading, error } = useQuery({
    queryKey: ['questionario', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data as Questionario;
    },
    enabled: !!id,
  });

  // Verifica se precisa mostrar dialog de telecomando
  const needsTelecomandoQuestion = () => {
    if (!questionario) return false;
    const tipoExame = questionario.tipo_exame;
    const statusAtual = questionario.status;
    // Só pergunta sobre telecomando para RM/TC no status aguardando_assistente
    return (tipoExame === 'ressonancia' || tipoExame === 'tomografia')
           && statusAtual === 'aguardando_assistente';
  };

  // Mutation para finalizar
  const finalizarMutation = useMutation({
    mutationFn: async (isTelecomando?: boolean) => {
      if (!assinaturaTecnico) {
        throw new Error('Assinatura é obrigatória');
      }

      if (!questionario) {
        throw new Error('Questionário não encontrado');
      }

      const tipoExame = questionario.tipo_exame;
      const statusAtual = questionario.status;
      const isAssistente = statusAtual === 'aguardando_assistente';
      const isOperador = statusAtual === 'aguardando_operador';

      // Determinar próximo status
      let novoStatus: string;

      if (isAssistente) {
        // Assistente assinando (RM/TC): depende do telecomando
        if (isTelecomando === true) {
          novoStatus = 'finalizado';
        } else {
          novoStatus = 'aguardando_operador';
        }
      } else {
        // Operador assinando: sempre finaliza
        novoStatus = 'finalizado';
      }

      // Preparar dados para atualização no banco
      const updateData: Record<string, unknown> = {
        status: novoStatus,
      };

      // Salvar assinatura no campo correto
      if (isAssistente) {
        updateData.assinatura_assistente = assinaturaTecnico;
        updateData.nome_assistente = profile?.nome;
        updateData.registro_assistente = profile?.professional_id || null;
      } else {
        updateData.assinatura_operador = assinaturaTecnico;
        updateData.nome_operador = profile?.nome;
        updateData.registro_operador = profile?.professional_id || null;
      }

      // Gerar PDF apenas quando finalizar
      let finalPdfUrl: string | null = null;

      if (novoStatus === 'finalizado') {
        const questionnaireData = convertToQuestionnaireData(questionario);

        // Montar objeto de assinaturas para o PDF
        const assinaturas: {
          paciente?: string;
          assistente?: string;
          nomeAssistente?: string;
          registroAssistente?: string;
          operador?: string;
          nomeOperador?: string;
          registroOperador?: string;
        } = {
          paciente: questionnaireData.assinaturaData,
        };

        if (isAssistente) {
          // Assistente finalizando com telecomando (só ele assina)
          assinaturas.assistente = assinaturaTecnico;
          assinaturas.nomeAssistente = profile?.nome;
          assinaturas.registroAssistente = profile?.professional_id || undefined;
        } else if (isOperador) {
          // Operador finalizando
          assinaturas.operador = assinaturaTecnico;
          assinaturas.nomeOperador = profile?.nome;
          assinaturas.registroOperador = profile?.professional_id || undefined;

          // Para RM/TC, buscar dados do assistente que já assinou
          if (tipoExame === 'ressonancia' || tipoExame === 'tomografia') {
            assinaturas.assistente = questionario.assinatura_assistente || undefined;
            assinaturas.nomeAssistente = questionario.nome_assistente || undefined;
            assinaturas.registroAssistente = questionario.registro_assistente || undefined;
          }
        }

        // Gerar PDF específico por tipo de exame
        let pdfBlob: Blob;
        if (tipoExame === 'mamografia') {
          // Adicionar desenho das mamas às assinaturas se existir (do sessionStorage)
          if (desenhoMamas) {
            assinaturas.desenhoMamas = desenhoMamas;
          }
          pdfBlob = generateFinalMamografiaPDF(questionnaireData, assinaturas);
        } else if (tipoExame === 'densitometria') {
          pdfBlob = generateFinalDensitometriaPDF(questionnaireData, assinaturas);
        } else if (tipoExame === 'ressonancia') {
          pdfBlob = generateFinalRessonanciaPDF(questionnaireData, assinaturas);
        } else if (tipoExame === 'tomografia') {
          pdfBlob = generateFinalTomografiaPDF(questionnaireData, assinaturas);
        } else {
          // Fallback para tipos não reconhecidos
          pdfBlob = generateFinalTomografiaPDF(questionnaireData, assinaturas);
        }

        // Fazer upload do PDF final
        finalPdfUrl = await uploadFinalPDF(pdfBlob, id!);

        updateData.data_finalizacao = new Date().toISOString();
        updateData.final_pdf_url = finalPdfUrl;
      }

      // Atualizar questionário no banco
      const { error } = await supabase
        .from('questionarios')
        .update(updateData)
        .eq('id', id!);

      if (error) throw error;

      return { status: novoStatus, pdfUrl: finalPdfUrl };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['questionario', id] });

      // Limpar desenho do sessionStorage após finalização
      if (id) {
        sessionStorage.removeItem(getStorageKey(id));
      }

      if (result.status === 'finalizado') {
        // Mostrar tela de sucesso com botão de download
        setFinalizationResult(result);
      } else {
        // Enviado para operador - navegar diretamente
        toast({
          title: 'Enviado para Operador',
          description: 'O questionário foi enviado para revisão do operador.',
        });
        navigate('/tecnico/questionarios');
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao finalizar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    // Se precisa da pergunta de telecomando, mostra o dialog
    if (needsTelecomandoQuestion()) {
      setShowTelecomandoDialog(true);
      return;
    }
    // Caso contrário, finaliza diretamente
    finalizarMutation.mutate();
  };

  const handleTelecomandoChoice = (isTelecomando: boolean) => {
    setTelecomandoChoice(isTelecomando);
    setShowTelecomandoDialog(false);
    finalizarMutation.mutate(isTelecomando);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !questionario) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium mb-2">Erro ao carregar questionário</p>
              <Link to="/tecnico/questionarios">
                <Button>Voltar para Lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de sucesso após finalização
  if (finalizationResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Revisão Finalizada!</h2>
              <p className="text-muted-foreground mb-8">
                O questionário foi assinado e arquivado com sucesso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {finalizationResult.pdfUrl && (
                  <Button
                    onClick={() => window.open(finalizationResult.pdfUrl!, '_blank')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/tecnico/questionarios')}
                >
                  Voltar para Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/tecnico/questionario/${id}/revisao`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinatura Digital</h1>
          <p className="text-muted-foreground mt-1">
            Assine o documento para finalizar o processo
          </p>
        </div>
      </div>

      {/* Signature Card */}
      <Card>
        <CardHeader>
          <CardTitle>Área de Assinatura</CardTitle>
          <CardDescription>
            Desenhe sua assinatura no campo abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignatureCanvas
            value={assinaturaTecnico}
            onChange={setAssinaturaTecnico}
            label={questionario.status === 'aguardando_operador'
              ? 'Assinatura do Operador Responsável'
              : 'Assinatura do Assistente Responsável'}
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Confirmation Card */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">Confirmação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 dark:text-amber-200">
          <p>
            Ao assinar este documento, você confirma que:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Revisou todas as informações do questionário</li>
            <li>As respostas estão corretas e completas</li>
            <li>O documento está pronto para ser arquivado</li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-between">
        <Link to={`/tecnico/questionario/${id}/revisao`}>
          <Button variant="outline">
            Voltar
          </Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={!assinaturaTecnico || finalizarMutation.isPending}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {finalizarMutation.isPending ? 'Finalizando...' : 'Assinar e Finalizar'}
        </Button>
      </div>

      {/* Dialog de Telecomando */}
      <Dialog open={showTelecomandoDialog} onOpenChange={setShowTelecomandoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Exame com Telecomando?
            </DialogTitle>
            <DialogDescription>
              Este exame de {questionario?.tipo_exame === 'ressonancia' ? 'Ressonância Magnética' : 'Tomografia Computadorizada'} será realizado com telecomando?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleTelecomandoChoice(false)}
              disabled={finalizarMutation.isPending}
            >
              <div className="text-left">
                <p className="font-medium">Não, enviar para Operador</p>
                <p className="text-sm text-muted-foreground">O questionário será enviado para revisão do operador</p>
              </div>
            </Button>
            <Button
              className="w-full justify-start h-auto py-4"
              onClick={() => handleTelecomandoChoice(true)}
              disabled={finalizarMutation.isPending}
            >
              <div className="text-left">
                <p className="font-medium">Sim, finalizar agora</p>
                <p className="text-sm text-muted-foreground">O questionário será finalizado sem passar pelo operador</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
