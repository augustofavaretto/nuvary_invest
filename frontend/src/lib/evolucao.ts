import type { Periodo } from '@/components/dashboard/EvolucaoChart';

// Geracao deterministica de evolucao patrimonial (seed por dia) — mesma estrategia usada em /relatorios para evitar dependencia de snapshots historicos no banco. Quando snapshots existirem, substituir por dados reais.
export function gerarEvolucao(
  periodo: Periodo,
  valorFinal: number
): Array<{ i: number; v: number }> {
  const pontos = { '7D': 7, '7S': 7, '12M': 12, ANOS: 5 }[periodo];
  const amplitude = { '7D': 0.015, '7S': 0.04, '12M': 0.12, ANOS: 0.35 }[periodo];

  return Array.from({ length: pontos }, (_, i) => {
    const t = (i + 1) / pontos;
    const noise = Math.sin(i * 1.7) * amplitude * 0.5;
    return {
      i,
      v: Math.max(0, valorFinal * (1 - amplitude * (1 - t)) + valorFinal * noise),
    };
  });
}
