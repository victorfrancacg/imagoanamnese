import jsPDF from "jspdf";
import { QuestionnaireData } from "@/types/questionnaire";
import imagoLogo from "@/assets/imago-logo.png";
import { formatCpf } from "./utils";

// ============================================================
// CONSTANTES GLOBAIS
// ============================================================

const COLORS = {
  primary: [59, 100, 143] as [number, number, number],
  primaryDark: [47, 79, 114] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  textLight: [120, 120, 120] as [number, number, number],
  border: [200, 210, 220] as [number, number, number],
  background: [245, 248, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const EXAM_LABELS: Record<string, string> = {
  'tomografia': 'TOMOGRAFIA',
  'ressonancia': 'RESSONÂNCIA',
  'densitometria': 'DENSITOMETRIA',
  'mamografia': 'MAMOGRAFIA',
};

// ============================================================
// INTERFACES E TIPOS
// ============================================================

interface PDFLayout {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  logoWidth: number;
  logoHeight: number;
  badgePadding: number;
}

interface TermoSecao {
  titulo: string;
  texto: string;
  bullets?: string[];
  textoAdicional?: string;
}

interface TermoConsentimento {
  titulo: string;
  secoes: TermoSecao[];
}

interface Assinaturas {
  paciente?: string;
  responsavel?: string;
  assistente?: string;
  operador?: string;
}

// Contexto de renderização passado para as funções de campos
interface RenderContext {
  layout: PDFLayout;
  data: QuestionnaireData;
  yPos: number;
  leftX: number;
  rightX: number;
  columnWidth: number;
  contentWidth: number;
  margin: number;
  // Funções auxiliares
  addCompactDataRow: (label: string, value: string, x: number, y: number, width: number, isHighlight?: boolean) => void;
  addClinicalField: (
    mainLabel: string,
    mainValue: string,
    detailLabel: string | null,
    detailValue: string | null,
    x: number,
    y: number,
    width: number,
    isHighlight?: boolean
  ) => number;
  addMotivoField: (label: string, value: string, x: number, y: number, width: number) => number;
  addFieldPair: (
    leftField: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean },
    rightField: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean },
    startY: number
  ) => number;
  // Funções para layout de 3 colunas
  addThreeColumnRow: (
    col1: { label: string; value: string; highlight?: boolean },
    col2: { label: string; value: string; highlight?: boolean },
    col3: { label: string; value: string; highlight?: boolean } | null,
    startY: number
  ) => number;
  addThreeColumnFieldRow: (
    col1: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    col2: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    col3: { label: string; value: string; detailLabel: string | null; detailValue: string | null; highlight?: boolean } | null,
    startY: number
  ) => number;
  formatBoolean: (value: boolean | null) => string;
}

// Configuração de um tipo de exame
interface ExameConfig {
  tipoExame: string;
  badgeLabel: string;
  termo: TermoConsentimento;
  renderSecurityFields: (ctx: RenderContext) => number;
  renderClinicalFields: (ctx: RenderContext) => number;
}

// ============================================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================================

function formatBoolean(value: boolean | null): string {
  if (value === null) return '-';
  return value ? 'Sim' : 'Não';
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// ============================================================
// HELPERS DE RENDERIZAÇÃO
// ============================================================

function createLayout(): PDFLayout {
  const doc = new jsPDF();
  return {
    doc,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: 15,
    contentWidth: doc.internal.pageSize.getWidth() - 30,
    logoWidth: 45,
    logoHeight: 13,
    badgePadding: 16,
  };
}

function addHeader(layout: PDFLayout, badgeText: string, yStart: number = 15): number {
  const { doc, pageWidth, margin, logoWidth, logoHeight, badgePadding } = layout;
  let y = yStart;

  try {
    doc.addImage(imagoLogo, 'PNG', margin, y, logoWidth, logoHeight, undefined, 'FAST');
  } catch {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("IMAGO", margin, y + 9);
  }

  doc.setFontSize(10);
  const badgeTextWidth = doc.getTextWidth(badgeText);
  const badgeWidth = badgeTextWidth + badgePadding;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = y + 2;

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 10, 3, 3, 'F');

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(badgeText, badgeX + badgeWidth / 2, badgeY + 7, { align: "center" });

  y += logoHeight + 8;

  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);

  return y + 8;
}

function addSection(layout: PDFLayout, title: string, y: number): number {
  const { doc, pageWidth, margin, contentWidth } = layout;

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y - 5, contentWidth, 8, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(title, pageWidth / 2, y, { align: "center" });
  return y + 12;
}

