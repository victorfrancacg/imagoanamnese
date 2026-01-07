import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { SignatureCanvas } from '@/components/tecnico/SignatureCanvas';

type Questionario = Tables<'questionarios'>;

export default function QuestionnaireSignature() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assinaturaTecnico, setAssinaturaTecnico] = useState<string>('');

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

  // Mutation para finalizar
  const finalizarMutation = useMutation({
    mutationFn: async () => {
      if (!assinaturaTecnico) {
        throw new Error('Assinatura é obrigatória');
      }

      const { error } = await supabase
        .from('questionarios')
        .update({
          assinatura_tecnico: assinaturaTecnico,
          status: 'finalizado',
          data_finalizacao: new Date().toISOString(),
        })
        .eq('id', id!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionario', id] });
      toast({
        title: 'Questionário finalizado!',
        description: 'O documento foi assinado e arquivado com sucesso.',
      });
      navigate('/tecnico/questionarios');
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
    finalizarMutation.mutate();
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
            label="Assinatura do Técnico Responsável"
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
    </div>
  );
}
