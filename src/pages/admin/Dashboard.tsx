import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, FileSignature } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('questionarios')
        .select('status');

      if (error) throw error;

      const total = data.length;
      const aguardandoRevisao = data.filter(q => q.status === 'aguardando_revisao').length;
      const revisados = data.filter(q => q.status === 'revisado').length;
      const assinados = data.filter(q => q.status === 'assinado').length;

      return { total, aguardandoRevisao, revisados, assinados };
    },
  });

  const cards = [
    {
      title: 'Total de Questionários',
      value: stats?.total ?? 0,
      icon: FileText,
      description: 'Todos os questionários cadastrados',
      color: 'text-blue-600',
    },
    {
      title: 'Aguardando Revisão',
      value: stats?.aguardandoRevisao ?? 0,
      icon: Clock,
      description: 'Pendentes de revisão',
      color: 'text-orange-600',
    },
    {
      title: 'Revisados',
      value: stats?.revisados ?? 0,
      icon: CheckCircle,
      description: 'Questionários já revisados',
      color: 'text-green-600',
    },
    {
      title: 'Assinados',
      value: stats?.assinados ?? 0,
      icon: FileSignature,
      description: 'Questionários com assinatura',
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de anamnese clínica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
