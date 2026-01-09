import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, UserCheck, Clock } from 'lucide-react';
import { Profile } from '@/contexts/AdminAuthContext';
import { formatCpf } from '@/lib/utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function PendingTechnicians() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar técnicos pendentes
  const { data: pendingTechnicians, isLoading } = useQuery({
    queryKey: ['pending-technicians'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_type', 'tecnico')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Mutation para aprovar técnico
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      // Obter o token do admin logado
      const { data: { session } } = await supabaseAdmin.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Sessão de administrador não encontrada.');
      }

      // Chamar Edge Function que usa service_role key
      const response = await fetch(`${SUPABASE_URL}/functions/v1/approve-technician`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ technicianId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao aprovar técnico.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-technicians'] });
      toast({
        title: 'Técnico aprovado!',
        description: 'O técnico já pode acessar o sistema.',
      });
    },
    onError: (error) => {
      console.error('Erro na aprovação:', error);
      toast({
        title: 'Erro ao aprovar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para recusar técnico
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      // Obter o token do admin logado
      const { data: { session } } = await supabaseAdmin.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Sessão de administrador não encontrada.');
      }

      // Chamar Edge Function que usa service_role key
      const response = await fetch(`${SUPABASE_URL}/functions/v1/reject-technician`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ technicianId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao recusar técnico.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-technicians'] });
      toast({
        title: 'Técnico recusado',
        description: 'O cadastro foi removido do sistema.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao recusar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando cadastros pendentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Técnicos Pendentes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as solicitações de cadastro de novos técnicos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cadastros Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTechnicians?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando sua aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTechnicians?.length === 0 ? 'Nenhum' : 'Pendente'}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingTechnicians?.length === 0
                ? 'Todos os cadastros foram processados'
                : 'Há cadastros aguardando aprovação'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de técnicos pendentes */}
      {pendingTechnicians && pendingTechnicians.length > 0 ? (
        <div className="grid gap-4">
          {pendingTechnicians.map((technician) => (
            <Card key={technician.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{technician.nome}</CardTitle>
                    <CardDescription>
                      Solicitação em {new Date(technician.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF</p>
                    <p className="text-sm">{formatCpf(technician.cpf || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">COREN/CRM</p>
                    <p className="text-sm">{technician.professional_id || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                    <p className="text-sm capitalize">{technician.user_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
                    <p className="text-sm font-mono text-xs">{technician.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => approveMutation.mutate(technician.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(technician.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum cadastro pendente</h3>
              <p className="text-sm text-muted-foreground">
                Todos os cadastros de técnicos foram processados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
