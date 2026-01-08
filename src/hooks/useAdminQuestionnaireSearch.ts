import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { cleanCpf } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import type { AdminSearchFilters } from '@/types/admin-filters';

type Questionario = Tables<'questionarios'>;

export function useAdminQuestionnaireSearch(filters: AdminSearchFilters) {
  return useQuery({
    queryKey: ['admin-questionnaires', filters],
    queryFn: async () => {
      let query = supabaseAdmin
        .from('questionarios')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro CPF (parcial, case-insensitive)
      if (filters.cpf) {
        const cpfLimpo = cleanCpf(filters.cpf);
        query = query.ilike('cpf', `%${cpfLimpo}%`);
      }

      // Filtro Nome (parcial, case-insensitive)
      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
      }

      // Filtro Tipo de Exame
      if (filters.tipoExame !== 'todos') {
        query = query.eq('tipo_exame', filters.tipoExame);
      }

      // Filtro Sexo
      if (filters.sexo !== 'todos') {
        query = query.eq('sexo', filters.sexo);
      }

      // Filtro Data do Exame (range)
      if (filters.dataExameInicio) {
        query = query.gte('data_exame', filters.dataExameInicio);
      }
      if (filters.dataExameFim) {
        query = query.lte('data_exame', filters.dataExameFim);
      }

      // Limitar a 100 resultados para performance
      query = query.limit(100);

      const { data, error } = await query;
      if (error) throw error;
      return data as Questionario[];
    },
    // Só executar se pelo menos um filtro estiver preenchido
    enabled: !!(
      filters.cpf ||
      filters.nome ||
      filters.tipoExame !== 'todos' ||
      filters.sexo !== 'todos' ||
      filters.dataExameInicio ||
      filters.dataExameFim
    ),
  });
}
