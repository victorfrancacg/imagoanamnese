export type Sex = 'masculino' | 'feminino';
export type TipoExame = 'tomografia' | 'ressonancia' | 'densitometria' | 'mamografia';

// Tipo para respostas ternárias (Sim/Não/Não sei)
export type TernaryResponse = boolean | 'nao_sei' | null;

export interface QuestionnaireData {
  // Dados Pessoais
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  sexo: Sex | null;
  peso: number | null;
  altura: number | null;
  tipoExame: TipoExame | '';
  dataExame: string;

  // Questões de Segurança - Tomografia Computadorizada
  tcGravida: TernaryResponse;
  tcAmamentando: TernaryResponse;
  tcUsaMetformina: TernaryResponse;
  tcMarcapasso: TernaryResponse;
  tcAlergiaContraste: TernaryResponse;
  tcCirurgiaRenal: TernaryResponse;
  tcDoencaRenal: TernaryResponse;

  // Campo genérico de gravidez (para mamografia e densitometria)
  gravida: TernaryResponse;

  // Questões de Segurança - Ressonância Magnética
  rmGravida: TernaryResponse;
  rmAmamentando: TernaryResponse;
  rmImplanteMedicamentoso: TernaryResponse;
  rmMarcapasso: TernaryResponse;
  rmFragmentoMetalico: TernaryResponse;
  rmEletroestimulador: TernaryResponse;
  rmClipeAneurisma: TernaryResponse;
  rmExpansorTecidual: TernaryResponse;
  rmClipeGastrico: TernaryResponse;
  rmImplanteCoclear: TernaryResponse;
  rmLesaoOlhoMetal: TernaryResponse;
  rmTatuagemRecente: TernaryResponse;
  rmCirurgiaRenal: TernaryResponse;
  rmDoencaRenal: TernaryResponse;
  rmAlergiaContraste: TernaryResponse;

  // Específicas Densitometria (Segurança)
  exameContrasteRecente: TernaryResponse;
  fraturouOsso: TernaryResponse;
  fraturouOssoDetalhes?: string;
  perdeuAltura: TernaryResponse;
  perdaOsseaRadiografia: TernaryResponse;
  cifoseDorsal: TernaryResponse;
  quedas12Meses: TernaryResponse;
  parenteOsteoporose: TernaryResponse;
  parenteOsteoporoseDetalhes?: string;

  // Regiões do exame (para Tomografia e Ressonância)
  regioesExame: string[];
  
  // Questões Clínicas
  motivoExame: string;
  sintomas: string[];
  sintomasOutros?: string;
  // Específicas Tomografia e Ressonância
  traumaRegiao: TernaryResponse;
  cirurgiaCorpo: TernaryResponse;
  cirurgiaCorpoDetalhes?: string;
  historicoCancer: TernaryResponse;
  historicoCancerDetalhes?: string;
  // Específicas Ressonância
  examesRelacionados: TernaryResponse;
  examesRelacionadosDetalhes?: string;
  // Específicas Densitometria (Clínicas)
  temOsteoporose: TernaryResponse;
  doencaTireoide: TernaryResponse;
  doencaTireoideDetalhes?: string;
  doencaIntestinal: TernaryResponse;
  doencaIntestinalDetalhes?: string;
  temHiperparatiroidismo: TernaryResponse;
  temDoencaPaget: TernaryResponse;
  maAbsorcaoCalcio: TernaryResponse;
  temOsteomalacia: TernaryResponse;
  temSindromeCushing: TernaryResponse;
  deficienciaVitaminaD: TernaryResponse;
  disfuncaoRenalCronica: TernaryResponse;
  usaMedicacaoRegular: TernaryResponse;
  usaMedicacaoRegularDetalhes?: string;
  // Densitometria - Feminino
  passouMenopausa: TernaryResponse;
  passouMenopausaDetalhes?: string;
  ciclosIrregulares: TernaryResponse;
  teveCancerMamaDensi: TernaryResponse;
  fezHisterectomia: TernaryResponse;
  fezHisterectomiaDetalhes?: string;
  retirouOvarios: TernaryResponse;

  // Perguntas Específicas - Feminino
  cancerMama: TernaryResponse;
  amamentando: TernaryResponse;

  // Perguntas Específicas - Mamografia
  mamoExameAnterior: TernaryResponse;
  mamoExameAnteriorDetalhes?: string;
  mamoUltimaMenstruacao: string;
  mamoMenopausa: TernaryResponse;
  mamoMenopausaDetalhes?: string;
  mamoUsaHormonios: TernaryResponse;
  mamoTemFilhos: TernaryResponse;
  mamoTemFilhosDetalhes?: string;
  mamoProblemaMamas: TernaryResponse;
  mamoProblemaMamasDetalhes?: string;
  mamoCirurgiaMamas: TernaryResponse;
  mamoCirurgiaMamasDetalhes?: string;
  mamoUltrassonografia: TernaryResponse;
  mamoUltrassonografiaDetalhes?: string;
  mamoHistoricoFamiliar: TernaryResponse;
  mamoHistoricoFamiliarDetalhes?: string;
  mamoRadioterapia: TernaryResponse;
  mamoRadioterapiaDetalhes?: string;

