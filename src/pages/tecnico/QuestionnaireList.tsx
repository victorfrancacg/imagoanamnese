import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, FileText, Loader2, Eye, X, Lock } from 'lucide-react';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';
import { useToast } from '@/hooks/use-toast';
import { formatCpf, cleanCpf, formatDateTime } from '@/lib/utils';
import { getTipoExameBadge, getStatusBadge } from '@/lib/badge-helpers';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;
type StatusQuestionario = 'aguardando_assistente' | 'aguardando_operador' | 'finalizado' | 'cancelado';

export default function QuestionnaireList() {
  const [searchCpf, setSearchCpf] = useState('');
  const [searchNome, setSearchNome] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusQuestionario | 'todos'>('todos');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verifica se há algum critério de busca ativo
  const hasSearchCriteria = searchCpf.trim() || searchNome.trim() || statusFilter !== 'todos';

  // Query para buscar questionários (disparo manual via refetch)
  const { data: questionarios, isFetching, error, refetch } = useQuery({
    queryKey: ['questionarios', searchCpf, searchNome, statusFilter],
    queryFn: async ({ signal }) => {
      console.log('[QuestionnaireList] Starting search - CPF:', searchCpf, 'Nome:', searchNome, 'Status:', statusFilter);

      const queryStartTime = Date.now();
      console.log('[QuestionnaireList] Executing Supabase query...');

      // Timeout de 30 segundos
      const timeoutId = setTimeout(() => {
        console.log('[QuestionnaireList] Query timeout reached (30s)');
      }, 30000);

      try {
        let query = supabase
          .from('questionarios')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
          .abortSignal(signal); // Permite cancelar a query se o componente desmontar

        // Aplicar filtro de CPF se preenchido
        if (searchCpf.trim()) {
          const cpfLimpo = cleanCpf(searchCpf);
          console.log('[QuestionnaireList] Filtering by CPF:', cpfLimpo);
          query = query.ilike('cpf', `%${cpfLimpo}%`);
        }

        // Aplicar filtro de nome se preenchido
        if (searchNome.trim()) {
          console.log('[QuestionnaireList] Filtering by Nome:', searchNome);
          query = query.ilike('nome', `%${searchNome.trim()}%`);
        }

        // Aplicar filtro de status se não for "todos"
        if (statusFilter !== 'todos') {
          console.log('[QuestionnaireList] Filtering by Status:', statusFilter);
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        console.log('[QuestionnaireList] Query completed in:', Date.now() - queryStartTime, 'ms');
        console.log('[QuestionnaireList] Results:', { count: data?.length, error });

        if (error) throw error;
        return data as Questionario[];
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: false, // Não roda automaticamente, apenas via refetch()
    staleTime: 15000, // Cache de 15 segundos
    retry: 1, // Tentar novamente 1 vez em caso de falha
    retryDelay: 1000, // Esperar 1 segundo antes de tentar novamente
  });

  const handleSearch = () => {
    if (!hasSearchCriteria) {
      toast({
        title: 'Nenhum critério de busca',
        description: 'Por favor, preencha ao menos um campo (CPF, nome ou status).',
        variant: 'destructive',
      });
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleClearSearch = () => {
    setSearchCpf('');
    setSearchNome('');
    setStatusFilter('todos');
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewDetails = (questionario: Questionario) => {
    const status = questionario.status as StatusQuestionario;

    // Verifica se o questionário está bloqueado
    if (status === 'finalizado') {
      toast({
        title: 'Questionário finalizado',
        description: 'Este questionário já foi finalizado e não pode ser editado.',
        variant: 'destructive',
      });
      return;
    }

    if (status === 'cancelado') {
      toast({
        title: 'Questionário cancelado',
        description: 'Este questionário foi cancelado e não pode ser acessado.',
        variant: 'destructive',
      });
      return;
    }

    // Navega diretamente para a página de detalhes (sem mudar status)
    navigate(`/tecnico/questionario/${questionario.id}`);
  };

  const isQuestionarioBlocked = (status: string): boolean => {
    return ['finalizado', 'cancelado'].includes(status);
  };

  const getButtonTooltip = (status: string): string => {
    const tooltips: Record<StatusQuestionario, string> = {
      aguardando_assistente: 'Clique para revisar (Assistente)',
      aguardando_operador: 'Clique para revisar (Operador)',
      finalizado: 'Este questionário já foi finalizado',
      cancelado: 'Este questionário foi cancelado',
    };

    return tooltips[status as StatusQuestionario] || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Questionários</h1>
        <p className="text-muted-foreground mt-2">
          Lista de todos os questionários preenchidos pelos pacientes
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Questionários</CardTitle>
          <CardDescription>
            Pesquise por CPF, nome do paciente ou filtre por status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="searchCpf">CPF do Paciente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchCpf"
                  placeholder="Ex: 12345678900"
                  className="pl-10"
                  value={searchCpf}
                  onChange={(e) => setSearchCpf(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchNome">Nome do Paciente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchNome"
                  placeholder="Ex: João Silva"
                  className="pl-10"
                  value={searchNome}
                  onChange={(e) => setSearchNome(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusQuestionario | 'todos')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="aguardando_assistente">Aguardando Assistente</SelectItem>
                  <SelectItem value="aguardando_operador">Aguardando Operador</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
            {hasSearched && (
              <Button onClick={handleClearSearch} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          {questionarios && questionarios.length > 0 && (
            <CardDescription>
              {questionarios.length} questionário(s) encontrado(s)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isFetching && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Buscando questionários...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isFetching && (
            <div className="text-center py-12 text-destructive">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Erro ao buscar questionários</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
              </p>
            </div>
          )}

          {/* Empty State - No search yet */}
          {!hasSearched && !isFetching && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma busca realizada</p>
              <p className="text-sm">
                Preencha ao menos um dos campos acima (CPF, nome ou status) e clique em "Buscar".
              </p>
            </div>
          )}

          {/* Empty State - No results */}
          {hasSearched && !isFetching && questionarios?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum questionário encontrado</p>
              <p className="text-sm">
                Não foram encontrados questionários com os critérios informados.
              </p>
            </div>
          )}

          {/* Results Table */}
          {questionarios && questionarios.length > 0 && !isFetching && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Tipo de Exame</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionarios.map((questionario) => {
                    const isBlocked = isQuestionarioBlocked(questionario.status);
                    const tooltip = getButtonTooltip(questionario.status);

                    return (
                      <TableRow key={questionario.id} className={isBlocked ? 'opacity-70' : ''}>
                        <TableCell className="font-medium">
                          {questionario.nome}
                        </TableCell>
                        <TableCell>
                          {formatCpf(questionario.cpf)}
                        </TableCell>
                        <TableCell>
                          {getTipoExameBadge(questionario.tipo_exame)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(questionario.status)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(questionario.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isBlocked ? 'outline' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewDetails(questionario)}
                            disabled={isBlocked}
                            title={tooltip}
                          >
                            {isBlocked ? (
                              <Lock className="mr-2 h-4 w-4" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            {isBlocked ? 'Bloqueado' : 'Ver Detalhes'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
