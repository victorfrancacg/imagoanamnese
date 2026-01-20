import { RenderContext } from "../../core/types";

export function renderDensitometriaSecurityFields(ctx: RenderContext): number {
  const { data, addThreeColumnRow, addThreeColumnFieldRow, formatBoolean } = ctx;
  let y = ctx.yPos;

  const isFeminino = data.sexo === 'feminino';

  // Linha 1: Gravidez (feminino) | Cifose dorsal | Exame contraste recente
  y = addThreeColumnRow(
    isFeminino ? { label: "Gravidez", value: formatBoolean(data.gravida), highlight: data.gravida === true } : { label: "Cifose dorsal", value: formatBoolean(data.cifoseDorsal), highlight: data.cifoseDorsal === true },
    isFeminino ? { label: "Cifose dorsal", value: formatBoolean(data.cifoseDorsal), highlight: data.cifoseDorsal === true } : { label: "Exame contraste recente", value: formatBoolean(data.exameContrasteRecente), highlight: data.exameContrasteRecente === true },
    isFeminino ? { label: "Exame contraste recente", value: formatBoolean(data.exameContrasteRecente), highlight: data.exameContrasteRecente === true } : null,
    y
  );

  // Linha 2: Perdeu +3cm altura | Quedas (últimos 12m) | Perda óssea radiografia
  y = addThreeColumnRow(
    { label: "Perdeu +3cm altura", value: formatBoolean(data.perdeuAltura), highlight: data.perdeuAltura === true },
    { label: "Quedas (últimos 12m)", value: formatBoolean(data.quedas12Meses), highlight: data.quedas12Meses === true },
    { label: "Perda óssea radiografia", value: formatBoolean(data.perdaOsseaRadiografia), highlight: data.perdaOsseaRadiografia === true },
    y
  );

  y += 2;

  // Linha 3: Fraturou osso (últimos 5 anos) + Detalhes | Parente com osteoporose + Detalhes
  y = addThreeColumnFieldRow(
    { label: "Fraturou osso (últimos 5 anos)", value: formatBoolean(data.fraturouOsso), detailLabel: "Detalhes", detailValue: data.fraturouOssoDetalhes || '-', highlight: data.fraturouOsso === true },
    { label: "Parente com osteoporose", value: formatBoolean(data.parenteOsteoporose), detailLabel: "Detalhes", detailValue: data.parenteOsteoporoseDetalhes || '-', highlight: data.parenteOsteoporose === true },
    null,
    y
  );

  return y;
}

export function renderDensitometriaClinicalFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addMotivoField, addThreeColumnRow, addThreeColumnFieldRow, formatBoolean } = ctx;
  let y = ctx.yPos;

  const isFeminino = data.sexo === 'feminino';

  // Motivo do Exame (full width)
  y = addMotivoField("Motivo do Exame", data.motivoExame || '-', leftX, y, contentWidth);

  // Linha 1: Hiperparatiroidismo | Má absorção cálcio | Doença de Paget
  y = addThreeColumnRow(
    { label: "Hiperparatiroidismo", value: formatBoolean(data.temHiperparatiroidismo), highlight: data.temHiperparatiroidismo === true },
    { label: "Má absorção cálcio", value: formatBoolean(data.maAbsorcaoCalcio), highlight: data.maAbsorcaoCalcio === true },
    { label: "Doença de Paget", value: formatBoolean(data.temDoencaPaget), highlight: data.temDoencaPaget === true },
    y
  );

  // Linha 2: Síndrome de Cushing | Deficiência vit. D | Osteomalácia
  y = addThreeColumnRow(
    { label: "Síndrome de Cushing", value: formatBoolean(data.temSindromeCushing), highlight: data.temSindromeCushing === true },
    { label: "Deficiência vit. D", value: formatBoolean(data.deficienciaVitaminaD), highlight: data.deficienciaVitaminaD === true },
    { label: "Osteomalácia", value: formatBoolean(data.temOsteomalacia), highlight: data.temOsteomalacia === true },
    y
  );

  // Linha 3: Disfunção renal crônica | Osteoporose | Ciclos irregulares (feminino)
  y = addThreeColumnRow(
    { label: "Disfunção renal crônica", value: formatBoolean(data.disfuncaoRenalCronica), highlight: data.disfuncaoRenalCronica === true },
    { label: "Osteoporose", value: formatBoolean(data.temOsteoporose), highlight: data.temOsteoporose === true },
    isFeminino ? { label: "Ciclos irregulares", value: formatBoolean(data.ciclosIrregulares), highlight: data.ciclosIrregulares === true } : null,
    y
  );

  // Linha 4: Retirou ovários | Câncer de mama (apenas feminino)
  if (isFeminino) {
    y = addThreeColumnRow(
      { label: "Retirou ovários", value: formatBoolean(data.retirouOvarios), highlight: data.retirouOvarios === true },
      { label: "Câncer de mama", value: formatBoolean(data.teveCancerMamaDensi), highlight: data.teveCancerMamaDensi === true },
      null,
      y
    );
  }

  y += 2;

  // Linha 5: Doença na tireoide + Detalhes | Doença intestinal + Detalhes | Usa medicação regular + Medicações
  y = addThreeColumnFieldRow(
    { label: "Doença na tireoide", value: formatBoolean(data.doencaTireoide), detailLabel: "Detalhes", detailValue: data.doencaTireoideDetalhes || '-', highlight: data.doencaTireoide === true },
    { label: "Doença intestinal", value: formatBoolean(data.doencaIntestinal), detailLabel: "Detalhes", detailValue: data.doencaIntestinalDetalhes || '-', highlight: data.doencaIntestinal === true },
    { label: "Usa medicação regular", value: formatBoolean(data.usaMedicacaoRegular), detailLabel: "Medicações", detailValue: data.usaMedicacaoRegularDetalhes || '-', highlight: data.usaMedicacaoRegular === true },
    y
  );

  // Linha 6: Passou pela menopausa + Detalhes | Histerectomia + Detalhes (apenas feminino)
  if (isFeminino) {
    y = addThreeColumnFieldRow(
      { label: "Passou pela menopausa", value: formatBoolean(data.passouMenopausa), detailLabel: "Detalhes", detailValue: data.passouMenopausaDetalhes || '-', highlight: data.passouMenopausa === true },
      { label: "Histerectomia", value: formatBoolean(data.fezHisterectomia), detailLabel: "Detalhes", detailValue: data.fezHisterectomiaDetalhes || '-', highlight: data.fezHisterectomia === true },
      null,
      y
    );
  }

  return y;
}
