import { QuestionnaireData } from "@/types/questionnaire";
import { ExameConfig, Assinaturas } from "../../core/types";
import { buildExamePDF } from "../../core/builder";
import { TERMO_RESSONANCIA_GERAL, TERMO_RESSONANCIA_CONTRASTE } from "./termo";
import { renderRessonanciaSecurityFields, renderRessonanciaClinicalFields } from "./fields";

export const RESSONANCIA_CONFIG: ExameConfig = {
  tipoExame: 'ressonancia',
  badgeLabel: 'RESSONÂNCIA MAGNÉTICA',
  termo: TERMO_RESSONANCIA_GERAL, // Mantém compatibilidade
  termos: [TERMO_RESSONANCIA_GERAL, TERMO_RESSONANCIA_CONTRASTE], // Dois termos separados
  renderSecurityFields: renderRessonanciaSecurityFields,
  renderClinicalFields: renderRessonanciaClinicalFields,
};

export function generateRessonanciaPDF(
  data: QuestionnaireData,
  assinaturas?: Assinaturas
): Blob {
  return buildExamePDF(data, RESSONANCIA_CONFIG, assinaturas);
}

export function generateFinalRessonanciaPDF(
  data: QuestionnaireData,
  assinaturas: Assinaturas
): Blob {
  return generateRessonanciaPDF(data, assinaturas);
}
