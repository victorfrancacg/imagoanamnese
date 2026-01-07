import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData, Sex } from "@/types/questionnaire";
import { formatCpf as formatCpfUtil } from "@/lib/utils";

interface PersonalFieldsProps {
  data: QuestionnaireData;
  updateData: (updates: Partial<QuestionnaireData>) => void;
}

// Formata o CPF para exibição (000.000.000-00)
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

// Formata o telefone para exibição ((XX) XXXXX-XXXX)
function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

// Formata a data para exibição (dd/mm/yyyy)
function formatDateInput(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

/**
 * Componente de campos de dados pessoais para edição
 * Adaptado de DadosPessoaisStep.tsx
 */
export function PersonalFields({ data, updateData }: PersonalFieldsProps) {
  // Estados locais para os inputs de data (formato de exibição dd/mm/yyyy)
  const [dataNascimentoInput, setDataNascimentoInput] = useState(() => {
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

  const isMamografia = data.tipoExame === 'mamografia';

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    const onlyNumbers = formatted.replace(/\D/g, '');
    updateData({ cpf: onlyNumbers });
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    updateData({ telefone: formatted });
  };

  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setDataNascimentoInput(formatted);

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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-nome">Nome Completo</Label>
        <Input
          id="edit-nome"
          type="text"
          placeholder="Digite o nome completo"
          value={data.nome}
          onChange={(e) => updateData({ nome: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-cpf">CPF</Label>
        <Input
          id="edit-cpf"
          type="text"
          placeholder="000.000.000-00"
          value={formatCpfUtil(data.cpf)}
          onChange={handleCPFChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-telefone">Telefone</Label>
        <Input
          id="edit-telefone"
          type="text"
          placeholder="(XX) XXXXX-XXXX"
          value={data.telefone}
          onChange={handleTelefoneChange}
          maxLength={15}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-dataNascimento">Data de Nascimento</Label>
        <Input
          id="edit-dataNascimento"
          type="text"
          placeholder="dd/mm/aaaa"
          value={dataNascimentoInput}
          onChange={handleDataNascimentoChange}
          maxLength={10}
        />
      </div>

      {!isMamografia && (
        <div className="space-y-3">
          <Label>Sexo</Label>
          <RadioGroup
            value={data.sexo ?? ''}
            onValueChange={(value) => updateData({ sexo: value as Sex })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="masculino" id="edit-masculino" />
              <Label htmlFor="edit-masculino" className="cursor-pointer flex-1">Masculino</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="feminino" id="edit-feminino" />
              <Label htmlFor="edit-feminino" className="cursor-pointer flex-1">Feminino</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-peso">Peso (kg)</Label>
          <Input
            id="edit-peso"
            type="number"
            placeholder="Ex: 70"
            min={1}
            max={500}
            step={0.1}
            value={data.peso ?? ''}
            onChange={(e) => updateData({ peso: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-altura">Altura (cm)</Label>
          <Input
            id="edit-altura"
            type="number"
            placeholder="Ex: 170"
            min={1}
            max={300}
            value={data.altura ?? ''}
            onChange={(e) => updateData({ altura: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-dataExame">Data do Exame</Label>
        <Input
          id="edit-dataExame"
          type="text"
          placeholder="dd/mm/aaaa"
          value={dataExameInput}
          onChange={handleDataExameChange}
          maxLength={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-tipoExame">Tipo de Exame</Label>
        <Input
          id="edit-tipoExame"
          type="text"
          value={data.tipoExame}
          disabled
          className="bg-muted cursor-not-allowed"
          title="Tipo de exame não pode ser alterado"
        />
        <p className="text-xs text-muted-foreground">
          O tipo de exame não pode ser alterado após criação
        </p>
      </div>
    </div>
  );
}
