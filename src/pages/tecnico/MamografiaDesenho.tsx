import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, Eraser, Undo2, Palette } from 'lucide-react';
import { supabaseTecnico as supabase } from '@/integrations/supabase/tecnicoClient';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Questionario = Tables<'questionarios'>;

// Chave para sessionStorage
const getStorageKey = (questionarioId: string) => `desenho_mamas_${questionarioId}`;

// Cores disponíveis para desenho
const CORES_DISPONIVEIS = [
  { nome: 'Preto', valor: '#000000' },
  { nome: 'Vermelho', valor: '#DC2626' },
  { nome: 'Azul', valor: '#2563EB' },
  { nome: 'Verde', valor: '#16A34A' },
];

// Espessuras disponíveis
const ESPESSURAS_DISPONIVEIS = [
  { nome: 'Fina', valor: 2 },
  { nome: 'Média', valor: 4 },
  { nome: 'Grossa', valor: 6 },
];

export default function MamografiaDesenho() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [corAtual, setCorAtual] = useState('#000000');
  const [espessuraAtual, setEspessuraAtual] = useState(4);
  const [historico, setHistorico] = useState<ImageData[]>([]);
  const [imagemCarregada, setImagemCarregada] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar dados do questionário (apenas para validação)
  const { data: questionario, isLoading, error } = useQuery({
    queryKey: ['questionario', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .eq('id', id!)
        .single();

      if (error) throw error;
      return data as Questionario;
    },
    enabled: !!id,
  });

  // Configurar canvas com imagem de fundo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !id) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Carregar imagem de fundo
    const img = new Image();
    img.onload = () => {
      // Configurar tamanho do canvas baseado na imagem
      const aspectRatio = img.height / img.width;
      const canvasWidth = 700; // Tamanho fixo maior para melhor visualização
      const canvasHeight = canvasWidth * aspectRatio;

      canvas.width = canvasWidth * 2; // Retina
      canvas.height = canvasHeight * 2;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.scale(2, 2);

      // Desenhar imagem de fundo
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Verificar se existe desenho salvo na sessionStorage
      const savedDrawing = sessionStorage.getItem(getStorageKey(id));
      if (savedDrawing) {
        const savedImg = new Image();
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0, canvasWidth, canvasHeight);
          setHasDrawing(true);
          salvarHistorico();
        };
        savedImg.src = savedDrawing;
      } else {
        salvarHistorico();
      }

      setImagemCarregada(true);
    };
    img.src = '/mamas-base.jpeg';
  }, [id]);

  // Atualizar estilo de desenho quando cor ou espessura mudar
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = corAtual;
    ctx.lineWidth = espessuraAtual;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [corAtual, espessuraAtual]);

  const salvarHistorico = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorico(prev => [...prev, imageData]);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / 2;
    const scaleY = canvas.height / rect.height / 2;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      salvarHistorico();
    }
  };

  const desfazer = () => {
    if (historico.length <= 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const novoHistorico = [...historico];
    novoHistorico.pop(); // Remove o estado atual
    const estadoAnterior = novoHistorico[novoHistorico.length - 1];

    if (estadoAnterior) {
      ctx.putImageData(estadoAnterior, 0, 0);
      setHistorico(novoHistorico);
    }
  };

  const limparDesenho = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Recarregar imagem base
    const img = new Image();
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHasDrawing(false);
      setHistorico([]); // Limpa histórico
      salvarHistorico(); // Salva estado limpo

      // Remove do sessionStorage
      if (id) {
        sessionStorage.removeItem(getStorageKey(id));
      }
    };
    img.src = '/mamas-base.jpeg';
  };

  const handleSalvar = () => {
    const canvas = canvasRef.current;
    if (!canvas || !id) return;

    setIsSaving(true);

    try {
      const desenhoBase64 = canvas.toDataURL('image/png');

      // Salvar no sessionStorage
      sessionStorage.setItem(getStorageKey(id), desenhoBase64);

      toast({
        title: 'Desenho salvo',
        description: 'O desenho será incluído no PDF final.',
      });

      navigate(`/tecnico/questionario/${id}/revisao`);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o desenho.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePular = () => {
    // Remove qualquer desenho salvo anteriormente
    if (id) {
      sessionStorage.removeItem(getStorageKey(id));
    }
    navigate(`/tecnico/questionario/${id}/revisao`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !questionario) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium mb-2">Erro ao carregar questionário</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Questionário não encontrado'}
              </p>
              <Link to="/tecnico/questionarios">
                <Button>Voltar para Lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/tecnico/questionario/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marcações Anatômicas</h1>
          <p className="text-muted-foreground mt-1">
            Desenhe marcações anatômicas relevantes sobre a imagem
          </p>
        </div>
      </div>

      {/* Ferramentas de desenho */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Ferramentas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Seleção de cor */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Cor</p>
              <div className="flex gap-2">
                {CORES_DISPONIVEIS.map((cor) => (
                  <button
                    key={cor.valor}
                    onClick={() => setCorAtual(cor.valor)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      corAtual === cor.valor
                        ? 'border-primary ring-2 ring-primary/50'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>

            {/* Seleção de espessura */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Espessura</p>
              <div className="flex gap-2">
                {ESPESSURAS_DISPONIVEIS.map((esp) => (
                  <button
                    key={esp.valor}
                    onClick={() => setEspessuraAtual(esp.valor)}
                    className={`px-3 py-1 rounded border text-sm transition-all ${
                      espessuraAtual === esp.valor
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border'
                    }`}
                  >
                    {esp.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={desfazer}
                disabled={historico.length <= 1}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Desfazer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={limparDesenho}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas de desenho */}
      <Card>
        <CardHeader>
          <CardTitle>Área de Desenho</CardTitle>
          <CardDescription>
            Use o mouse ou o dedo para desenhar sobre a imagem. Marque cicatrizes, nódulos ou outras características relevantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          {!imagemCarregada && (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasDrawing && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-4">
              Desenho detectado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-2 justify-between">
        <Link to={`/tecnico/questionario/${id}`}>
          <Button variant="outline">
            Voltar
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handlePular}
          >
            Pular esta etapa
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar e Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
