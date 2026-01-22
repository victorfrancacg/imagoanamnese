import jsPDF from "jspdf";
import { QuestionnaireData } from "@/types/questionnaire";

// Layout do PDF
export interface PDFLayout {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  logoWidth: number;
  logoHeight: number;
  badgePadding: number;
}

// Seção do termo de consentimento
export interface TermoSecao {
  titulo: string;
  texto: string;
  bullets?: string[];
  textoAdicional?: string;
}

// Termo de consentimento completo
export interface TermoConsentimento {
  titulo: string;
  secoes: TermoSecao[];
}

// Assinaturas do PDF
export interface Assinaturas {
  paciente?: string;
  responsavel?: string;
  assistente?: string;
  operador?: string;
  nomeAssistente?: string;
  nomeOperador?: string;
  registroAssistente?: string;
  registroOperador?: string;
}

// Contexto de renderização passado para as funções de campos
export interface RenderContext {
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
export interface ExameConfig {
  tipoExame: string;
  badgeLabel: string;
  termo: TermoConsentimento;
  termos?: TermoConsentimento[]; // Para exames com múltiplos termos (ex: TC)
  renderSecurityFields: (ctx: RenderContext) => number;
  renderClinicalFields: (ctx: RenderContext) => number;
}
