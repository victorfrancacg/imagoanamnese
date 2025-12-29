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
    data.aceitaRiscos !== null && 
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

  // Termos específicos por tipo de exame
  const renderTermoConsentimento = () => {
    if (data.tipoExame === 'tomografia') {
      return (
        <div className="space-y-4">
        <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento - Tomografia Computadorizada</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              A Tomografia Computadorizada (TC) é um método de exame por imagem que envolve o uso de radiação ionizante (raios x) para produzir imagens de interesse médico da parte do corpo que se quer estudar. Para completar seu exame, uma injeção intravenosa de agente de contraste iodado pode ser necessária para o implemento das imagens geradas, com melhoria da capacidade diagnóstica do método. O procedimento é simples, com poucos efeitos colaterais potenciais e pouco frequentes (em torno de 0,6% dos exames), em sua maioria correspondendo a reações alérgicas leves, como urticária, coceira, sensação de calor, náusea e cefaleia. Em raros casos, reações alérgicas moderadas e graves podem ocorrer num curto espaço de tempo após a infusão do fármaco, devendo ser prontamente tratadas para evitar desfechos negativos.
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">
              Selecione uma opção abaixo:
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'autorizo' : 'nao_autorizo'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'autorizo' })}
              className="flex flex-col gap-2 sm:gap-3"
            >
              <div className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="autorizo" id="tc-autorizo" className="mt-1" />
                <Label htmlFor="tc-autorizo" className="cursor-pointer text-xs sm:text-sm leading-relaxed">
                  Após o exposto e não havendo mais dúvidas, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste iodado endovenoso e autorizo sua injeção.
                </Label>
              </div>
              <div className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="nao_autorizo" id="tc-nao-autorizo" className="mt-1" />
                <Label htmlFor="tc-nao-autorizo" className="cursor-pointer text-xs sm:text-sm leading-relaxed">
                  Após o exposto, declaro ter compreendido a necessidade e as possíveis complicações pelo uso do meio de contraste iodado endovenoso, entretanto NÃO autorizo sua injeção.
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'ressonancia') {
      return (
        <div className="space-y-4">
        <div className="p-3 sm:p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Termo de Consentimento - Ressonância Magnética</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              A Ressonância magnética (RM) é um método de diagnóstico por imagem que envolve o uso de ondas de radiofrequência e um forte campo eletromagnético para produzir imagens de interesse médico da parte do corpo que se quer estudar, funcionando como um potente imã que atua de forma contínua, mesmo quando não está em realização de exames. Objetos metálicos, alguns clipes e próteses cirúrgicos, dispositivos médicos implantáveis, pigmentos cutâneos de base metálica e adornos podem gerar acidentes potencialmente graves, não devendo o paciente ou o acompanhante ter acesso à sala de exames quando se enquadrar nestas situações, salvo após ciência da equipe e liberação pela mesma e preenchimento do questionário de segurança. Para completar seu exame, uma injeção intravenosa de agente de contraste à base de gadolínio pode ser necessária para o implemento das imagens geradas, com melhoria da capacidade diagnóstica do método. O procedimento é simples, com poucos efeitos colaterais potenciais e pouco frequentes (em torno de 0,2% dos exames), em sua maioria correspondendo a reações alérgicas leves, como urticária, coceira, sensação de calor, náusea e cefaleia. Em raros casos, reações alérgicas moderadas e graves podem ocorrer num curto espaço de tempo após a infusão do fármaco, devendo ser prontamente tratadas para evitar desfechos negativos. Em casos ainda mais raros descritos na literatura médica, a fibrose sistêmica nefrogênica pode ocorrer em alguns pacientes com insuficiência renal grave, sendo nestes casos imperativo a avaliação pelo médico responsável antes de proceder o uso do meio de contraste endovenoso. Em caso de dúvidas, procure o responsável pelo setor.
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">
              Selecione uma opção abaixo:
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'autorizo' : 'nao_autorizo'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'autorizo' })}
              className="flex flex-col gap-2 sm:gap-3"
            >
              <div className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="autorizo" id="rm-autorizo" className="mt-1" />
                <Label htmlFor="rm-autorizo" className="cursor-pointer text-xs sm:text-sm leading-relaxed">
                  Após o exposto e não havendo mais dúvidas, DECLARO TER COMPREENDIDO OS RISCOS inerentes ao acesso à sala de ressonância magnética, especialmente relacionados a objetos metálicos e dispositivos implantáveis, bem como a necessidade e as possíveis complicações pelo uso do meio de contraste endovenoso à base de gadolínio e AUTORIZO SUA INJEÇÃO.
                </Label>
              </div>
              <div className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="nao_autorizo" id="rm-nao-autorizo" className="mt-1" />
                <Label htmlFor="rm-nao-autorizo" className="cursor-pointer text-xs sm:text-sm leading-relaxed">
                  Após o exposto e não havendo mais dúvidas, DECLARO TER COMPREENDIDO OS RISCOS inerentes ao acesso à sala de ressonância magnética, especialmente relacionado a objetos metálicos e dispositivos implantáveis, bem como a necessidade e as possíveis complicações pelo uso do meio de contraste endovenoso à base de gadolínio e NÃO AUTORIZO SUA INJEÇÃO.
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'densitometria') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Termo de Consentimento – Densitometria Óssea</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              Declaro que fui informado(a) sobre o exame de densitometria óssea (DXA), que utiliza raios X em baixíssima dose para avaliação da densidade mineral óssea, auxiliando no diagnóstico e acompanhamento de osteopenia, osteoporose e risco de fraturas.

              Compreendo que se trata de um exame não invasivo, rápido e indolor, com mínima exposição à radiação. Informei previamente à equipe sobre gravidez ou suspeita, uso recente de contrastes radiológicos, presença de próteses metálicas ou cirurgias que possam interferir no resultado.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você declara estar ciente e concorda em realizar o exame?
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="densi-sim" />
                <Label htmlFor="densi-sim" className="cursor-pointer">Sim, estou ciente e concordo</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="densi-nao" />
                <Label htmlFor="densi-nao" className="cursor-pointer">Não concordo</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );
    }

    if (data.tipoExame === 'mamografia') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <h4 className="font-medium text-foreground mb-2">Termo de Consentimento – Mamografia</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              Declaro que fui devidamente informado(a) sobre o exame de mamografia, que utiliza raios X em baixa dose para avaliação das mamas, com finalidade diagnóstica e/ou de rastreamento. Compreendo que o exame envolve a compressão das mamas, necessária para obtenção de imagens adequadas, podendo causar desconforto ou dor transitória.

              Estou ciente de que, em pacientes com próteses mamárias, a mamografia pode apresentar limitações técnicas, exigir manobras adicionais, e, embora raro, existe risco mínimo de deslocamento ou dano à prótese. Declaro que informei corretamente à equipe sobre a presença de prótese, cirurgias prévias, gestação suspeita ou confirmada, e outras condições relevantes.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você declara estar ciente e concorda em realizar o exame?
            </Label>
            <RadioGroup
              value={data.aceitaRiscos === null ? '' : data.aceitaRiscos ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ aceitaRiscos: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="mamo-sim" />
                <Label htmlFor="mamo-sim" className="cursor-pointer">Sim, estou ciente e concordo</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="mamo-nao" />
                <Label htmlFor="mamo-nao" className="cursor-pointer">Não concordo</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );
    }

    // Termo genérico para outros tipos de exame
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-accent/30 border border-border">
          <h4 className="font-medium text-foreground mb-2">Riscos Associados ao Exame</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todo exame de imagem pode envolver riscos inerentes ao procedimento. 
            A equipe médica está preparada para lidar com quaisquer intercorrências 
            e os benefícios diagnósticos do exame geralmente superam os riscos potenciais.
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
    );
  };

  return (
    <QuestionCard
      title="Termo de Consentimento"
      subtitle="Por favor, leia atentamente e concorde com os termos abaixo"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Termo específico por tipo de exame */}
        {renderTermoConsentimento()}

        {/* Assinatura Digital */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm sm:text-base font-medium">Assinatura Digital</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm"
            >
              <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
