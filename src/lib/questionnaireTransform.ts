import { QuestionnaireData } from "@/types/questionnaire";

/**
 * Extrai as respostas de segurança baseadas no tipo de exame
 * @param data - Dados do questionário
 * @returns Objeto com respostas de segurança específicas do tipo de exame
 */
export function extractSecurityAnswers(data: QuestionnaireData): Record<string, boolean | string | null> {
  const { tipoExame } = data;

  if (tipoExame === 'ressonancia') {
    return {
      rmGravida: data.rmGravida ?? null,
      rmAmamentando: data.rmAmamentando ?? null,
      rmImplanteMedicamentoso: data.rmImplanteMedicamentoso ?? null,
      rmMarcapasso: data.rmMarcapasso ?? null,
      rmFragmentoMetalico: data.rmFragmentoMetalico ?? null,
      rmEletroestimulador: data.rmEletroestimulador ?? null,
      rmClipeAneurisma: data.rmClipeAneurisma ?? null,
      rmExpansorTecidual: data.rmExpansorTecidual ?? null,
      rmClipeGastrico: data.rmClipeGastrico ?? null,
      rmImplanteCoclear: data.rmImplanteCoclear ?? null,
      rmLesaoOlhoMetal: data.rmLesaoOlhoMetal ?? null,
      rmTatuagemRecente: data.rmTatuagemRecente ?? null,
      rmCirurgiaRenal: data.rmCirurgiaRenal ?? null,
      rmDoencaRenal: data.rmDoencaRenal ?? null,
      rmAlergiaContraste: data.rmAlergiaContraste ?? null,
    };
  }

  if (tipoExame === 'tomografia') {
    return {
      tcGravida: data.tcGravida ?? null,
      tcAmamentando: data.tcAmamentando ?? null,
      tcUsaMetformina: data.tcUsaMetformina ?? null,
      tcMarcapasso: data.tcMarcapasso ?? null,
      tcAlergiaContraste: data.tcAlergiaContraste ?? null,
      tcCirurgiaRenal: data.tcCirurgiaRenal ?? null,
      tcDoencaRenal: data.tcDoencaRenal ?? null,
    };
  }

  if (tipoExame === 'mamografia') {
    return {
      gravida: data.gravida ?? null,
    };
  }

  if (tipoExame === 'densitometria') {
    return {
      gravida: data.gravida ?? null,
      exameContrasteRecente: data.exameContrasteRecente ?? null,
      fraturouOsso: data.fraturouOsso ?? null,
      fraturouOssoDetalhes: data.fraturouOssoDetalhes ?? null,
      perdeuAltura: data.perdeuAltura ?? null,
      perdaOsseaRadiografia: data.perdaOsseaRadiografia ?? null,
      cifoseDorsal: data.cifoseDorsal ?? null,
      quedas12Meses: data.quedas12Meses ?? null,
      parenteOsteoporose: data.parenteOsteoporose ?? null,
      parenteOsteoporoseDetalhes: data.parenteOsteoporoseDetalhes ?? null,
    };
  }

  return {};
}

/**
 * Extrai as respostas clínicas baseadas no tipo de exame
 * @param data - Dados do questionário
 * @returns Objeto com respostas clínicas específicas do tipo de exame
 */
