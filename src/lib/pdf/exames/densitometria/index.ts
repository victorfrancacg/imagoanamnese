import { QuestionnaireData } from "@/types/questionnaire";
import { ExameConfig, Assinaturas } from "../../core/types";
import { buildExamePDF } from "../../core/builder";
import { TERMO_DENSITOMETRIA } from "./termo";
import { renderDensitometriaSecurityFields, renderDensitometriaClinicalFields } from "./fields";

export const DENSITOMETRIA_CONFIG: ExameConfig = {
  tipoExame: 'densitometria',
  badgeLabel: 'DENSITOMETRIA ÓSSEA',
  termo: TERMO_DENSITOMETRIA,
  renderSecurityFields: renderDensitometriaSecurityFields,
  renderClinicalFields: renderDensitometriaClinicalFields,
};

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
