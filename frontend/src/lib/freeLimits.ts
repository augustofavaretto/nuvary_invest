// Limites do plano Free. Usuario Premium nao tem limite.
// Centralizado aqui para que os gates fiquem consistentes em todo o app.

export const FREE_LIMITS = {
  /** Maximo de ativos na carteira para usuario free. */
  MAX_ATIVOS: 10,
  /** Maximo de conversas no Chat IA para usuario free. */
  MAX_CONVERSAS: 10,
  /** Categorias de Trilhas Educativas liberadas para usuario free. */
  TRILHAS_LIBERADAS: ['populares'] as const,
} as const;
