export interface AdminSearchFilters {
  cpf: string;
  nome: string;
  tipoExame: 'todos' | 'tomografia' | 'ressonancia' | 'mamografia' | 'densitometria';
  sexo: 'todos' | 'masculino' | 'feminino';
  status: 'todos' | 'aguardando_assistente' | 'aguardando_operador' | 'finalizado' | 'cancelado';
  dataExameInicio: string; // ISO date format (YYYY-MM-DD)
  dataExameFim: string; // ISO date format (YYYY-MM-DD)
}
