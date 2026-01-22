import { QuestionnaireData } from "@/types/questionnaire";
import { ExameConfig, Assinaturas } from "../../core/types";
import { buildExamePDF } from "../../core/builder";
import { TERMO_TOMOGRAFIA_GERAL, TERMO_TOMOGRAFIA_CONTRASTE } from "./termo";
import { renderTomografiaSecurityFields, renderTomografiaClinicalFields } from "./fields";

export const TOMOGRAFIA_CONFIG: ExameConfig = {
  tipoExame: 'tomografia',
  badgeLabel: 'TOMOGRAFIA COMPUTADORIZADA',
  termo: TERMO_TOMOGRAFIA_GERAL, // Mantém compatibilidade
  termos: [TERMO_TOMOGRAFIA_GERAL, TERMO_TOMOGRAFIA_CONTRASTE], // Dois termos separados
  renderSecurityFields: renderTomografiaSecurityFields,
  renderClinicalFields: renderTomografiaClinicalFields,
};

export function generateTomografiaPDF(
  data: QuestionnaireData,
  assinaturas?: Assinaturas
): Blob {
  return buildExamePDF(data, TOMOGRAFIA_CONFIG, assinaturas);
}

export function generateFinalTomografiaPDF(
  data: QuestionnaireData,
  assinaturas: Assinaturas
): Blob {
  return generateTomografiaPDF(data, assinaturas);
}
