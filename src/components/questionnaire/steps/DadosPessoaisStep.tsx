import { useState } from "react";
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

// Valida se a data é válida (formato completo dd/mm/yyyy)
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
  // Estados locais para os inputs de data (formato de exibição dd/mm/yyyy)
  const [dataNascimentoInput, setDataNascimentoInput] = useState(() => {
    // Se já tiver data salva no formato yyyy-MM-dd, converte para dd/mm/yyyy
    if (data.dataNascimento && data.dataNascimento.includes('-')) {
      const [year, month, day] = data.dataNascimento.split('-');
      return `${day}/${month}/${year}`;
    }
    return data.dataNascimento || '';
  });
  
  const [dataExameInput, setDataExameInput] = useState(() => {
    if (data.dataExame && data.dataExame.includes('-')) {
      const [year, month, day] = data.dataExame.split('-');
      return `${day}/${month}/${year}`;
    }
    return data.dataExame || '';
  });

  // Para mamografia, sexo é sempre feminino
  const isMamografia = data.tipoExame === 'mamografia';
  
  // Se for mamografia e sexo ainda não estiver definido, define automaticamente como feminino
  if (isMamografia && data.sexo !== 'feminino') {
    updateData({ sexo: 'feminino' });
  }

  const canProceed = 
    data.nome.trim() !== '' && 
    data.cpf.replace(/\D/g, '').length === 11 &&
    isValidDate(dataNascimentoInput) &&
    (isMamografia || data.sexo !== null) &&
    data.peso !== null &&
    data.altura !== null &&
    isValidDate(dataExameInput);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    updateData({ cpf: formatted });
  };

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setDataNascimentoInput(formatted);
    
    // Se a data estiver completa e válida, converte para formato de armazenamento
    const numbers = formatted.replace(/\D/g, '');
    if (numbers.length === 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      updateData({ dataNascimento: `${year}-${month}-${day}` });
    } else {
      updateData({ dataNascimento: formatted });
    }
  };

  const handleDataExameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setDataExameInput(formatted);
    
    // Se a data estiver completa e válida, converte para formato de armazenamento
    const numbers = formatted.replace(/\D/g, '');
    if (numbers.length === 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      updateData({ dataExame: `${year}-${month}-${day}` });
    } else {
      updateData({ dataExame: formatted });
    }
  };

  return (
    <QuestionCard
      title="Dados Pessoais"
      subtitle="Por favor, preencha suas informações pessoais"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="nome" className="text-sm sm:text-base font-medium">
            Nome Completo
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder="Digite seu nome completo"
            value={data.nome}
            onChange={(e) => updateData({ nome: e.target.value })}
            className="h-10 sm:h-12 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="cpf" className="text-sm sm:text-base font-medium">
            CPF
          </Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={handleCPFChange}
            className="h-10 sm:h-12 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="dataNascimento" className="text-sm sm:text-base font-medium">
            Data de Nascimento
          </Label>
          <Input
            id="dataNascimento"
            type="text"
            placeholder="dd/mm/aaaa"
            value={dataNascimentoInput}
            onChange={handleDataNascimentoChange}
            className="h-10 sm:h-12 text-sm sm:text-base"
            maxLength={10}
          />
        </div>

        {/* Só mostra pergunta de sexo se NÃO for mamografia */}
        {!isMamografia && (
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">Sexo</Label>
            <RadioGroup
              value={data.sexo ?? ''}
              onValueChange={(value) => updateData({ sexo: value as Sex })}
              className="space-y-2 sm:space-y-3"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="masculino" id="masculino" />
                <Label htmlFor="masculino" className="cursor-pointer flex-1 text-sm sm:text-base">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="feminino" id="feminino" />
                <Label htmlFor="feminino" className="cursor-pointer flex-1 text-sm sm:text-base">Feminino</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="peso" className="text-sm sm:text-base font-medium">
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
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="altura" className="text-sm sm:text-base font-medium">
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
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="dataExame" className="text-sm sm:text-base font-medium">
            Data do Exame
          </Label>
          <Input
            id="dataExame"
            type="text"
            placeholder="dd/mm/aaaa"
            value={dataExameInput}
            onChange={handleDataExameChange}
            className="h-10 sm:h-12 text-sm sm:text-base"
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
