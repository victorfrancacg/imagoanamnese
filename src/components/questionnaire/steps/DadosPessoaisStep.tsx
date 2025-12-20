import { QuestionCard } from "../QuestionCard";
import { NavigationButtons } from "../NavigationButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData, Sex } from "@/types/questionnaire";

interface DadosPessoaisStepProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
  onNext: () => void;
}

export function DadosPessoaisStep({ data, updateData, onNext }: DadosPessoaisStepProps) {
  const canProceed = data.nome.trim() !== '' && data.idade !== null && data.sexo !== null;

  return (
    <QuestionCard
      title="Dados Pessoais"
      subtitle="Por favor, preencha suas informações pessoais"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-base font-medium">
            Nome Completo
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder="Digite seu nome completo"
            value={data.nome}
            onChange={(e) => updateData({ nome: e.target.value })}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idade" className="text-base font-medium">
            Idade
          </Label>
          <Input
            id="idade"
            type="number"
            placeholder="Digite sua idade"
            min={0}
            max={150}
            value={data.idade ?? ''}
            onChange={(e) => updateData({ idade: e.target.value ? parseInt(e.target.value) : null })}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Sexo</Label>
          <RadioGroup
            value={data.sexo ?? ''}
            onValueChange={(value) => updateData({ sexo: value as Sex })}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="masculino" id="masculino" />
              <Label htmlFor="masculino" className="cursor-pointer flex-1">Masculino</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="feminino" id="feminino" />
              <Label htmlFor="feminino" className="cursor-pointer flex-1">Feminino</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="outro" id="outro" />
              <Label htmlFor="outro" className="cursor-pointer flex-1">Outro</Label>
            </div>
          </RadioGroup>

          {data.sexo === 'outro' && (
            <Input
              type="text"
              placeholder="Por favor, especifique"
              value={data.sexoOutro ?? ''}
              onChange={(e) => updateData({ sexoOutro: e.target.value })}
              className="h-12 text-base mt-3 animate-fade-in"
            />
          )}
        </div>
      </div>

      <NavigationButtons
        onNext={onNext}
        showBack={false}
        disabled={!canProceed}
      />
    </QuestionCard>
  );
}
