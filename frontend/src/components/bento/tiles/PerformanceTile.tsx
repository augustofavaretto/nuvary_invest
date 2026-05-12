"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { BentoTile } from "../BentoTile";
import { formatBRL, formatDelta } from "@/lib/format";

// Hero tile — patrimonio total + variacao + curva 30d.
// Dados mockados; quando ligado ao portfolioService, troque chartData
// por snapshots reais.
const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  d: `d${i + 1}`,
  v: 44000 + Math.sin(i / 3) * 1200 + i * 130,
}));

interface PerformanceTileProps {
  span?: string;
  patrimonio?: number;
  variacaoPct?: number;
  periodLabel?: string;
}

export function PerformanceTile({
  span = "lg:col-span-8 lg:row-span-2",
  patrimonio = 47832.15,
  variacaoPct = 8.4,
  periodLabel = "YTD",
}: PerformanceTileProps) {
  const isPositive = variacaoPct >= 0;

  return (
    <BentoTile span={span} variant="hero">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
          Patrimonio Total
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            data-mono
            className="font-mono text-4xl font-medium text-text-primary"
          >
            {formatBRL(patrimonio)}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-sm font-semibold ${
              isPositive ? "text-gain" : "text-loss"
            }`}
          >
            <ArrowUpRight
              className={`w-4 h-4 ${isPositive ? "" : "rotate-180"}`}
            />
            {formatDelta(variacaoPct)}
            <span className="text-text-secondary font-normal ml-1">
              {periodLabel}
            </span>
          </span>
        </div>
      </header>

      <div className="flex-1 -mx-2 -mb-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockChartData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B8D9" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00B8D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" hide />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 12,
              }}
              labelStyle={{ display: "none" }}
              formatter={(v) => [formatBRL(Number(v ?? 0)), "Patrimonio"]}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#00B8D9"
              strokeWidth={2}
              fill="url(#perfFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BentoTile>
  );
}
