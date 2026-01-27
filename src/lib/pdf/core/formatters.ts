// Tipo para respostas ternárias (Sim/Não/Não sei)
export type TernaryValue = boolean | 'nao_sei' | null;

// Formata valor booleano ou ternário para exibição
export function formatBoolean(value: TernaryValue): string {
  if (value === null) return '-';
  if (value === 'nao_sei') return 'Não sei';
  return value ? 'Sim' : 'Não';
}

// Formata data de YYYY-MM-DD para DD/MM/YYYY
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}
