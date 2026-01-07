import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { QuestionnaireAnswers } from '@/components/tecnico/QuestionnaireAnswers';
import { formatCpf, formatDate } from '@/lib/utils';

type Questionario = Tables<'questionarios'>;

export default function QuestionnaireReview() {
  const { id } = useParams();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
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
        <Link to={`/tecnico/questionario/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revisão Final</h1>
          <p className="text-muted-foreground mt-1">
            Revise todas as informações antes de assinar
          </p>
        </div>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
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

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Anamnese</CardTitle>
          <CardDescription>
            Versão final do questionário com todas as modificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionnaireAnswers questionario={questionario} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-between">
        <Link to={`/tecnico/questionario/${id}`}>
          <Button variant="outline">
            Voltar para Edição
          </Button>
        </Link>
        <Link to={`/tecnico/questionario/${id}/assinatura`}>
          <Button disabled>
            Próximo: Assinar Documento
          </Button>
        </Link>
      </div>
    </div>
  );
}
