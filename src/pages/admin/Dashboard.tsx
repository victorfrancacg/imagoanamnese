import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionnaireSearchTab } from '@/components/admin/QuestionnaireSearchTab';
import { FileText, Clock, CheckCircle } from 'lucide-react';

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
      const finalizados = data.filter(q => q.status === 'finalizado').length;

      return { total, aguardandoRevisao, finalizados };
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
      title: 'Finalizados',
      value: stats?.finalizados ?? 0,
      icon: CheckCircle,
      description: 'Questionários finalizados',
      color: 'text-green-600',
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

      <Tabs defaultValue="estatisticas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="buscar">Buscar Questionários</TabsTrigger>
        </TabsList>

        <TabsContent value="estatisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </TabsContent>

        <TabsContent value="buscar">
          <QuestionnaireSearchTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
