import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AdminSearchFilters } from '@/types/admin-filters';

interface QuestionnaireFiltersProps {
  filters: AdminSearchFilters;
  onFiltersChange: (filters: AdminSearchFilters) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function QuestionnaireFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
}: QuestionnaireFiltersProps) {
  const hasAnyFilter = !!(
    filters.cpf ||
    filters.nome ||
    filters.tipoExame !== 'todos' ||
    filters.sexo !== 'todos' ||
    filters.dataExameInicio ||
    filters.dataExameFim
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Busca</CardTitle>
        <CardDescription>
          Use os filtros abaixo para encontrar questionários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={filters.cpf}
              onChange={(e) =>
                onFiltersChange({ ...filters, cpf: e.target.value })
              }
            />
          </div>

          {/* Filtro Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Paciente</Label>
            <Input
              id="nome"
              placeholder="Nome completo ou parcial"
              value={filters.nome}
              onChange={(e) =>
                onFiltersChange({ ...filters, nome: e.target.value })
              }
            />
          </div>

          {/* Filtro Tipo de Exame */}
          <div className="space-y-2">
            <Label htmlFor="tipoExame">Tipo de Exame</Label>
            <Select
              value={filters.tipoExame}
              onValueChange={(value: AdminSearchFilters['tipoExame']) =>
                onFiltersChange({ ...filters, tipoExame: value })
              }
            >
              <SelectTrigger id="tipoExame">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="tomografia">Tomografia</SelectItem>
                <SelectItem value="ressonancia">Ressonância</SelectItem>
                <SelectItem value="mamografia">Mamografia</SelectItem>
                <SelectItem value="densitometria">Densitometria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Sexo */}
          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={filters.sexo}
              onValueChange={(value: AdminSearchFilters['sexo']) =>
                onFiltersChange({ ...filters, sexo: value })
              }
            >
              <SelectTrigger id="sexo">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Data do Exame (De) */}
          <div className="space-y-2">
            <Label>Data do Exame (De)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.dataExameInicio && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataExameInicio ? (
                    format(new Date(filters.dataExameInicio), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.dataExameInicio
                      ? new Date(filters.dataExameInicio)
                      : undefined
                  }
                  onSelect={(date) =>
                    onFiltersChange({
                      ...filters,
                      dataExameInicio: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Data do Exame (Até) */}
          <div className="space-y-2">
            <Label>Data do Exame (Até)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.dataExameFim && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataExameFim ? (
                    format(new Date(filters.dataExameFim), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.dataExameFim
                      ? new Date(filters.dataExameFim)
                      : undefined
                  }
                  onSelect={(date) =>
                    onFiltersChange({
                      ...filters,
                      dataExameFim: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 mt-6">
          <Button onClick={onSearch} disabled={!hasAnyFilter}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {hasAnyFilter && (
            <Button onClick={onClear} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
