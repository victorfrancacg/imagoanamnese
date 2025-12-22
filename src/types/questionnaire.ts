export type Sex = 'masculino' | 'feminino';
export type TipoExame = 'tomografia' | 'ressonancia' | 'densitometria' | 'mamografia';

export interface QuestionnaireData {
  // Dados Pessoais
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sex | null;
  peso: number | null;
  altura: number | null;
  tipoExame: TipoExame | '';
  dataExame: string;

  // Questões de Segurança
  temContraindicacao: boolean | null;
  contraindicacaoDetalhes?: string;
  tomografiaAnterior: boolean | null;
  alergia: boolean | null;
  alergiaDetalhes?: string;
  gravida: boolean | null;
  // Específicas Tomografia
  usaMetformina: boolean | null;
  cirurgiaRenal: boolean | null;
  cirurgiaRenalDetalhes?: string;
  doencaRenal: boolean | null;
  doencaRenalDetalhes?: string;

  // Questões Clínicas
  motivoExame: string;
  sintomas: string[];
  sintomasOutros?: string;
  // Específicas Tomografia e Ressonância
  traumaRegiao: boolean | null;
  cirurgiaCorpo: boolean | null;
  cirurgiaCorpoDetalhes?: string;
  historicoCancer: boolean | null;
  historicoCancerDetalhes?: string;
  // Específicas Ressonância
  examesRelacionados: boolean | null;
  examesRelacionadosDetalhes?: string;

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
  usaMetformina: null,
  cirurgiaRenal: null,
  cirurgiaRenalDetalhes: '',
  doencaRenal: null,
  doencaRenalDetalhes: '',
  motivoExame: '',
  sintomas: [],
  sintomasOutros: '',
  traumaRegiao: null,
  cirurgiaCorpo: null,
  cirurgiaCorpoDetalhes: '',
  historicoCancer: null,
  historicoCancerDetalhes: '',
  examesRelacionados: null,
  examesRelacionadosDetalhes: '',
  cancerMama: null,
  amamentando: null,
  problemaProstata: null,
  dificuldadeUrinaria: null,
  aceitaRiscos: null,
  aceitaCompartilhamento: null,
  assinaturaData: '',
};
