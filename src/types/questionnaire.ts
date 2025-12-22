export type Sex = 'masculino' | 'feminino';

export interface QuestionnaireData {
  // Dados Pessoais
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sex | null;
  peso: number | null;
  altura: number | null;
  tipoExame: string;
  dataExame: string;

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

  // Termo de Consentimento
  aceitaRiscos: boolean | null;
  aceitaCompartilhamento: boolean | null;
  assinaturaData: string;
}

export const initialData: QuestionnaireData = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  sexo: null,
  peso: null,
  altura: null,
  tipoExame: '',
  dataExame: '',
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
  aceitaRiscos: null,
  aceitaCompartilhamento: null,
  assinaturaData: '',
};
