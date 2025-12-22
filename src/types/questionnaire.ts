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
  aceitaCompartilhamento: null,
  assinaturaData: '',
};