export function extractClinicalAnswers(data: QuestionnaireData): Record<string, any> {
  const { tipoExame } = data;

  const common = {
    motivoExame: data.motivoExame || null,
  };

  if (tipoExame === 'tomografia' || tipoExame === 'ressonancia') {
    return {
      ...common,
      regioesExame: data.regioesExame || null,
      traumaRegiao: data.traumaRegiao ?? null,
      cirurgiaCorpo: data.cirurgiaCorpo ?? null,
      cirurgiaCorpoDetalhes: data.cirurgiaCorpoDetalhes ?? null,
      historicoCancer: data.historicoCancer ?? null,
      historicoCancerDetalhes: data.historicoCancerDetalhes ?? null,
      examesRelacionados: tipoExame === 'ressonancia' ? (data.examesRelacionados ?? null) : null,
      examesRelacionadosDetalhes: tipoExame === 'ressonancia' ? (data.examesRelacionadosDetalhes ?? null) : null,
      amamentando: tipoExame === 'tomografia' ? (data.amamentando ?? null) : null,
      problemaProstata: data.problemaProstata ?? null,
      dificuldadeUrinaria: data.dificuldadeUrinaria ?? null,
    };
  }

  if (tipoExame === 'mamografia') {
    return {
      ...common,
      mamoExameAnterior: data.mamoExameAnterior ?? null,
      mamoExameAnteriorDetalhes: data.mamoExameAnteriorDetalhes ?? null,
      mamoUltimaMenstruacao: data.mamoUltimaMenstruacao ?? null,
      mamoMenopausa: data.mamoMenopausa ?? null,
      mamoMenopausaDetalhes: data.mamoMenopausaDetalhes ?? null,
      mamoUsaHormonios: data.mamoUsaHormonios ?? null,
      mamoTemFilhos: data.mamoTemFilhos ?? null,
      mamoTemFilhosDetalhes: data.mamoTemFilhosDetalhes ?? null,
      mamoProblemaMamas: data.mamoProblemaMamas ?? null,
      mamoProblemaMamasDetalhes: data.mamoProblemaMamasDetalhes ?? null,
      mamoCirurgiaMamas: data.mamoCirurgiaMamas ?? null,
      mamoCirurgiaMamasDetalhes: data.mamoCirurgiaMamasDetalhes ?? null,
      mamoUltrassonografia: data.mamoUltrassonografia ?? null,
      mamoUltrassonografiaDetalhes: data.mamoUltrassonografiaDetalhes ?? null,
      mamoHistoricoFamiliar: data.mamoHistoricoFamiliar ?? null,
      mamoHistoricoFamiliarDetalhes: data.mamoHistoricoFamiliarDetalhes ?? null,
      mamoRadioterapia: data.mamoRadioterapia ?? null,
      mamoRadioterapiaDetalhes: data.mamoRadioterapiaDetalhes ?? null,
    };
  }

  if (tipoExame === 'densitometria') {
    return {
      ...common,
      temOsteoporose: data.temOsteoporose ?? null,
      doencaTireoide: data.doencaTireoide ?? null,
      doencaTireoideDetalhes: data.doencaTireoideDetalhes ?? null,
      doencaIntestinal: data.doencaIntestinal ?? null,
      doencaIntestinalDetalhes: data.doencaIntestinalDetalhes ?? null,
      temHiperparatiroidismo: data.temHiperparatiroidismo ?? null,
      temDoencaPaget: data.temDoencaPaget ?? null,
      maAbsorcaoCalcio: data.maAbsorcaoCalcio ?? null,
      temOsteomalacia: data.temOsteomalacia ?? null,
      temSindromeCushing: data.temSindromeCushing ?? null,
      deficienciaVitaminaD: data.deficienciaVitaminaD ?? null,
      disfuncaoRenalCronica: data.disfuncaoRenalCronica ?? null,
      usaMedicacaoRegular: data.usaMedicacaoRegular ?? null,
      usaMedicacaoRegularDetalhes: data.usaMedicacaoRegularDetalhes ?? null,
      passouMenopausa: data.passouMenopausa ?? null,
      passouMenopausaDetalhes: data.passouMenopausaDetalhes ?? null,
      ciclosIrregulares: data.ciclosIrregulares ?? null,
      teveCancerMamaDensi: data.teveCancerMamaDensi ?? null,
      fezHisterectomia: data.fezHisterectomia ?? null,
      fezHisterectomiaDetalhes: data.fezHisterectomiaDetalhes ?? null,
      retirouOvarios: data.retirouOvarios ?? null,
    };
  }

  return common;
}
