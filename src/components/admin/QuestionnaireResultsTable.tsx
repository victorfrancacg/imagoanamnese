import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, Loader2 } from 'lucide-react';
import { formatCpf, formatDate, formatDateTime } from '@/lib/utils';
import { getTipoExameBadge, getStatusBadge, getSexoBadge } from '@/lib/badge-helpers';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;

interface QuestionnaireResultsTableProps {
  questionarios: Questionario[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onViewDetails: (questionario: Questionario) => void;
}

export function QuestionnaireResultsTable({
  questionarios,
  isLoading,
  error,
  onViewDetails,
}: QuestionnaireResultsTableProps) {
  return (
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

        {/* Empty State - No filters */}
        {!questionarios && !isLoading && !error && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Use os filtros acima</p>
            <p className="text-sm">
              Preencha pelo menos um filtro para buscar questionários.
            </p>
          </div>
        )}

        {/* Empty State - No results */}
        {questionarios && questionarios.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum questionário encontrado</p>
            <p className="text-sm">
              Não foram encontrados questionários com os filtros aplicados.
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
                  <TableHead>Sexo</TableHead>
                  <TableHead>Data do Exame</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionarios.map((questionario) => (
                  <TableRow key={questionario.id}>
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
                      {getSexoBadge(questionario.sexo)}
                    </TableCell>
                    <TableCell>
                      {questionario.data_exame
                        ? formatDate(questionario.data_exame)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(questionario.status)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(questionario.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(questionario)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
