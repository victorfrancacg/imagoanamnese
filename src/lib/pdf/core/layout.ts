import jsPDF from "jspdf";
import { PDFLayout } from "./types";
import { COLORS } from "./constants";
import imagoLogo from "@/assets/imago-logo.png";

// Cria o layout base do PDF
export function createLayout(): PDFLayout {
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

// Adiciona cabeçalho com logo e badge
export function addHeader(layout: PDFLayout, badgeText: string, yStart: number = 15): number {
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

// Adiciona título de seção
export function addSection(layout: PDFLayout, title: string, y: number): number {
  const { doc, pageWidth, margin, contentWidth } = layout;

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y - 5, contentWidth, 8, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(title, pageWidth / 2, y, { align: "center" });
  return y + 12;
}

// Adiciona rodapé
export function addFooter(layout: PDFLayout, pageNum: number, totalPages: number): void {
  const { doc, pageWidth, pageHeight, margin } = layout;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont("helvetica", "italic");
  doc.text(`IMAGO Diagnóstico por Imagem - Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
}

// Adiciona linha de dados compacta
export function addCompactDataRow(
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
