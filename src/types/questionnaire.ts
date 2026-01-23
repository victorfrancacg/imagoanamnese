export type Sex = 'masculino' | 'feminino';
export type TipoExame = 'tomografia' | 'ressonancia' | 'densitometria' | 'mamografia';

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
  tcGravida: boolean | null;
  tcAmamentando: boolean | null;
  tcUsaMetformina: boolean | null;
  tcMarcapasso: boolean | null;
  tcAlergiaContraste: boolean | null;
  tcCirurgiaRenal: boolean | null;
  tcDoencaRenal: boolean | null;
  
  // Campo genérico de gravidez (para mamografia e densitometria)
  gravida: boolean | null;
  
  // Questões de Segurança - Ressonância Magnética
  rmGravida: boolean | null;
  rmAmamentando: boolean | null;
  rmImplanteMedicamentoso: boolean | null;
  rmMarcapasso: boolean | null;
  rmFragmentoMetalico: boolean | null;
  rmEletroestimulador: boolean | null;
  rmClipeAneurisma: boolean | null;
  rmExpansorTecidual: boolean | null;
  rmClipeGastrico: boolean | null;
  rmImplanteCoclear: boolean | null;
  rmLesaoOlhoMetal: boolean | null;
  rmTatuagemRecente: boolean | null;
  rmCirurgiaRenal: boolean | null;
  rmDoencaRenal: boolean | null;
  rmAlergiaContraste: boolean | null;
  
  // Específicas Densitometria (Segurança)
  exameContrasteRecente: boolean | null;
  fraturouOsso: boolean | null;
  fraturouOssoDetalhes?: string;
  perdeuAltura: boolean | null;
  perdaOsseaRadiografia: boolean | null;
  cifoseDorsal: boolean | null;
  quedas12Meses: boolean | null;
  parenteOsteoporose: boolean | null;
  parenteOsteoporoseDetalhes?: string;

  // Regiões do exame (para Tomografia e Ressonância)
  regioesExame: string[];
  
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
  // Específicas Densitometria (Clínicas)
  temOsteoporose: boolean | null;
  doencaTireoide: boolean | null;
  doencaTireoideDetalhes?: string;
  doencaIntestinal: boolean | null;
  doencaIntestinalDetalhes?: string;
  temHiperparatiroidismo: boolean | null;
  temDoencaPaget: boolean | null;
  maAbsorcaoCalcio: boolean | null;
  temOsteomalacia: boolean | null;
  temSindromeCushing: boolean | null;
  deficienciaVitaminaD: boolean | null;
  disfuncaoRenalCronica: boolean | null;
  usaMedicacaoRegular: boolean | null;
  usaMedicacaoRegularDetalhes?: string;
  // Densitometria - Feminino
  passouMenopausa: boolean | null;
  passouMenopausaDetalhes?: string;
  ciclosIrregulares: boolean | null;
  teveCancerMamaDensi: boolean | null;
  fezHisterectomia: boolean | null;
  fezHisterectomiaDetalhes?: string;
  retirouOvarios: boolean | null;

  // Perguntas Específicas - Feminino
  cancerMama: boolean | null;
  amamentando: boolean | null;

  // Perguntas Específicas - Mamografia
  mamoExameAnterior: boolean | null;
  mamoExameAnteriorDetalhes?: string;
  mamoUltimaMenstruacao: string;
  mamoMenopausa: boolean | null;
  mamoMenopausaDetalhes?: string;
  mamoUsaHormonios: boolean | null;
  mamoTemFilhos: boolean | null;
  mamoTemFilhosDetalhes?: string;
  mamoProblemaMamas: boolean | null;
  mamoProblemaMamasDetalhes?: string;
  mamoCirurgiaMamas: boolean | null;
  mamoCirurgiaMamasDetalhes?: string;
  mamoUltrassonografia: boolean | null;
  mamoUltrassonografiaDetalhes?: string;
  mamoHistoricoFamiliar: boolean | null;
  mamoHistoricoFamiliarDetalhes?: string;
  mamoRadioterapia: boolean | null;
  mamoRadioterapiaDetalhes?: string;

  // Perguntas Específicas - Masculino
  problemaProstata: boolean | null;
  dificuldadeUrinaria: boolean | null;

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
