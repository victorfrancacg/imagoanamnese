import { RenderContext } from "../../core/types";

// Mapeamento de regiões do exame para texto legível
const REGIOES_LABELS: Record<string, string> = {
  cabeca: 'Cabeça',
  pescoco: 'Pescoço',
  tronco: 'Tronco',
  membros_superiores: 'Membros Superiores',
  membros_inferiores: 'Membros Inferiores',
};

function formatRegioes(regioes: string[] | null | undefined): string {
  if (!regioes || regioes.length === 0) return '-';
  return regioes.map(r => REGIOES_LABELS[r] || r.replace(/_/g, ' ')).join(', ');
}

export function renderTomografiaSecurityFields(ctx: RenderContext): number {
  const { data, addFieldPair, formatBoolean } = ctx;
  let y = ctx.yPos;

  const isFeminino = data.sexo === 'feminino';

  if (isFeminino) {
    // Feminino: layout em 2 colunas com campos específicos de gravidez/amamentação

    // Linha 1: Possibilidade de gravidez | Amamentando
    y = addFieldPair(
      { label: "Possibilidade de gravidez", value: formatBoolean(data.tcGravida), detailLabel: null, detailValue: null, highlight: data.tcGravida === true },
      { label: "Amamentando", value: formatBoolean(data.tcAmamentando), detailLabel: null, detailValue: null, highlight: false },
      y
    );

    // Linha 2: Uso de metformina | Marcapasso/Desfibrilador
    y = addFieldPair(
      { label: "Uso de metformina", value: formatBoolean(data.tcUsaMetformina), detailLabel: null, detailValue: null, highlight: false },
      { label: "Marcapasso/Desfibrilador", value: formatBoolean(data.tcMarcapasso), detailLabel: null, detailValue: null, highlight: data.tcMarcapasso === true },
      y
    );

    // Linha 3: Alergia ao contraste TC | Cirurgia renal
    y = addFieldPair(
      { label: "Alergia ao contraste TC", value: formatBoolean(data.tcAlergiaContraste), detailLabel: null, detailValue: null, highlight: data.tcAlergiaContraste === true },
      { label: "Cirurgia renal", value: formatBoolean(data.tcCirurgiaRenal), detailLabel: null, detailValue: null, highlight: data.tcCirurgiaRenal === true },
      y
    );

    // Linha 4: Doença renal (sozinho)
    y = addFieldPair(
      { label: "Doença renal", value: formatBoolean(data.tcDoencaRenal), detailLabel: null, detailValue: null, highlight: data.tcDoencaRenal === true },
      { label: "", value: "", detailLabel: null, detailValue: null },
      y
    );
  } else {
    // Masculino: sem campos de gravidez/amamentação

    // Linha 1: Uso de metformina | Marcapasso/Desfibrilador
    y = addFieldPair(
      { label: "Uso de metformina", value: formatBoolean(data.tcUsaMetformina), detailLabel: null, detailValue: null, highlight: false },
      { label: "Marcapasso/Desfibrilador", value: formatBoolean(data.tcMarcapasso), detailLabel: null, detailValue: null, highlight: data.tcMarcapasso === true },
      y
    );

    // Linha 2: Alergia ao contraste TC | Cirurgia renal
    y = addFieldPair(
      { label: "Alergia ao contraste TC", value: formatBoolean(data.tcAlergiaContraste), detailLabel: null, detailValue: null, highlight: data.tcAlergiaContraste === true },
      { label: "Cirurgia renal", value: formatBoolean(data.tcCirurgiaRenal), detailLabel: null, detailValue: null, highlight: data.tcCirurgiaRenal === true },
      y
    );

    // Linha 3: Doença renal (sozinho)
    y = addFieldPair(
      { label: "Doença renal", value: formatBoolean(data.tcDoencaRenal), detailLabel: null, detailValue: null, highlight: data.tcDoencaRenal === true },
      { label: "", value: "", detailLabel: null, detailValue: null },
      y
    );
  }

  return y;
}

export function renderTomografiaClinicalFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addCompactDataRow, addMotivoField, addClinicalField, addFieldPair, formatBoolean } = ctx;
  let y = ctx.yPos;

  // Regiões do exame (full width, usando addMotivoField para não cortar texto)
  const regioesText = formatRegioes(data.regioesExame);
  y = addMotivoField("Regiões do exame", regioesText, leftX, y, contentWidth);

  // Motivo do Exame (full width, área maior para texto longo)
  y = addMotivoField("Motivo do Exame", data.motivoExame || '-', leftX, y, contentWidth);

  // Trauma na região a ser examinada (full width)
  addCompactDataRow("Trauma na região a ser examinada", formatBoolean(data.traumaRegiao), leftX, y, contentWidth, data.traumaRegiao === true);
  y += 8;

  // Cirurgia no corpo + Detalhes (full width com área para detalhes)
  y = addClinicalField(
    "Cirurgia no corpo",
    formatBoolean(data.cirurgiaCorpo),
    "Detalhes",
    data.cirurgiaCorpoDetalhes || '-',
    leftX,
    y,
    contentWidth,
    data.cirurgiaCorpo === true
  );

  // Histórico de câncer + Detalhes (full width com área para detalhes)
  y = addClinicalField(
    "Histórico de câncer",
    formatBoolean(data.historicoCancer),
    "Detalhes",
    data.historicoCancerDetalhes || '-',
    leftX,
    y,
    contentWidth,
    data.historicoCancer === true
  );

  // Campos específicos para masculino
  const isMasculino = data.sexo === 'masculino';

  if (isMasculino) {
    // Problema de próstata | Dificuldade urinária
    y = addFieldPair(
      { label: "Problema de próstata", value: formatBoolean(data.problemaProstata), detailLabel: null, detailValue: null, highlight: data.problemaProstata === true },
      { label: "Dificuldade urinária", value: formatBoolean(data.dificuldadeUrinaria), detailLabel: null, detailValue: null, highlight: data.dificuldadeUrinaria === true },
      y
    );
  }

  return y;
}
