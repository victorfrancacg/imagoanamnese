import { QuestionnaireData } from "@/types/questionnaire";

/**
 * Valida se os dados pessoais estão completos e corretos
 * @param data - Dados do questionário
 * @returns true se os dados pessoais são válidos
 */
export function validatePersonalData(data: QuestionnaireData): boolean {
  return (
    data.nome.trim() !== '' &&
    data.cpf.replace(/\D/g, '').length === 11 &&
    data.telefone.replace(/\D/g, '').length >= 10 &&
    data.dataNascimento !== '' &&
    data.peso !== null &&
    data.altura !== null &&
    data.dataExame !== ''
  );
}

/**
 * Valida todos os dados do questionário
 * @param data - Dados do questionário
 * @returns Objeto com status de validação e erros encontrados
 */
export function validateQuestionnaireData(data: QuestionnaireData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validação de dados pessoais
  if (!validatePersonalData(data)) {
    if (data.nome.trim() === '') {
      errors.nome = "Nome é obrigatório";
    }
    if (data.cpf.replace(/\D/g, '').length !== 11) {
      errors.cpf = "CPF deve ter 11 dígitos";
    }
    if (data.telefone.replace(/\D/g, '').length < 10) {
      errors.telefone = "Telefone inválido";
    }
    if (data.dataNascimento === '') {
      errors.dataNascimento = "Data de nascimento é obrigatória";
    }
    if (data.peso === null) {
      errors.peso = "Peso é obrigatório";
    }
    if (data.altura === null) {
      errors.altura = "Altura é obrigatória";
    }
    if (data.dataExame === '') {
      errors.dataExame = "Data do exame é obrigatória";
    }
  }

  // Validação de sexo (obrigatório exceto para mamografia)
  if (data.tipoExame !== 'mamografia' && data.sexo === null) {
    errors.sexo = "Sexo é obrigatório";
  }

  // Validação do tipo de exame
  if (!data.tipoExame || data.tipoExame === '') {
    errors.tipoExame = "Tipo de exame é obrigatório";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
