import { RenderContext } from "../../core/types";

export function renderMamografiaSecurityFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addCompactDataRow, formatBoolean } = ctx;
  let y = ctx.yPos;

  addCompactDataRow("Gravidez", formatBoolean(data.gravida), leftX, y, contentWidth, data.gravida === true);
  y += 12;

  return y;
}

export function renderMamografiaClinicalFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addMotivoField, addFieldPair, formatBoolean } = ctx;
  let y = ctx.yPos;

  y = addMotivoField("Motivo do Exame", data.motivoExame || '-', leftX, y, contentWidth);

  y = addFieldPair(
    { label: "Realizou este exame anteriormente", value: formatBoolean(data.mamoExameAnterior), detailLabel: "Quando", detailValue: data.mamoExameAnteriorDetalhes || '-' },
    { label: "Data última menstruação", value: data.mamoUltimaMenstruacao || '-', detailLabel: null, detailValue: null },
    y
  );

  y = addFieldPair(
    { label: "Na menopausa", value: formatBoolean(data.mamoMenopausa), detailLabel: "Idade em que entrou", detailValue: data.mamoMenopausaDetalhes || '-' },
    { label: "Faz uso de hormônios", value: formatBoolean(data.mamoUsaHormonios), detailLabel: null, detailValue: null },
    y
  );

  y = addFieldPair(
    { label: "Tem filhos", value: formatBoolean(data.mamoTemFilhos), detailLabel: "Amamentou", detailValue: data.mamoTemFilhosDetalhes || '-' },
    { label: "Problema nas mamas", value: formatBoolean(data.mamoProblemaMamas), detailLabel: "Qual", detailValue: data.mamoProblemaMamasDetalhes || '-', highlight: data.mamoProblemaMamas === true },
    y
  );

  y = addFieldPair(
    { label: "Cirurgia nas mamas", value: formatBoolean(data.mamoCirurgiaMamas), detailLabel: "Detalhes", detailValue: data.mamoCirurgiaMamasDetalhes || '-' },
    { label: "Hist. familiar câncer", value: formatBoolean(data.mamoHistoricoFamiliar), detailLabel: "Quais parentes", detailValue: data.mamoHistoricoFamiliarDetalhes || '-', highlight: data.mamoHistoricoFamiliar === true },
    y
  );

  y = addFieldPair(
    { label: "Já fez radioterapia na mama", value: formatBoolean(data.mamoRadioterapia), detailLabel: "Quando realizou", detailValue: data.mamoRadioterapiaDetalhes || '-', highlight: data.mamoRadioterapia === true },
    { label: "Já fez ultrassonografia da mama", value: formatBoolean(data.mamoUltrassonografia), detailLabel: "Quando realizou", detailValue: data.mamoUltrassonografiaDetalhes || '-', highlight: data.mamoUltrassonografia === true },
    y
  );

  return y;
}