  // Perguntas Específicas - Masculino
  problemaProstata: TernaryResponse;
  dificuldadeUrinaria: TernaryResponse;

  // Termo de Consentimento
  aceitaRiscos: boolean | null;
  tcAceitaContraste: boolean | null; // Termo específico de contraste para TC
  rmAceitaContraste: boolean | null; // Termo específico de contraste para RM
  aceitaCompartilhamento: boolean | null;
  assinaturaData: string;

  // Preenchimento por responsável
  preenchidoPor: 'paciente' | 'responsavel';
  nomeResponsavel?: string;
  assinaturaResponsavel?: string;
}

export const initialData: QuestionnaireData = {
  nome: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  sexo: null,
  peso: null,
  altura: null,
  tipoExame: '',
  dataExame: '',
  // Tomografia Computadorizada - Segurança
  tcGravida: null,
  tcAmamentando: null,
  tcUsaMetformina: null,
  tcMarcapasso: null,
  tcAlergiaContraste: null,
  tcCirurgiaRenal: null,
  tcDoencaRenal: null,
  gravida: null,
  // Ressonância Magnética - Segurança
  rmGravida: null,
  rmAmamentando: null,
  rmImplanteMedicamentoso: null,
  rmMarcapasso: null,
  rmFragmentoMetalico: null,
  rmEletroestimulador: null,
  rmClipeAneurisma: null,
  rmExpansorTecidual: null,
  rmClipeGastrico: null,
  rmImplanteCoclear: null,
  rmLesaoOlhoMetal: null,
  rmTatuagemRecente: null,
  rmCirurgiaRenal: null,
  rmDoencaRenal: null,
  rmAlergiaContraste: null,
  // Densitometria Segurança
  exameContrasteRecente: null,
  fraturouOsso: null,
  fraturouOssoDetalhes: '',
  perdeuAltura: null,
  perdaOsseaRadiografia: null,
  cifoseDorsal: null,
  quedas12Meses: null,
  parenteOsteoporose: null,
  parenteOsteoporoseDetalhes: '',
  // Regiões do exame
  regioesExame: [],
  // Clínicas
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
  // Densitometria Clínicas
  temOsteoporose: null,
  doencaTireoide: null,
  doencaTireoideDetalhes: '',
  doencaIntestinal: null,
  doencaIntestinalDetalhes: '',
  temHiperparatiroidismo: null,
  temDoencaPaget: null,
  maAbsorcaoCalcio: null,
  temOsteomalacia: null,
  temSindromeCushing: null,
  deficienciaVitaminaD: null,
  disfuncaoRenalCronica: null,
  usaMedicacaoRegular: null,
  usaMedicacaoRegularDetalhes: '',
  // Densitometria Feminino
  passouMenopausa: null,
  passouMenopausaDetalhes: '',
  ciclosIrregulares: null,
  teveCancerMamaDensi: null,
  fezHisterectomia: null,
  fezHisterectomiaDetalhes: '',
  retirouOvarios: null,
  // Outros
  cancerMama: null,
  amamentando: null,
  // Mamografia
  mamoExameAnterior: null,
  mamoExameAnteriorDetalhes: '',
  mamoUltimaMenstruacao: '',
  mamoMenopausa: null,
  mamoMenopausaDetalhes: '',
  mamoUsaHormonios: null,
  mamoTemFilhos: null,
  mamoTemFilhosDetalhes: '',
  mamoProblemaMamas: null,
  mamoProblemaMamasDetalhes: '',
  mamoCirurgiaMamas: null,
  mamoCirurgiaMamasDetalhes: '',
  mamoUltrassonografia: null,
  mamoUltrassonografiaDetalhes: '',
  mamoHistoricoFamiliar: null,
  mamoHistoricoFamiliarDetalhes: '',
  mamoRadioterapia: null,
  mamoRadioterapiaDetalhes: '',
  problemaProstata: null,
  dificuldadeUrinaria: null,
  aceitaRiscos: null,
  tcAceitaContraste: null,
  rmAceitaContraste: null,
  aceitaCompartilhamento: null,
  assinaturaData: '',
  // Preenchimento por responsável
  preenchidoPor: 'paciente',
  nomeResponsavel: '',
  assinaturaResponsavel: '',
};
