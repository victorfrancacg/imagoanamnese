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

// Formata a data para exibição (dd/mm/yyyy)
function formatDateInput(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

// Converte dd/mm/yyyy para yyyy-MM-dd (formato de armazenamento)
function displayToStorage(displayDate: string): string {
  const numbers = displayDate.replace(/\D/g, '');
  if (numbers.length !== 8) return '';
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  return `${year}-${month}-${day}`;
}

// Converte yyyy-MM-dd para dd/mm/yyyy (formato de exibição)
function storageToDisplay(storageDate: string): string {
  if (!storageDate) return '';
  const [year, month, day] = storageDate.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

// Valida se a data é válida
function isValidDate(displayDate: string): boolean {
  const numbers = displayDate.replace(/\D/g, '');
  if (numbers.length !== 8) return false;
  
  const day = parseInt(numbers.slice(0, 2), 10);
  const month = parseInt(numbers.slice(2, 4), 10);
  const year = parseInt(numbers.slice(4, 8), 10);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Verificação mais precisa de dias por mês
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  return true;
}

export function DadosPessoaisStep({ data, updateData, onNext, onBack }: DadosPessoaisStepProps) {
  // Para mamografia, sexo é sempre feminino
  const isMamografia = data.tipoExame === 'mamografia';
  
  // Se for mamografia e sexo ainda não estiver definido, define automaticamente como feminino
  if (isMamografia && data.sexo !== 'feminino') {
    updateData({ sexo: 'feminino' });
  }

  const dataNascimentoDisplay = storageToDisplay(data.dataNascimento);
  const dataExameDisplay = storageToDisplay(data.dataExame);

  const canProceed = 
    data.nome.trim() !== '' && 
    data.cpf.replace(/\D/g, '').length === 11 &&
    data.dataNascimento !== '' && 
    isValidDate(dataNascimentoDisplay) &&
    (isMamografia || data.sexo !== null) &&
    data.peso !== null &&
    data.altura !== null &&
    data.dataExame !== '' &&
    isValidDate(dataExameDisplay);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    updateData({ cpf: formatted });
  };

  const handleDateChange = (field: 'dataNascimento' | 'dataExame') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    const storageFormat = displayToStorage(formatted);
    updateData({ [field]: storageFormat || formatted.replace(/\D/g, '') });
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
            type="text"
            placeholder="dd/mm/aaaa"
            value={dataNascimentoDisplay}
            onChange={handleDateChange('dataNascimento')}
            className="h-12 text-base"
            maxLength={10}
          />
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
            type="text"
            placeholder="dd/mm/aaaa"
            value={dataExameDisplay}
            onChange={handleDateChange('dataExame')}
            className="h-12 text-base"
            maxLength={10}
          />
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
