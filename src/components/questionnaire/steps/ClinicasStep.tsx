import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

interface ClinicasStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SINTOMAS_OPTIONS = [
  { id: 'dor-peito', label: 'Dor no peito' },
  { id: 'dificuldade-respiratoria', label: 'Dificuldade respiratória' },
  { id: 'dor-abdominal', label: 'Dor abdominal' },
  { id: 'outros', label: 'Outros' },
];

export function ClinicasStep({ data, updateData, onNext, onBack }: ClinicasStepProps) {
  const isFeminino = data.sexo === 'feminino';
  const isMasculino = data.sexo === 'masculino';

  // Validate required fields including sex-specific ones
  const baseValid = data.motivoExame.trim() !== '';
  const femininoValid = !isFeminino || (data.cancerMama !== null && data.amamentando !== null);
  const masculinoValid = !isMasculino || (data.problemaProstata !== null && data.dificuldadeUrinaria !== null);
  
  const canProceed = baseValid && femininoValid && masculinoValid;

  const handleSintomaChange = (sintomaId: string, checked: boolean) => {
    const newSintomas = checked
      ? [...data.sintomas, sintomaId]
      : data.sintomas.filter((s) => s !== sintomaId);
    updateData({ sintomas: newSintomas });
  };

  return (
    <QuestionCard
      title="Questões Clínicas"
      subtitle="Informações sobre o motivo do exame"
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="motivo" className="text-base font-medium">
            Motivo do Exame
          </Label>
          <Textarea
            id="motivo"
            placeholder="Descreva o motivo da consulta, sintomas ou razões específicas para a realização da tomografia"
            value={data.motivoExame}
            onChange={(e) => updateData({ motivoExame: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Sintomas Relacionados (selecione todos que se aplicam)
          </Label>
          <div className="space-y-3">
            {SINTOMAS_OPTIONS.map((sintoma) => (
              <div
                key={sintoma.id}
                className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleSintomaChange(sintoma.id, !data.sintomas.includes(sintoma.id))}
              >
                <Checkbox
                  id={sintoma.id}
                  checked={data.sintomas.includes(sintoma.id)}
                  onCheckedChange={(checked) => handleSintomaChange(sintoma.id, checked as boolean)}
                />
                <Label htmlFor={sintoma.id} className="cursor-pointer flex-1">
                  {sintoma.label}
                </Label>
              </div>
            ))}
          </div>

          {data.sintomas.includes('outros') && (
            <Input
              type="text"
              placeholder="Por favor, especifique outros sintomas"
              value={data.sintomasOutros ?? ''}
              onChange={(e) => updateData({ sintomasOutros: e.target.value })}
              className="h-12 text-base animate-fade-in"
            />
          )}
        </div>

        {/* Perguntas específicas para mulheres */}
        {isFeminino && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
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

        {/* Perguntas específicas para homens */}
        {isMasculino && (
          <div className="space-y-6 pt-4 border-t border-border animate-fade-in">
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
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}
