// Cores utilizadas no PDF
export const COLORS = {
  primary: [59, 100, 143] as [number, number, number],
  primaryDark: [47, 79, 114] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  textLight: [120, 120, 120] as [number, number, number],
  border: [200, 210, 220] as [number, number, number],
  background: [245, 248, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Labels dos tipos de exame
export const EXAM_LABELS: Record<string, string> = {
  'tomografia': 'TOMOGRAFIA',
  'ressonancia': 'RESSONÂNCIA',
  'densitometria': 'DENSITOMETRIA',
  'mamografia': 'MAMOGRAFIA',
};
