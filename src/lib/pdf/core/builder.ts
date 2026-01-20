import { QuestionnaireData } from "@/types/questionnaire";
import { formatCpf } from "@/lib/utils";
import { PDFLayout, RenderContext, ExameConfig, Assinaturas } from "./types";
import { COLORS } from "./constants";
import { formatBoolean, formatDate } from "./formatters";
import { createLayout, addHeader, addSection, addFooter, addCompactDataRow } from "./layout";

// Engine principal que monta o PDF baseado na configuração do exame
export function buildExamePDF(
  data: QuestionnaireData,
  config: ExameConfig,
  assinaturas?: Assinaturas
): Blob {
  const layout = createLayout();
  const { doc, pageWidth, pageHeight, margin, contentWidth } = layout;

  let yPos = 15;

  const gap = 8;
  const columnWidth = (contentWidth - gap) / 2;
  const leftX = margin;
  const rightX = margin + columnWidth + gap;

  // Função auxiliar para adicionar campo clínico com suporte a texto longo
  const addClinicalField = (
    mainLabel: string,
    mainValue: string,
    detailLabel: string | null,
    detailValue: string | null,
    x: number,
    y: number,
    width: number,
    isHighlight: boolean = false
  ): number => {
    const lineHeight = 4;
    const padding = 3;
    const valueWidth = width * 0.42;

    doc.setFontSize(7.5);

    let detailLines: string[] = [];
    if (detailLabel && detailValue && detailValue !== '-') {
      detailLines = doc.splitTextToSize(detailValue, valueWidth);
    }

    const mainLineHeight = 6;
    const detailHeight = detailLabel ? Math.max(6, (detailLines.length > 0 ? detailLines.length * lineHeight + 2 : 6)) : 0;
    const totalHeight = mainLineHeight + detailHeight + 2;

    doc.setFillColor(...COLORS.background);
    doc.roundedRect(x, y - 4, width, totalHeight, 1, 1, 'F');

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    doc.text(mainLabel, x + padding, y);

    doc.setTextColor(isHighlight ? 180 : COLORS.text[0], isHighlight ? 50 : COLORS.text[1], isHighlight ? 50 : COLORS.text[2]);
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    doc.text(mainValue || '-', x + width - padding, y, { align: "right" });

    if (detailLabel) {
      const detailY = y + mainLineHeight;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textLight);
      doc.text(detailLabel, x + padding, detailY);

      doc.setTextColor(...COLORS.text);
      if (detailLines.length > 0) {
        let lineY = detailY;
        for (const line of detailLines) {
          doc.text(line, x + width - padding, lineY, { align: "right" });
          lineY += lineHeight;
        }
      } else {
        doc.text(detailValue || '-', x + width - padding, detailY, { align: "right" });
      }
    }

    return y + totalHeight + 2;
  };

  // Função auxiliar para adicionar campo de motivo
  const addMotivoField = (label: string, value: string, x: number, y: number, width: number): number => {
    const lineHeight = 4;
    const padding = 3;

    doc.setFontSize(7.5);

    const valueLines = doc.splitTextToSize(value || '-', width - 60);
    const totalHeight = Math.max(7, valueLines.length * lineHeight + 4);

    doc.setFillColor(...COLORS.background);
    doc.roundedRect(x, y - 4, width, totalHeight, 1, 1, 'F');

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    doc.text(label, x + padding, y);

    doc.setTextColor(...COLORS.text);
    let lineY = y;
    for (const line of valueLines) {
      doc.text(line, x + width - padding, lineY, { align: "right" });
      lineY += lineHeight;
    }

    return y + totalHeight + 2;
  };

  // Função para renderizar par de campos
  const addFieldPair = (
    leftField: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean },
    rightField: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean },
    startY: number
  ): number => {
    const leftEndY = addClinicalField(
      leftField.label, leftField.value,
      leftField.detailLabel, leftField.detailValue,
      leftX, startY, columnWidth, leftField.highlight
    );

    const rightEndY = addClinicalField(
      rightField.label, rightField.value,
      rightField.detailLabel, rightField.detailValue,
      rightX, startY, columnWidth, rightField.highlight
    );

    return Math.max(leftEndY, rightEndY);
  };

  // Função para renderizar linha de 3 colunas simples
  const threeColGap = 6;
  const threeColWidth = (contentWidth - threeColGap * 2) / 3;
  const col1X = margin;
  const col2X = margin + threeColWidth + threeColGap;
  const col3X = margin + (threeColWidth + threeColGap) * 2;

  const addThreeColumnRow = (
    col1: { label: string; value: string; highlight?: boolean },
    col2: { label: string; value: string; highlight?: boolean },
    col3: { label: string; value: string; highlight?: boolean } | null,
    startY: number
  ): number => {
    addCompactDataRow(layout, col1.label, col1.value, col1X, startY, threeColWidth, col1.highlight);
    addCompactDataRow(layout, col2.label, col2.value, col2X, startY, threeColWidth, col2.highlight);
    if (col3) {
      addCompactDataRow(layout, col3.label, col3.value, col3X, startY, threeColWidth, col3.highlight);
    }
    return startY + 8;
  };

  // Função para renderizar linha de 3 colunas com detalhes
  const addThreeColumnFieldRow = (
    col1: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    col2: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    col3: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    startY: number
  ): number => {
    let maxEndY = startY;

    if (col1) {
      const endY = addClinicalField(
        col1.label, col1.value, col1.detailLabel, col1.detailValue,
        col1X, startY, threeColWidth, col1.highlight
      );
      maxEndY = Math.max(maxEndY, endY);
    }

    if (col2) {
      const endY = addClinicalField(
        col2.label, col2.value, col2.detailLabel, col2.detailValue,
        col2X, startY, threeColWidth, col2.highlight
      );
      maxEndY = Math.max(maxEndY, endY);
    }

    if (col3) {
      const endY = addClinicalField(
        col3.label, col3.value, col3.detailLabel, col3.detailValue,
        col3X, startY, threeColWidth, col3.highlight
      );
      maxEndY = Math.max(maxEndY, endY);
    }

    return maxEndY;
  };

  // Contexto de renderização para os campos específicos
  const createRenderContext = (currentY: number): RenderContext => ({
    layout,
    data,
    yPos: currentY,
    leftX,
    rightX,
    columnWidth,
    contentWidth,
    margin,
    addCompactDataRow: (label, value, x, y, width, isHighlight) =>
      addCompactDataRow(layout, label, value, x, y, width, isHighlight),
    addClinicalField,
    addMotivoField,
    addFieldPair,
    addThreeColumnRow,
    addThreeColumnFieldRow,
    formatBoolean,
  });

  // ========== PÁGINA 1 - DADOS ==========
  yPos = addHeader(layout, config.badgeLabel, yPos);

  // Timestamp
  const now = new Date();
  const currentDate = now.toLocaleDateString('pt-BR');
  const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${currentDate} às ${currentTime}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 10;

  // DADOS PESSOAIS
  yPos = addSection(layout, "DADOS PESSOAIS", yPos);

  addCompactDataRow(layout, "Nome do Paciente", data.nome || '-', leftX, yPos, columnWidth);
  addCompactDataRow(layout, "Telefone", data.telefone || '-', rightX, yPos, columnWidth);
  yPos += 8;

  addCompactDataRow(layout, "Data de Nascimento", formatDate(data.dataNascimento), leftX, yPos, columnWidth);
  addCompactDataRow(layout, "CPF", formatCpf(data.cpf) || '-', rightX, yPos, columnWidth);
  yPos += 8;

  const sexoLabel = data.sexo === 'masculino' ? 'Masculino' : data.sexo === 'feminino' ? 'Feminino' : '-';
  addCompactDataRow(layout, "Sexo", sexoLabel, leftX, yPos, columnWidth);
  addCompactDataRow(layout, "Tipo de Exame", config.badgeLabel, rightX, yPos, columnWidth);
  yPos += 8;

  const pesoAltura = data.peso && data.altura ? `${data.peso} kg, ${data.altura} cm` : '-';
  addCompactDataRow(layout, "Peso e altura", pesoAltura, leftX, yPos, columnWidth);
  addCompactDataRow(layout, "Data do Exame", formatDate(data.dataExame), rightX, yPos, columnWidth);
  yPos += 12;

  // QUESTÕES DE SEGURANÇA (específico por exame)
  yPos = addSection(layout, "QUESTÕES DE SEGURANÇA", yPos);
  yPos = config.renderSecurityFields(createRenderContext(yPos));

  // QUESTÕES CLÍNICAS (específico por exame)
  yPos = addSection(layout, "QUESTÕES CLÍNICAS", yPos);
  yPos = config.renderClinicalFields(createRenderContext(yPos));

  addFooter(layout, 1, 3);

  // ========== PÁGINA 2 - TERMO DE CONSENTIMENTO ==========
  doc.addPage();
  yPos = addHeader(layout, "TERMO DE CONSENTIMENTO", 15);
  yPos += 3;

  // Título do termo
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(config.termo.titulo, margin, yPos);
  yPos += 6;

  // Renderizar cada seção do termo (sem paginação - deve caber em 1 página)
  for (const secao of config.termo.secoes) {
    // Título da seção
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(secao.titulo, margin, yPos);
    yPos += 4;

    // Texto da seção
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const textoLines = doc.splitTextToSize(secao.texto, contentWidth);
    textoLines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 3.5;
    });

    // Bullets (se houver)
    if (secao.bullets) {
      yPos += 1;
      for (const bullet of secao.bullets) {
        doc.text(`  • ${bullet}`, margin, yPos);
        yPos += 3.5;
      }
    }

    // Texto adicional (se houver)
    if (secao.textoAdicional) {
      yPos += 1;
      const textoAdicionalLines = doc.splitTextToSize(secao.textoAdicional, contentWidth);
      textoAdicionalLines.forEach((line: string) => {
        doc.text(line, margin, yPos);
        yPos += 3.5;
      });
    }

    yPos += 2;
  }

  addFooter(layout, 2, 3);

  // ========== PÁGINA 3 - CONSENTIMENTO E ASSINATURAS ==========
  doc.addPage();
  yPos = addHeader(layout, "CONSENTIMENTO", 15);
  yPos += 5;

  // Header com dados do paciente
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos - 4, contentWidth, 18, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(`Paciente: ${data.nome || '-'}`, margin + 5, yPos + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`CPF: ${formatCpf(data.cpf) || '-'}`, margin + 5, yPos + 9);
  doc.text(`Exame: ${config.badgeLabel}`, margin + 70, yPos + 9);
  doc.text(`Data: ${formatDate(data.dataExame)}`, margin + 130, yPos + 9);

  yPos += 22;

  // DECLARAÇÃO DE CONSENTIMENTO
  yPos = addSection(layout, "DECLARAÇÃO DE CONSENTIMENTO", yPos);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const declaracoes = [
    "Declaro que fui informado(a) sobre o procedimento do exame, seus benefícios e possíveis riscos.",
    "Autorizo a realização do exame conforme indicação médica e orientações da equipe técnica.",
    "Confirmo que todas as informações fornecidas neste questionário são verdadeiras e completas.",
    "Estou ciente de que a omissão ou falsidade de informações pode comprometer a segurança do exame.",
  ];

  declaracoes.forEach(texto => {
    const lines = doc.splitTextToSize(`• ${texto}`, contentWidth - 10);
    lines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 5;
    });
    yPos += 2;
  });

  yPos += 5;

  // Campos de aceite
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos - 4, contentWidth, 20, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Aceita os riscos do procedimento:", margin + 5, yPos + 2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.aceitaRiscos ? 34 : 180, data.aceitaRiscos ? 139 : 50, data.aceitaRiscos ? 34 : 50);
  doc.text(formatBoolean(data.aceitaRiscos), pageWidth - margin - 5, yPos + 2, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Aceita Termo LGPD:", margin + 5, yPos + 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.aceitaCompartilhamento ? 34 : 180, data.aceitaCompartilhamento ? 139 : 50, data.aceitaCompartilhamento ? 34 : 50);
  doc.text(formatBoolean(data.aceitaCompartilhamento), pageWidth - margin - 5, yPos + 10, { align: "right" });

  yPos += 28;

  // ASSINATURAS (Grid 2x2)
  yPos = addSection(layout, "ASSINATURAS", yPos);

  const signGap = 10;
  const signWidth = (contentWidth - signGap) / 2;
  const signHeight = 35;

  // Linha 1: Paciente | Assistente
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("PACIENTE", leftX, yPos);
  doc.text("ASSISTENTE", rightX, yPos);
  yPos += 4;

  // Caixa Paciente
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(leftX, yPos, signWidth, signHeight, 2, 2, 'FD');

  if (assinaturas?.paciente && assinaturas.paciente.startsWith('data:image')) {
    try {
      const imgFormat = assinaturas.paciente.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(assinaturas.paciente, imgFormat, leftX + 2, yPos + 2, signWidth - 4, signHeight - 8);
    } catch {
      // Erro ao adicionar imagem - caixa fica vazia
    }
  }

  // Caixa Assistente
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(rightX, yPos, signWidth, signHeight, 2, 2, 'FD');

  if (assinaturas?.assistente && assinaturas.assistente.startsWith('data:image')) {
    try {
      const imgFormat = assinaturas.assistente.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(assinaturas.assistente, imgFormat, rightX + 2, yPos + 2, signWidth - 4, signHeight - 8);
    } catch {
      // Erro ao adicionar imagem - caixa fica vazia
    }
  }

  yPos += signHeight + 3;

  // Nomes abaixo dos slots (Paciente | Assistente)
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text(`Nome: ${data.nome || '_______________________'}`, leftX, yPos);
  doc.text(`Nome: ${assinaturas?.nomeAssistente || '_______________________'}`, rightX, yPos);

  yPos += 4;

  // Registro profissional do assistente
  doc.setFontSize(6);
  doc.text("", leftX, yPos); // Paciente não tem registro
  if (assinaturas?.registroAssistente) {
    doc.text(assinaturas.registroAssistente, rightX, yPos);
  }

  yPos += 6;

  // Linha 2: Responsável | Operador
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("RESPONSÁVEL", leftX, yPos);
  doc.text("OPERADOR", rightX, yPos);
  yPos += 4;

  // Caixa Responsável (vazia por enquanto)
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(leftX, yPos, signWidth, signHeight, 2, 2, 'FD');

  // Caixa Operador
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(rightX, yPos, signWidth, signHeight, 2, 2, 'FD');

  if (assinaturas?.operador && assinaturas.operador.startsWith('data:image')) {
    try {
      const imgFormat = assinaturas.operador.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(assinaturas.operador, imgFormat, rightX + 2, yPos + 2, signWidth - 4, signHeight - 8);
    } catch {
      // Erro ao adicionar imagem - caixa fica vazia
    }
  }

  yPos += signHeight + 3;

  // Nomes abaixo dos slots (Responsável | Operador)
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nome: _______________________", leftX, yPos);
  doc.text(`Nome: ${assinaturas?.nomeOperador || '_______________________'}`, rightX, yPos);

  yPos += 4;

  // Registro profissional do operador
  doc.setFontSize(6);
  doc.text("", leftX, yPos); // Responsável não tem registro
  if (assinaturas?.registroOperador) {
    doc.text(assinaturas.registroOperador, rightX, yPos);
  }

  yPos += 6;

  // Data e local
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.text(`Local: _________________________________, Data: ${currentDate}`, margin, yPos);

  addFooter(layout, 3, 3);

  return doc.output('blob');
}
