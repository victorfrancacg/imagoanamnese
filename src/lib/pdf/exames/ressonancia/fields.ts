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

export function renderRessonanciaSecurityFields(ctx: RenderContext): number {
  const { data, addThreeColumnRow, formatBoolean } = ctx;
  let y = ctx.yPos;

  const isFeminino = data.sexo === 'feminino';

  if (isFeminino) {
    // Feminino: Gravidez | Amamentando | Eletroestimulador
    y = addThreeColumnRow(
      { label: "Gravidez", value: formatBoolean(data.rmGravida), highlight: data.rmGravida === true },
      { label: "Amamentando", value: formatBoolean(data.rmAmamentando), highlight: data.rmAmamentando === true },
      { label: "Eletroestimulador implantado", value: formatBoolean(data.rmEletroestimulador), highlight: data.rmEletroestimulador === true },
      y
    );
  } else {
    // Masculino: Eletroestimulador | Implante medicamentoso | Marcapasso
    y = addThreeColumnRow(
      { label: "Eletroestimulador implantado", value: formatBoolean(data.rmEletroestimulador), highlight: data.rmEletroestimulador === true },
      { label: "Implante medicamentoso", value: formatBoolean(data.rmImplanteMedicamentoso), highlight: data.rmImplanteMedicamentoso === true },
      { label: "Marcapasso/Desfibrilador", value: formatBoolean(data.rmMarcapasso), highlight: data.rmMarcapasso === true },
      y
    );
  }

  if (isFeminino) {
    // Implante medicamentoso | Marcapasso/Desfibrilador | Expansor tecidual
    y = addThreeColumnRow(
      { label: "Implante medicamentoso", value: formatBoolean(data.rmImplanteMedicamentoso), highlight: data.rmImplanteMedicamentoso === true },
      { label: "Marcapasso/Desfibrilador", value: formatBoolean(data.rmMarcapasso), highlight: data.rmMarcapasso === true },
      { label: "Expansor tecidual", value: formatBoolean(data.rmExpansorTecidual), highlight: data.rmExpansorTecidual === true },
      y
    );
  } else {
    // Expansor tecidual | Fragmento metálico | Implante coclear
    y = addThreeColumnRow(
      { label: "Expansor tecidual", value: formatBoolean(data.rmExpansorTecidual), highlight: data.rmExpansorTecidual === true },
      { label: "Fragmento metálico/Projétil", value: formatBoolean(data.rmFragmentoMetalico), highlight: data.rmFragmentoMetalico === true },
      { label: "Implante coclear/eletrônico", value: formatBoolean(data.rmImplanteCoclear), highlight: data.rmImplanteCoclear === true },
      y
    );
  }

  if (isFeminino) {
    // Fragmento metálico | Implante coclear | Tatuagem recente
    y = addThreeColumnRow(
      { label: "Fragmento metálico/Projétil", value: formatBoolean(data.rmFragmentoMetalico), highlight: data.rmFragmentoMetalico === true },
      { label: "Implante coclear/eletrônico", value: formatBoolean(data.rmImplanteCoclear), highlight: data.rmImplanteCoclear === true },
      { label: "Tatuagem recente (<15 dias)", value: formatBoolean(data.rmTatuagemRecente), highlight: data.rmTatuagemRecente === true },
      y
    );
  } else {
    // Tatuagem recente | Lesão ocular | Clipe gástrico
    y = addThreeColumnRow(
      { label: "Tatuagem recente (<15 dias)", value: formatBoolean(data.rmTatuagemRecente), highlight: data.rmTatuagemRecente === true },
      { label: "Lesão ocular por metal", value: formatBoolean(data.rmLesaoOlhoMetal), highlight: data.rmLesaoOlhoMetal === true },
      { label: "Clipe gástrico/esofágico", value: formatBoolean(data.rmClipeGastrico), highlight: data.rmClipeGastrico === true },
      y
    );
  }

  if (isFeminino) {
    // Lesão ocular | Clipe gástrico | Clipe aneurisma
    y = addThreeColumnRow(
      { label: "Lesão ocular por metal", value: formatBoolean(data.rmLesaoOlhoMetal), highlight: data.rmLesaoOlhoMetal === true },
      { label: "Clipe gástrico/esofágico", value: formatBoolean(data.rmClipeGastrico), highlight: data.rmClipeGastrico === true },
      { label: "Clipe de aneurisma", value: formatBoolean(data.rmClipeAneurisma), highlight: data.rmClipeAneurisma === true },
      y
    );
  } else {
    // Clipe aneurisma | Cirurgia renal | Doença renal
    y = addThreeColumnRow(
      { label: "Clipe de aneurisma", value: formatBoolean(data.rmClipeAneurisma), highlight: data.rmClipeAneurisma === true },
      { label: "Cirurgia renal", value: formatBoolean(data.rmCirurgiaRenal), highlight: data.rmCirurgiaRenal === true },
      { label: "Doença renal", value: formatBoolean(data.rmDoencaRenal), highlight: data.rmDoencaRenal === true },
      y
    );
  }

  if (isFeminino) {
    // Cirurgia renal | Doença renal | Alergia ao contraste RM
    y = addThreeColumnRow(
      { label: "Cirurgia renal", value: formatBoolean(data.rmCirurgiaRenal), highlight: data.rmCirurgiaRenal === true },
      { label: "Doença renal", value: formatBoolean(data.rmDoencaRenal), highlight: data.rmDoencaRenal === true },
      { label: "Alergia ao contraste RM", value: formatBoolean(data.rmAlergiaContraste), highlight: data.rmAlergiaContraste === true },
      y
    );
  } else {
    // Alergia ao contraste RM (sozinho na última linha para masculino)
    y = addThreeColumnRow(
      { label: "Alergia ao contraste RM", value: formatBoolean(data.rmAlergiaContraste), highlight: data.rmAlergiaContraste === true },
      { label: "", value: "" },
      null,
      y
    );
  }

  return y;
}

export function renderRessonanciaClinicalFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addCompactDataRow, addMotivoField, addFieldPair, formatBoolean } = ctx;
  let y = ctx.yPos;

  // Regiões do exame (full width, usando addMotivoField para não cortar texto)
  const regioesText = formatRegioes(data.regioesExame);
  y = addMotivoField("Regiões do exame", regioesText, leftX, y, contentWidth);

  // Motivo do Exame (full width)
  y = addMotivoField("Motivo do Exame", data.motivoExame || '-', leftX, y, contentWidth);

  // Trauma na região (full width, simples)
  addCompactDataRow("Trauma na região", formatBoolean(data.traumaRegiao), leftX, y, contentWidth, data.traumaRegiao === true);
  y += 8;

  // Cirurgia no corpo + Detalhes | Histórico de câncer + Detalhes
  y = addFieldPair(
    { label: "Cirurgia no corpo", value: formatBoolean(data.cirurgiaCorpo), detailLabel: "Detalhes", detailValue: data.cirurgiaCorpoDetalhes || '-', highlight: data.cirurgiaCorpo === true },
    { label: "Histórico de câncer", value: formatBoolean(data.historicoCancer), detailLabel: "Detalhes", detailValue: data.historicoCancerDetalhes || '-', highlight: data.historicoCancer === true },
    y
  );

  // Exames relacionados + Detalhes | Dificuldade urinária (masculino)
  const isMasculino = data.sexo === 'masculino';

  if (isMasculino) {
    y = addFieldPair(
      { label: "Exames relacionados", value: formatBoolean(data.examesRelacionados), detailLabel: "Detalhes", detailValue: data.examesRelacionadosDetalhes || '-', highlight: false },
      { label: "Dificuldades urinárias", value: formatBoolean(data.dificuldadeUrinaria), detailLabel: null, detailValue: null, highlight: data.dificuldadeUrinaria === true },
      y
    );
  } else {
    y = addFieldPair(
      { label: "Exames relacionados", value: formatBoolean(data.examesRelacionados), detailLabel: "Detalhes", detailValue: data.examesRelacionadosDetalhes || '-', highlight: false },
      { label: "", value: "", detailLabel: null, detailValue: null },
      y
    );
  }

  return y;
}
