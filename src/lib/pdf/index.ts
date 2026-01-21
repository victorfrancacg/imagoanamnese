// Re-exporta tipos úteis
export type { Assinaturas } from "./core/types";

// Re-exporta funções de Mamografia
export { generateMamografiaPDF, generateFinalMamografiaPDF } from "./exames/mamografia";

// Re-exporta funções de Densitometria
export { generateDensitometriaPDF, generateFinalDensitometriaPDF } from "./exames/densitometria";

// Re-exporta funções de Ressonância
export { generateRessonanciaPDF, generateFinalRessonanciaPDF } from "./exames/ressonancia";

// Re-exporta funções de Tomografia
export { generateTomografiaPDF, generateFinalTomografiaPDF } from "./exames/tomografia";
