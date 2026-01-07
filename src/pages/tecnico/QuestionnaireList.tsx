import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Loader2, Eye, X, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCpf, cleanCpf, formatDateTime } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;
type StatusQuestionario = 'aguardando_revisao' | 'finalizado' | 'cancelado';

export default function QuestionnaireList() {
  const [searchCpf, setSearchCpf] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Query para buscar questionários
  const { data: questionarios, isLoading, error } = useQuery({
    queryKey: ['questionarios', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const cpfLimpo = cleanCpf(searchTerm);

      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .ilike('cpf', `%${cpfLimpo}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Questionario[];
    },
    enabled: !!searchTerm,
  });

  const handleSearch = () => {
    if (!searchCpf.trim()) {
      toast({
        title: 'Campo vazio',
        description: 'Por favor, digite um CPF para buscar.',
        variant: 'destructive',
      });
      return;
    }
    setSearchTerm(searchCpf);
  };

  const handleClearSearch = () => {
    setSearchCpf('');
    setSearchTerm('');
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

  const getTipoExameBadge = (tipo: string | null) => {
    if (!tipo) return <Badge variant="outline">Não especificado</Badge>;

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      tomografia: 'default',
      ressonancia: 'secondary',
      densitometria: 'outline',
      mamografia: 'destructive',
    };

    const labels: Record<string, string> = {
      tomografia: 'Tomografia',
      ressonancia: 'Ressonância',
      densitometria: 'Densitometria',
      mamografia: 'Mamografia',
    };

    return (
      <Badge variant={variants[tipo] || 'outline'}>
        {labels[tipo] || tipo}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<StatusQuestionario, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      aguardando_revisao: { variant: 'outline', label: 'Aguardando Revisão' },
      finalizado: { variant: 'secondary', label: 'Finalizado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
    };

    const statusInfo = statusMap[status as StatusQuestionario] || { variant: 'outline', label: status };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const isQuestionarioBlocked = (status: string): boolean => {
    return ['finalizado', 'cancelado'].includes(status);
  };

  const getButtonTooltip = (status: string): string => {
    const tooltips: Record<StatusQuestionario, string> = {
      aguardando_revisao: 'Clique para revisar',
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
            Digite o CPF do paciente (completo ou parcial)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o CPF (ex: 12345678900 ou 123.456.789-00)"
                className="pl-10"
                value={searchCpf}
                onChange={(e) => setSearchCpf(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
            {searchTerm && (
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
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Buscando questionários...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-destructive">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Erro ao buscar questionários</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
              </p>
            </div>
          )}

          {/* Empty State - No search yet */}
          {!searchTerm && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma busca realizada</p>
              <p className="text-sm">
                Digite um CPF no campo acima e clique em "Buscar" para encontrar questionários.
              </p>
            </div>
          )}

          {/* Empty State - No results */}
          {searchTerm && !isLoading && questionarios?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum questionário encontrado</p>
              <p className="text-sm">
                Não foram encontrados questionários para o CPF "{searchCpf}".
              </p>
            </div>
          )}

          {/* Results Table */}
          {questionarios && questionarios.length > 0 && !isLoading && (
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
