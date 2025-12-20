export type Sex = 'masculino' | 'feminino' | 'outro';

export interface QuestionnaireData {
  // Dados Pessoais
  nome: string;
  idade: number | null;
  sexo: Sex | null;
  sexoOutro?: string;

  // Questões de Segurança
  temContraindicacao: boolean | null;
  contraindicacaoDetalhes?: string;
  tomografiaAnterior: boolean | null;
  alergia: boolean | null;
  alergiaDetalhes?: string;
  gravida: boolean | null;

  // Questões Clínicas
  motivoExame: string;
  sintomas: string[];
  sintomasOutros?: string;

  // Perguntas Específicas - Feminino
  cancerMama: boolean | null;
  amamentando: boolean | null;

  // Perguntas Específicas - Masculino
  problemaProstata: boolean | null;
  dificuldadeUrinaria: boolean | null;
}

export const initialData: QuestionnaireData = {
  nome: '',
  idade: null,
  sexo: null,
  sexoOutro: '',
  temContraindicacao: null,
  contraindicacaoDetalhes: '',
  tomografiaAnterior: null,
  alergia: null,
  alergiaDetalhes: '',
  gravida: null,
  motivoExame: '',
  sintomas: [],
  sintomasOutros: '',
  cancerMama: null,
  amamentando: null,
  problemaProstata: null,
  dificuldadeUrinaria: null,
};
