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
  onBack: () => void;
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

export function DadosPessoaisStep({ data, updateData, onNext, onBack }: DadosPessoaisStepProps) {
  // Para mamografia, sexo é sempre feminino
  const isMamografia = data.tipoExame === 'mamografia';
  
  // Se for mamografia e sexo ainda não estiver definido, define automaticamente como feminino
  if (isMamografia && data.sexo !== 'feminino') {
    updateData({ sexo: 'feminino' });
  }

  const canProceed = 
    data.nome.trim() !== '' && 
    data.cpf.replace(/\D/g, '').length === 11 &&
    data.dataNascimento !== '' && 
    (isMamografia || data.sexo !== null) &&
    data.peso !== null &&
    data.altura !== null &&
    data.dataExame !== '';

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    updateData({ cpf: formatted });
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

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
          <Label htmlFor="cpf" className="text-base font-medium">
            CPF
          </Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={handleCPFChange}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataNascimento" className="text-base font-medium">
            Data de Nascimento
          </Label>
          <Input
            id="dataNascimento"
            type="date"
            value={data.dataNascimento}
            onChange={(e) => updateData({ dataNascimento: e.target.value })}
            className="h-12 text-base"
          />
          {data.dataNascimento && (
            <p className="text-sm text-muted-foreground">
              {formatDateForDisplay(data.dataNascimento)}
            </p>
          )}
        </div>

        {/* Só mostra pergunta de sexo se NÃO for mamografia */}
        {!isMamografia && (
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
            </RadioGroup>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="peso" className="text-base font-medium">
              Peso (kg)
            </Label>
            <Input
              id="peso"
              type="number"
              placeholder="Ex: 70"
              min={1}
              max={500}
              step={0.1}
              value={data.peso ?? ''}
              onChange={(e) => updateData({ peso: e.target.value ? parseFloat(e.target.value) : null })}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="altura" className="text-base font-medium">
              Altura (cm)
            </Label>
            <Input
              id="altura"
              type="number"
              placeholder="Ex: 170"
              min={1}
              max={300}
              value={data.altura ?? ''}
              onChange={(e) => updateData({ altura: e.target.value ? parseFloat(e.target.value) : null })}
              className="h-12 text-base"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataExame" className="text-base font-medium">
            Data do Exame
          </Label>
          <Input
            id="dataExame"
            type="date"
            value={data.dataExame}
            onChange={(e) => updateData({ dataExame: e.target.value })}
            className="h-12 text-base"
          />
          {data.dataExame && (
            <p className="text-sm text-muted-foreground">
              {(() => {
                const [year, month, day] = data.dataExame.split('-');
                return `${day}/${month}/${year}`;
              })()}
            </p>
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
