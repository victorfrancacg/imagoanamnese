import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";
import { User } from "lucide-react";

interface EspecificasStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EspecificasStep({ data, updateData, onNext, onBack }: EspecificasStepProps) {
  const isFeminino = data.sexo === 'feminino';
  const isMasculino = data.sexo === 'masculino';

  const canProceed = isFeminino
    ? data.cancerMama !== null && data.amamentando !== null
    : isMasculino
    ? data.problemaProstata !== null && data.dificuldadeUrinaria !== null
    : true;

  return (
    <QuestionCard
      title="Perguntas Específicas"
      subtitle={`Perguntas relacionadas ao seu perfil${isFeminino ? ' feminino' : isMasculino ? ' masculino' : ''}`}
    >
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-accent/50">
        <User className="w-5 h-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          Estas perguntas são específicas para o seu sexo biológico
        </span>
      </div>

      {isFeminino && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você já foi diagnosticada com câncer de mama?
            </Label>
            <RadioGroup
              value={data.cancerMama === null ? '' : data.cancerMama ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ cancerMama: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="cancer-sim" />
                <Label htmlFor="cancer-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="cancer-nao" />
                <Label htmlFor="cancer-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você está em período de amamentação?
            </Label>
            <RadioGroup
              value={data.amamentando === null ? '' : data.amamentando ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ amamentando: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="amamentando-sim" />
                <Label htmlFor="amamentando-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="amamentando-nao" />
                <Label htmlFor="amamentando-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {isMasculino && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você tem histórico de problemas na próstata?
            </Label>
            <RadioGroup
              value={data.problemaProstata === null ? '' : data.problemaProstata ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ problemaProstata: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="prostata-sim" />
                <Label htmlFor="prostata-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="prostata-nao" />
                <Label htmlFor="prostata-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Você tem dificuldades urinárias ou histórico de infecção urinária?
            </Label>
            <RadioGroup
              value={data.dificuldadeUrinaria === null ? '' : data.dificuldadeUrinaria ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ dificuldadeUrinaria: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="urinaria-sim" />
                <Label htmlFor="urinaria-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="urinaria-nao" />
                <Label htmlFor="urinaria-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {!isFeminino && !isMasculino && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Não há perguntas específicas adicionais para o seu perfil.</p>
        </div>
      )}

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        isLastStep
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}
