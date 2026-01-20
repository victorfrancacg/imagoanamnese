import { QuestionnaireData } from "@/types/questionnaire";
import { ExameConfig, Assinaturas } from "../../core/types";
import { buildExamePDF } from "../../core/builder";
import { TERMO_MAMOGRAFIA } from "./termo";
import { renderMamografiaSecurityFields, renderMamografiaClinicalFields } from "./fields";

export const MAMOGRAFIA_CONFIG: ExameConfig = {
  tipoExame: 'mamografia',
  badgeLabel: 'MAMOGRAFIA',
  termo: TERMO_MAMOGRAFIA,
  renderSecurityFields: renderMamografiaSecurityFields,
  renderClinicalFields: renderMamografiaClinicalFields,
};

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
