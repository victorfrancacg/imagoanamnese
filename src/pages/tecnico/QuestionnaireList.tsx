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
import { Search, FileText, Loader2, Eye, X, Lock, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';
import { useToast } from '@/hooks/use-toast';
import { formatCpf, formatDateTime, cn } from '@/lib/utils';
import { getTipoExameBadge, getStatusBadge } from '@/lib/badge-helpers';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;
type StatusQuestionario = 'aguardando_assistente' | 'aguardando_operador' | 'finalizado' | 'cancelado';
type TipoExame = 'tomografia' | 'ressonancia' | 'densitometria' | 'mamografia';
type PeriodoFiltro = 'todos' | 'hoje' | 'esta_semana' | 'este_mes' | 'personalizado';

export default function QuestionnaireList() {
  const [searchNome, setSearchNome] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusQuestionario | 'todos'>('todos');
  const [tipoExameFilter, setTipoExameFilter] = useState<TipoExame | 'todos'>('todos');
  const [periodoFilter, setPeriodoFilter] = useState<PeriodoFiltro>('todos');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para calcular o range de datas baseado no período selecionado
  const getDateRange = (periodo: PeriodoFiltro): { inicio: string; fim: string } | null => {
    const hoje = new Date();
    switch (periodo) {
      case 'hoje':
        return {
          inicio: startOfDay(hoje).toISOString(),
          fim: endOfDay(hoje).toISOString(),
        };
      case 'esta_semana':
        return {
          inicio: startOfWeek(hoje, { locale: ptBR }).toISOString(),
          fim: endOfDay(hoje).toISOString(),
        };
      case 'este_mes':
        return {
          inicio: startOfMonth(hoje).toISOString(),
          fim: endOfDay(hoje).toISOString(),
        };
      case 'personalizado':
        if (dataInicio || dataFim) {
          return {
            inicio: dataInicio ? startOfDay(new Date(dataInicio)).toISOString() : '',
            fim: dataFim ? endOfDay(new Date(dataFim)).toISOString() : '',
          };
        }
        return null;
      default:
        return null;
    }
  };

  // Verifica se há algum critério de busca ativo
  const hasSearchCriteria = searchNome.trim() || statusFilter !== 'todos' || tipoExameFilter !== 'todos' || periodoFilter !== 'todos';

  // Query para carregar automaticamente questionários pendentes (aguardando_assistente e aguardando_operador)
  const { data: questionariosPendentes, isFetching: isFetchingPendentes, error: errorPendentes } = useQuery({
    queryKey: ['questionarios-pendentes'],
    queryFn: async ({ signal }) => {
      console.log('[QuestionnaireList] Loading pending questionnaires...');
      const queryStartTime = Date.now();

      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .in('status', ['aguardando_assistente', 'aguardando_operador'])
        .order('created_at', { ascending: false })
        .limit(50)
        .abortSignal(signal);

      console.log('[QuestionnaireList] Pending query completed in:', Date.now() - queryStartTime, 'ms');
      console.log('[QuestionnaireList] Pending results:', { count: data?.length, error });

      if (error) throw error;
      return data as Questionario[];
    },
    staleTime: 15000,
    retry: 1,
    retryDelay: 1000,
  });

  // Query para buscar questionários com filtros (disparo manual via refetch)
  const { data: questionariosBusca, isFetching: isFetchingBusca, error: errorBusca, refetch } = useQuery({
    queryKey: ['questionarios-busca', searchNome, statusFilter, tipoExameFilter, periodoFilter, dataInicio, dataFim],
    queryFn: async ({ signal }) => {
      console.log('[QuestionnaireList] Starting search - Nome:', searchNome, 'Status:', statusFilter, 'Tipo Exame:', tipoExameFilter, 'Período:', periodoFilter);

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

        // Aplicar filtro de tipo de exame se não for "todos"
        if (tipoExameFilter !== 'todos') {
          console.log('[QuestionnaireList] Filtering by Tipo Exame:', tipoExameFilter);
          query = query.eq('tipo_exame', tipoExameFilter);
        }

        // Aplicar filtro de período/data
        const dateRange = getDateRange(periodoFilter);
        if (dateRange) {
          if (dateRange.inicio) {
            console.log('[QuestionnaireList] Filtering by Data Início:', dateRange.inicio);
            query = query.gte('created_at', dateRange.inicio);
          }
          if (dateRange.fim) {
            console.log('[QuestionnaireList] Filtering by Data Fim:', dateRange.fim);
            query = query.lte('created_at', dateRange.fim);
          }
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

  // Determina quais dados exibir e qual estado de loading usar
  const questionarios = hasSearched ? questionariosBusca : questionariosPendentes;
  const isFetching = hasSearched ? isFetchingBusca : isFetchingPendentes;
  const error = hasSearched ? errorBusca : errorPendentes;

  const handleSearch = () => {
    if (!hasSearchCriteria) {
      toast({
        title: 'Nenhum critério de busca',
        description: 'Por favor, preencha ao menos um campo (nome, tipo de exame, status ou período).',
        variant: 'destructive',
      });
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleClearSearch = () => {
    setSearchNome('');
    setStatusFilter('todos');
    setTipoExameFilter('todos');
    setPeriodoFilter('todos');
    setDataInicio('');
    setDataFim('');
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
            Pesquise por nome do paciente ou filtre por tipo de exame, status e período
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label>Tipo de Exame</Label>
              <Select
                value={tipoExameFilter}
                onValueChange={(value) => setTipoExameFilter(value as TipoExame | 'todos')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por exame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os exames</SelectItem>
                  <SelectItem value="tomografia">Tomografia (TC)</SelectItem>
                  <SelectItem value="ressonancia">Ressonância (RM)</SelectItem>
                  <SelectItem value="densitometria">Densitometria</SelectItem>
                  <SelectItem value="mamografia">Mamografia</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Segunda linha - Filtro de período */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={periodoFilter}
                onValueChange={(value) => {
                  setPeriodoFilter(value as PeriodoFiltro);
                  // Limpa as datas personalizadas quando muda de "personalizado" para outro
                  if (value !== 'personalizado') {
                    setDataInicio('');
                    setDataFim('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os períodos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="esta_semana">Esta semana</SelectItem>
                  <SelectItem value="este_mes">Este mês</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos de data - só aparecem quando "personalizado" está selecionado */}
            {periodoFilter === 'personalizado' && (
              <>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dataInicio && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? (
                          format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataInicio ? new Date(dataInicio) : undefined}
                        onSelect={(date) => setDataInicio(date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dataFim && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFim ? (
                          format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataFim ? new Date(dataFim) : undefined}
                        onSelect={(date) => setDataFim(date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
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
          <CardTitle>{hasSearched ? 'Resultados da Busca' : 'Questionários Pendentes'}</CardTitle>
          {questionarios && questionarios.length > 0 && (
            <CardDescription>
              {questionarios.length} questionário(s) {hasSearched ? 'encontrado(s)' : 'aguardando revisão'}
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

          {/* Empty State - No results */}
          {!isFetching && questionarios?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {hasSearched ? 'Nenhum questionário encontrado' : 'Nenhum questionário pendente'}
              </p>
              <p className="text-sm">
                {hasSearched
                  ? 'Não foram encontrados questionários com os critérios informados.'
                  : 'Não há questionários aguardando revisão no momento.'}
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
