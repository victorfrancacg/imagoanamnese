// Re-exporta tipos úteis
export type { Assinaturas } from "./core/types";

// Re-exporta funções de Mamografia
export { generateMamografiaPDF, generateFinalMamografiaPDF } from "./exames/mamografia";

// Re-exporta funções de Densitometria
export { generateDensitometriaPDF, generateFinalDensitometriaPDF } from "./exames/densitometria";

// Re-exporta funções de Ressonância
export { generateRessonanciaPDF, generateFinalRessonanciaPDF } from "./exames/ressonancia";

// TODO: Implementar Tomografia
// export { generateTomografiaPDF, generateFinalTomografiaPDF } from "./exames/tomografia";

// Funções genéricas legadas (para TC enquanto não implementado)
import { QuestionnaireData } from "@/types/questionnaire";

export function generateQuestionnairePDF(_data: QuestionnaireData): Blob {
  throw new Error('PDF para TC ainda não implementado no novo design.');
}

export function generateFinalQuestionnairePDF(
  _data: QuestionnaireData,
  _assinaturaTecnico: string
): Blob {
  throw new Error('PDF para TC ainda não implementado no novo design.');
}
