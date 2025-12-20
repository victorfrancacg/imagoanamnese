import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  const canProceed = data.motivoExame.trim() !== '';

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
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}
