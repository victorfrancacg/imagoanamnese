export interface AdminSearchFilters {
  cpf: string;
  nome: string;
  tipoExame: 'todos' | 'tomografia' | 'ressonancia' | 'mamografia' | 'densitometria';
  sexo: 'todos' | 'masculino' | 'feminino';
  dataExameInicio: string; // ISO date format (YYYY-MM-DD)
  dataExameFim: string; // ISO date format (YYYY-MM-DD)
}
