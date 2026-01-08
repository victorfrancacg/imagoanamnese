import { useState } from 'react';
import { QuestionnaireFilters } from './QuestionnaireFilters';
import { QuestionnaireResultsTable } from './QuestionnaireResultsTable';
import { ViewQuestionnaireDialog } from './ViewQuestionnaireDialog';
import { useAdminQuestionnaireSearch } from '@/hooks/useAdminQuestionnaireSearch';
import type { AdminSearchFilters } from '@/types/admin-filters';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;

export function QuestionnaireSearchTab() {
  const [filters, setFilters] = useState<AdminSearchFilters>({
    cpf: '',
    nome: '',
    tipoExame: 'todos',
    sexo: 'todos',
    dataExameInicio: '',
    dataExameFim: '',
  });

  const [activeFilters, setActiveFilters] = useState<AdminSearchFilters>(filters);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionario | null>(null);

  const { data: questionarios, isLoading, error } = useAdminQuestionnaireSearch(activeFilters);

  const handleSearch = () => {
    setActiveFilters({ ...filters });
  };

  const handleClear = () => {
    const clearedFilters: AdminSearchFilters = {
      cpf: '',
      nome: '',
      tipoExame: 'todos',
      sexo: 'todos',
      dataExameInicio: '',
      dataExameFim: '',
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
  };

  const handleViewDetails = (questionario: Questionario) => {
    setSelectedQuestionnaire(questionario);
  };

  return (
    <div className="space-y-6">
      <QuestionnaireFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <QuestionnaireResultsTable
        questionarios={questionarios}
        isLoading={isLoading}
        error={error}
        onViewDetails={handleViewDetails}
      />

      <ViewQuestionnaireDialog
        questionario={selectedQuestionnaire}
        open={!!selectedQuestionnaire}
        onOpenChange={(open) => !open && setSelectedQuestionnaire(null)}
      />
    </div>
  );
}
