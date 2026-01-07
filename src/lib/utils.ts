import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um CPF com pontos e traço
 * @param cpf - CPF sem formatação (apenas números)
 * @returns CPF formatado (000.000.000-00)
 */
export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF, deixando apenas números
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Remove formatação do telefone, deixando apenas números
 * @param telefone - Telefone com ou sem formatação
 * @returns Telefone apenas com números
 */
export function cleanTelefone(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

/**
 * Formata uma data ISO para formato brasileiro
 * @param date - Data em formato ISO string
 * @returns Data formatada (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return date;
  }
}

/**
 * Formata uma data ISO para formato brasileiro (apenas data)
 * @param date - Data em formato ISO string
 * @returns Data formatada (dd/MM/yyyy)
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return date;
  }
}
