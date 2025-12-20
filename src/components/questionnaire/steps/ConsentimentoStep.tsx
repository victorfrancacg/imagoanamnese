import { useRef, useState, useEffect } from "react";
import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { QuestionnaireData } from "@/types/questionnaire";
import { Eraser } from "lucide-react";

interface ConsentimentoStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function ConsentimentoStep({ data, updateData, onNext, onBack, isSaving = false }: ConsentimentoStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const canProceed = 
    data.aceitaRiscos === true && 
    data.aceitaCompartilhamento === true && 
    hasSignature;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Set drawing style
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore signature if exists
    if (data.assinaturaData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = data.assinaturaData;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
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
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    updateData({ assinaturaData: dataUrl });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    updateData({ assinaturaData: '' });
  };

  return (
    <QuestionCard
      title="Termo de Consentimento"
      subtitle="Por favor, leia atentamente e concorde com os termos abaixo"
    >
      <div className="space-y-8">
        {/* Riscos do Exame */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Riscos Associados ao Exame</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O exame de Tomografia Computadorizada pode envolver a utilização de contraste iodado, 
              que em casos raros pode causar reações alérgicas. Além disso, o exame utiliza radiação ionizante. 
              Os benefícios diagnósticos do exame geralmente superam os riscos potenciais. 
              A equipe médica está preparada para lidar com quaisquer reações adversas.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você declara estar ciente dos riscos associados ao exame e concorda em realizá-lo?
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="riscos-sim" />
                <Label htmlFor="riscos-sim" className="cursor-pointer">Sim, estou ciente e concordo</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="riscos-nao" />
                <Label htmlFor="riscos-nao" className="cursor-pointer">Não concordo</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Compartilhamento de Dados */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Compartilhamento de Dados Pessoais</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para a realização do exame e acompanhamento médico adequado, seus dados pessoais e 
              informações de saúde serão armazenados e poderão ser compartilhados com a equipe médica 
              da EMPRESA e profissionais de saúde envolvidos no seu atendimento, conforme a Lei Geral 
              de Proteção de Dados (LGPD).
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você autoriza o compartilhamento dos seus dados pessoais com a EMPRESA?
            </Label>
            <RadioGroup
              value={data.aceitaCompartilhamento === null ? '' : data.aceitaCompartilhamento ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaCompartilhamento: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="dados-sim" />
                <Label htmlFor="dados-sim" className="cursor-pointer">Sim, autorizo</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="dados-nao" />
                <Label htmlFor="dados-nao" className="cursor-pointer">Não autorizo</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Assinatura Digital */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Assinatura Digital</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eraser className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-background">
            <canvas
              ref={canvasRef}
              className="w-full h-32 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Assine no campo acima usando o mouse ou o dedo (em dispositivos touch)
          </p>
        </div>

        {(!data.aceitaRiscos || !data.aceitaCompartilhamento) && data.aceitaRiscos !== null && data.aceitaCompartilhamento !== null && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">
              Para prosseguir com o exame, é necessário concordar com os riscos e autorizar o compartilhamento de dados.
            </p>
          </div>
        )}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        isLastStep
        disabled={!canProceed || isSaving}
        nextLabel={isSaving ? "Salvando..." : undefined}
      />
    </QuestionCard>
  );
}