function addFooter(layout: PDFLayout, pageNum: number, totalPages: number): void {
  const { doc, pageWidth, pageHeight, margin } = layout;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text(`IMAGO Diagnóstico por Imagem - Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
}

function addCompactDataRow(
  layout: PDFLayout,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  isHighlight: boolean = false
): void {
  const { doc } = layout;

  doc.setFillColor(...COLORS.background);
  doc.roundedRect(x, y - 4, width, 7, 1, 1, 'F');

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);

  const maxLabelWidth = width * 0.6;
  let displayLabel = label;
  while (doc.getTextWidth(displayLabel) > maxLabelWidth && displayLabel.length > 3) {
    displayLabel = displayLabel.slice(0, -4) + '...';
  }
  doc.text(displayLabel, x + 3, y);

  doc.setTextColor(isHighlight ? 180 : COLORS.text[0], isHighlight ? 50 : COLORS.text[1], isHighlight ? 50 : COLORS.text[2]);
  doc.setFont("helvetica", isHighlight ? "bold" : "normal");

  const maxValueWidth = width * 0.35;
  let displayValue = value;
  while (doc.getTextWidth(displayValue) > maxValueWidth && displayValue.length > 3) {
    displayValue = displayValue.slice(0, -4) + '...';
  }
  doc.text(displayValue, x + width - 3, y, { align: "right" });
}

// ============================================================
// FUNÇÃO BASE PARAMETRIZADA
// ============================================================

function buildExamePDF(
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
  yPos += 5;

  // Título do termo
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(config.termo.titulo, margin, yPos);
  yPos += 8;

  // Renderizar cada seção do termo
  for (const secao of config.termo.secoes) {
    if (yPos > pageHeight - 35) {
      addFooter(layout, 2, 3);
      doc.addPage();
      yPos = addHeader(layout, "TERMO DE CONSENTIMENTO", 15);
      yPos += 5;
    }

    // Título da seção
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(secao.titulo, margin, yPos);
    yPos += 5;

    // Texto da seção
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const textoLines = doc.splitTextToSize(secao.texto, contentWidth);
    textoLines.forEach((line: string) => {
      if (yPos > pageHeight - 25) {
        addFooter(layout, 2, 3);
        doc.addPage();
        yPos = addHeader(layout, "TERMO DE CONSENTIMENTO", 15);
        yPos += 5;
      }
      doc.text(line, margin, yPos);
      yPos += 4;
    });

    // Bullets (se houver)
    if (secao.bullets) {
      yPos += 2;
      for (const bullet of secao.bullets) {
        if (yPos > pageHeight - 25) {
          addFooter(layout, 2, 3);
          doc.addPage();
          yPos = addHeader(layout, "TERMO DE CONSENTIMENTO", 15);
          yPos += 5;
        }
        doc.text(`  • ${bullet}`, margin, yPos);
        yPos += 4;
      }
    }

    // Texto adicional (se houver)
    if (secao.textoAdicional) {
      yPos += 2;
      const textoAdicionalLines = doc.splitTextToSize(secao.textoAdicional, contentWidth);
      textoAdicionalLines.forEach((line: string) => {
        doc.text(line, margin, yPos);
        yPos += 4;
      });
    }

    yPos += 4;
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

  // Caixa Assistente (vazia para mamografia, preenchida para RM/TC)
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
  doc.text("Nome: _______________________", rightX, yPos);

  yPos += 8;

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
  doc.text("Nome: _______________________", rightX, yPos);

  yPos += 8;

  // Data e local
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.text(`Local: _________________________________, Data: ${currentDate}`, margin, yPos);

  addFooter(layout, 3, 3);

  return doc.output('blob');
}

// ============================================================
// CONFIGURAÇÕES ESPECÍFICAS POR EXAME
// ============================================================

// ----- MAMOGRAFIA -----

const TERMO_MAMOGRAFIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE MAMOGRAFIA",
  secoes: [
    {
      titulo: "1. DO EXAME DE MAMOGRAFIA",
      texto: "A mamografia é um exame de diagnóstico por imagem que utiliza raios X em baixa dose para avaliação das mamas, sendo o principal método para rastreamento, detecção precoce e acompanhamento de doenças mamárias, incluindo o câncer de mama. O exame permite a identificação de alterações como nódulos, assimetrias, distorções arquiteturais e microcalcificações, muitas vezes antes do surgimento de sintomas clínicos."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico denominado mamógrafo, projetado para obtenção de imagens detalhadas do tecido mamário com controle rigoroso da dose de radiação. Durante o procedimento, cada mama é posicionada individualmente no aparelho e submetida à compressão controlada, necessária para:",
      bullets: [
        "Reduzir a espessura do tecido mamário;",
        "Melhorar a qualidade e nitidez das imagens;",
        "Diminuir a dose de radiação;",
        "Evitar sobreposição de estruturas."
      ]
    },
    {
      titulo: "3. DA COMPRESSÃO MAMÁRIA",
      texto: "A compressão das mamas é uma etapa essencial do exame. Pode causar desconforto ou dor transitória, variável conforme a sensibilidade individual, o período do ciclo menstrual e condições pré-existentes. O desconforto é temporário e cessa imediatamente após o término da compressão."
    },
    {
      titulo: "4. DO TEMPO DE REALIZAÇÃO",
      texto: "O tempo médio do exame é de aproximadamente 10 a 20 minutos, podendo variar conforme a necessidade de incidências adicionais ou complementares."
    },
    {
      titulo: "5. DOS RISCOS E SEGURANÇA",
      texto: "A mamografia é considerada um exame seguro, realizado com baixa dose de radiação, dentro dos limites estabelecidos por normas nacionais e internacionais de radioproteção. Apesar da baixa exposição, o exame deve ser realizado conforme indicação médica, especialmente em gestantes ou em caso de suspeita de gravidez, situação que deve ser comunicada previamente à equipe."
    },
    {
      titulo: "6. DA MAMOGRAFIA EM PACIENTES COM PRÓTESES MAMÁRIAS",
      texto: "Em pacientes portadoras de próteses mamárias, a mamografia pode apresentar limitações técnicas, exigindo manobras específicas e incidências adicionais para melhor avaliação do tecido mamário residual. Embora raríssimo, existe risco mínimo de:",
      bullets: [
        "Deslocamento da prótese;",
        "Dano ou ruptura da prótese durante a compressão."
      ],
      textoAdicional: "A correta informação sobre a presença de próteses, tipo de implante e histórico cirúrgico é fundamental para a segurança do exame e adequada condução técnica."
    },
    {
      titulo: "7. DE FATORES QUE PODEM INTERFERIR NO EXAME",
      texto: "Algumas condições podem interferir na qualidade das imagens ou na interpretação diagnóstica, tais como:",
      bullets: [
        "Cirurgias mamárias prévias;",
        "Presença de próteses, expansores ou materiais cirúrgicos;",
        "Processos inflamatórios;",
        "Alterações hormonais;",
        "Uso recente de desodorantes, cremes ou talcos na região das mamas e axilas, que devem ser evitados no dia do exame."
      ]
    },
    {
      titulo: "8. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens e informações obtidas destinam-se exclusivamente à finalidade diagnóstica, respeitando-se o sigilo profissional, os princípios éticos e a legislação vigente, especialmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)."
    }
  ]
};

function renderMamografiaSecurityFields(ctx: RenderContext): number {
  const { data, leftX, contentWidth, addCompactDataRow, formatBoolean } = ctx;
  let y = ctx.yPos;

  addCompactDataRow("Gravidez", formatBoolean(data.gravida), leftX, y, contentWidth, data.gravida === true);
  y += 12;

  return y;
}

function renderMamografiaClinicalFields(ctx: RenderContext): number {
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

const MAMOGRAFIA_CONFIG: ExameConfig = {
  tipoExame: 'mamografia',
  badgeLabel: 'MAMOGRAFIA',
  termo: TERMO_MAMOGRAFIA,
  renderSecurityFields: renderMamografiaSecurityFields,
  renderClinicalFields: renderMamografiaClinicalFields,
};

// ----- DENSITOMETRIA ÓSSEA -----

const TERMO_DENSITOMETRIA: TermoConsentimento = {
  titulo: "TERMO DE CONSENTIMENTO INFORMADO – EXAME DE DENSITOMETRIA ÓSSEA (DXA)",
  secoes: [
    {
      titulo: "1. DO EXAME DE DENSITOMETRIA ÓSSEA",
      texto: "A Densitometria Óssea, também denominada Absorciometria por Dupla Energia de Raios X (DXA), é um exame de diagnóstico por imagem utilizado para a avaliação da densidade mineral óssea, auxiliando no diagnóstico, acompanhamento e estratificação do risco de osteopenia, osteoporose e fraturas. O exame é amplamente reconhecido como método padrão para avaliação da saúde óssea, sendo indicado conforme critérios clínicos e diretrizes médicas vigentes."
    },
    {
      titulo: "2. DO FUNCIONAMENTO DO APARELHO",
      texto: "O exame é realizado em equipamento específico que utiliza raios X em doses extremamente baixas, significativamente inferiores às utilizadas em exames radiográficos convencionais. Durante o procedimento, o paciente permanece deitado sobre uma mesa plana, enquanto o braço do aparelho realiza varreduras sobre as regiões anatômicas de interesse, sem contato físico direto."
    },
    {
      titulo: "3. REGIÕES AVALIADAS",
      texto: "As regiões mais comumente avaliadas na densitometria óssea incluem:",
      bullets: [
        "Coluna lombar;",
        "Quadril (fêmur proximal);",
        "Antebraço, em situações específicas;",
        "Corpo inteiro, quando indicado para avaliação de composição corporal."
      ],
      textoAdicional: "A escolha das regiões avaliadas depende da indicação clínica, das condições do paciente e de critérios técnicos."
    },
    {
      titulo: "4. DO TEMPO DE REALIZAÇÃO",
      texto: "O exame apresenta duração média de 10 a 20 minutos, podendo variar conforme o número de regiões analisadas e a colaboração do paciente durante o procedimento."
    },
    {
      titulo: "5. DOS RISCOS E SEGURANÇA",
      texto: "A densitometria óssea é considerada um exame seguro, não invasivo e indolor. A exposição à radiação é mínima, não oferecendo risco significativo quando realizada dentro das indicações clínicas adequadas. Por utilizar raios X, ainda que em baixíssima dose, o exame deve ser realizado com cautela em gestantes, sendo necessária comunicação prévia à equipe para avaliação individualizada."
    },
    {
      titulo: "6. DE FATORES QUE PODEM INTERFERIR NO RESULTADO",
      texto: "Algumas condições podem interferir na qualidade ou interpretação dos resultados do exame, tais como:",
      bullets: [
        "Presença de próteses metálicas ou implantes na região avaliada;",
        "Cirurgias prévias;",
        "Fraturas recentes;",
        "Alterações degenerativas importantes da coluna;",
        "Uso recente de contrastes radiológicos (iodados ou à base de bário), devendo-se respeitar intervalo adequado antes da realização do exame."
      ],
      textoAdicional: "Essas informações devem ser comunicadas previamente para correta análise técnica."
    },
    {
      titulo: "7. DO USO DAS IMAGENS E DADOS",
      texto: "As imagens e dados obtidos por meio do exame, bem como os dados pessoais colhidos durante o preenchimento do questionário, destinam-se exclusivamente à finalidade diagnóstica e de acompanhamento clínico, respeitando-se o sigilo profissional, as normas éticas aplicáveis e a legislação vigente, em especial a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)."
    }
  ]
};

function renderDensitometriaSecurityFields(ctx: RenderContext): number {
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

function renderDensitometriaClinicalFields(ctx: RenderContext): number {
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

const DENSITOMETRIA_CONFIG: ExameConfig = {
  tipoExame: 'densitometria',
  badgeLabel: 'DENSITOMETRIA ÓSSEA',
  termo: TERMO_DENSITOMETRIA,
  renderSecurityFields: renderDensitometriaSecurityFields,
  renderClinicalFields: renderDensitometriaClinicalFields,
};

// ----- PLACEHOLDERS PARA OUTROS EXAMES -----
// TODO: Implementar quando os designs forem fornecidos

// const TERMO_RESSONANCIA: TermoConsentimento = { ... };
// const RESSONANCIA_CONFIG: ExameConfig = { ... };

// const TERMO_TOMOGRAFIA: TermoConsentimento = { ... };
// const TOMOGRAFIA_CONFIG: ExameConfig = { ... };

// ============================================================
// FUNÇÕES EXPORTADAS
// ============================================================

export function generateMamografiaPDF(
  data: QuestionnaireData,
  assinaturas?: Assinaturas
): Blob {
  return buildExamePDF(data, MAMOGRAFIA_CONFIG, assinaturas);
}

export function generateFinalMamografiaPDF(
  data: QuestionnaireData,
  assinaturas: Assinaturas
): Blob {
  return generateMamografiaPDF(data, assinaturas);
}

// ----- DENSITOMETRIA -----

export function generateDensitometriaPDF(
  data: QuestionnaireData,
  assinaturas?: Assinaturas
): Blob {
  return buildExamePDF(data, DENSITOMETRIA_CONFIG, assinaturas);
}

export function generateFinalDensitometriaPDF(
  data: QuestionnaireData,
  assinaturas: Assinaturas
): Blob {
  return generateDensitometriaPDF(data, assinaturas);
}

// TODO: Implementar novos PDFs para RM e TC seguindo o padrão
export function generateQuestionnairePDF(_data: QuestionnaireData): Blob {
  throw new Error('PDF para RM/TC ainda não implementado no novo design.');
}

export function generateFinalQuestionnairePDF(
  _data: QuestionnaireData,
  _assinaturaTecnico: string
): Blob {
  throw new Error('PDF para RM/TC ainda não implementado no novo design.');
}
