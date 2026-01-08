import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';
import { useToast } from '@/hooks/use-toast';
import { formatCpf, formatDate } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { QuestionnaireAnswers } from '@/components/tecnico/QuestionnaireAnswers';
import { EditQuestionnaireDialog } from '@/components/tecnico/EditQuestionnaireDialog';

type Questionario = Tables<'questionarios'>;
type StatusQuestionario = 'aguardando_revisao' | 'finalizado' | 'cancelado';

export default function QuestionnaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  // Proteção de rota - bloqueia apenas finalizados e cancelados
  useEffect(() => {
    if (!questionario) return;

    const status = questionario.status as StatusQuestionario;

    if (status === 'finalizado') {
      toast({
        title: 'Acesso negado',
        description: 'Este questionário já foi finalizado e não pode ser editado.',
        variant: 'destructive',
      });
      navigate('/tecnico/questionarios');
    } else if (status === 'cancelado') {
      toast({
        title: 'Acesso negado',
        description: 'Este questionário foi cancelado e não pode ser acessado.',
        variant: 'destructive',
      });
      navigate('/tecnico/questionarios');
    }
  }, [questionario, navigate, toast]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<StatusQuestionario, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      aguardando_revisao: { variant: 'default', label: 'Aguardando Revisão' },
      finalizado: { variant: 'secondary', label: 'Finalizado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
    };

    const statusInfo = statusMap[status as StatusQuestionario] || { variant: 'default', label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Questionário não encontrado'}
              </p>
              <Link to="/tecnico/questionarios">
                <Button>Voltar para Lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tecnico/questionarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes do Questionário</h1>
          <p className="text-muted-foreground mt-1">
            Revisando questionário de {questionario.nome}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        {getStatusBadge(questionario.status)}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Respostas
        </Button>
        <Button
          variant="outline"
          disabled={!questionario?.pdf_url}
          onClick={() => questionario?.pdf_url && window.open(questionario.pdf_url, '_blank')}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver PDF
        </Button>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
          <CardDescription>
            Informações pessoais coletadas no questionário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base">{questionario.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p className="text-base">{formatCpf(questionario.cpf)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-base">{formatDate(questionario.data_nascimento) || '--'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sexo</p>
              <p className="text-base">
                {questionario.respostas_completas?.dadosPessoais?.sexo || '--'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peso</p>
              <p className="text-base">
                {questionario.respostas_completas?.dadosPessoais?.peso
                  ? `${questionario.respostas_completas.dadosPessoais.peso} kg`
                  : '--'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Altura</p>
              <p className="text-base">
                {questionario.respostas_completas?.dadosPessoais?.altura
                  ? `${questionario.respostas_completas.dadosPessoais.altura} cm`
                  : '--'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Exame</p>
              <p className="text-base capitalize">{questionario.tipo_exame || '--'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data do Exame</p>
              <p className="text-base">{formatDate(questionario.data_exame) || '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Data */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas do Questionário</CardTitle>
          <CardDescription>
            Todas as respostas fornecidas pelo paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionnaireAnswers questionario={questionario} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Link to={`/tecnico/questionario/${id}/revisao`}>
          <Button disabled>
            Próximo: Revisar e Assinar
          </Button>
        </Link>
      </div>

      {/* Edit Dialog */}
      <EditQuestionnaireDialog
        questionario={questionario}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
