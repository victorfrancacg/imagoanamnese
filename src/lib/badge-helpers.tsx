import { Badge } from '@/components/ui/badge';

type StatusQuestionario = 'aguardando_assistente' | 'aguardando_operador' | 'finalizado' | 'cancelado';

export function getTipoExameBadge(tipo: string | null) {
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
}

export function getStatusBadge(status: string) {
  const statusMap: Record<StatusQuestionario, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string
  }> = {
    aguardando_assistente: { variant: 'default', label: 'Aguardando Assistente' },
    aguardando_operador: { variant: 'outline', label: 'Aguardando Operador' },
    finalizado: { variant: 'secondary', label: 'Finalizado' },
    cancelado: { variant: 'destructive', label: 'Cancelado' },
  };

  const statusInfo = statusMap[status as StatusQuestionario] || {
    variant: 'outline',
    label: status
  };

  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getSexoBadge(sexo: string | null) {
  if (!sexo) return <Badge variant="outline">Não informado</Badge>;

  const variants: Record<string, 'default' | 'secondary'> = {
    masculino: 'default',
    feminino: 'secondary',
  };

  const labels: Record<string, string> = {
    masculino: 'Masculino',
    feminino: 'Feminino',
  };

  return (
    <Badge variant={variants[sexo] || 'outline'}>
      {labels[sexo] || sexo}
    </Badge>
  );
}
