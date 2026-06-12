// Formatadores pt-BR para valores monetarios, percentuais e datas. Use estes helpers em TODO lugar que exibe numero monetario para garantir consistencia (BRL, virgula decimal, tabular-nums).

export const formatBRL = (n: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);

export const formatBRLCompact = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const formatPercent = (n: number, fractionDigits = 2) =>
  new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n / 100);

// Para deltas com sinal explicito: "+8,40%" / "-3,20%"
export const formatDelta = (n: number, fractionDigits = 2) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(fractionDigits).replace(".", ",")}%`;

export const formatDateBR = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
