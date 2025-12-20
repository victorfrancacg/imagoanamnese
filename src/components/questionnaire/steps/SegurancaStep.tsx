import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from "@/types/questionnaire";
import { AlertTriangle } from "lucide-react";

interface SegurancaStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SegurancaStep({ data, updateData, onNext, onBack }: SegurancaStepProps) {
  const canProceed =
    data.temContraindicacao !== null &&
    data.tomografiaAnterior !== null &&
    data.alergia !== null &&
    (data.sexo !== 'feminino' || data.gravida !== null) &&
    (!data.temContraindicacao || (data.contraindicacaoDetalhes?.trim() ?? '') !== '') &&
    (!data.alergia || (data.alergiaDetalhes?.trim() ?? '') !== '');

  return (
    <QuestionCard
      title="Questões de Segurança"
      subtitle="Informações importantes para a realização do exame"
    >
      <div className="space-y-8">
        {/* Contraindicação */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Você tem alguma condição que possa contraindicar a realização do exame (marcapasso, prótese metálica, etc.)?
          </Label>
          <RadioGroup
            value={data.temContraindicacao === null ? '' : data.temContraindicacao ? 'sim' : 'nao'}
            onValueChange={(value) => updateData({ temContraindicacao: value === 'sim' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="sim" id="contraind-sim" />
              <Label htmlFor="contraind-sim" className="cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="nao" id="contraind-nao" />
              <Label htmlFor="contraind-nao" className="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
          {data.temContraindicacao && (
            <Textarea
              placeholder="Por favor, descreva sua condição"
              value={data.contraindicacaoDetalhes ?? ''}
              onChange={(e) => updateData({ contraindicacaoDetalhes: e.target.value })}
              className="mt-3 animate-fade-in"
            />
          )}
        </div>

        {/* Tomografia Anterior */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Você já foi submetido a outro exame de tomografia computadorizada nos últimos 12 meses?
          </Label>
          <RadioGroup
            value={data.tomografiaAnterior === null ? '' : data.tomografiaAnterior ? 'sim' : 'nao'}
            onValueChange={(value) => updateData({ tomografiaAnterior: value === 'sim' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="sim" id="tomo-sim" />
              <Label htmlFor="tomo-sim" className="cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="nao" id="tomo-nao" />
              <Label htmlFor="tomo-nao" className="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Alergia */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Você tem alguma alergia conhecida a contraste ou outros agentes utilizados em exames?
          </Label>
          <RadioGroup
            value={data.alergia === null ? '' : data.alergia ? 'sim' : 'nao'}
            onValueChange={(value) => updateData({ alergia: value === 'sim' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="sim" id="alergia-sim" />
              <Label htmlFor="alergia-sim" className="cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <RadioGroupItem value="nao" id="alergia-nao" />
              <Label htmlFor="alergia-nao" className="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
          {data.alergia && (
            <Textarea
              placeholder="Por favor, descreva sua alergia"
              value={data.alergiaDetalhes ?? ''}
              onChange={(e) => updateData({ alergiaDetalhes: e.target.value })}
              className="mt-3 animate-fade-in"
            />
          )}
        </div>

        {/* Gravidez - apenas para sexo feminino */}
        {data.sexo === 'feminino' && (
          <div className="space-y-3 animate-fade-in">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Você está grávida ou suspeita que possa estar?
            </Label>
            <RadioGroup
              value={data.gravida === null ? '' : data.gravida ? 'sim' : 'nao'}
              onValueChange={(value) => updateData({ gravida: value === 'sim' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="sim" id="gravida-sim" />
                <Label htmlFor="gravida-sim" className="cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1">
                <RadioGroupItem value="nao" id="gravida-nao" />
                <Label htmlFor="gravida-nao" className="cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
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
