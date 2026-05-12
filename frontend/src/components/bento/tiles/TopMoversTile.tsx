"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BentoTile } from "../BentoTile";
import { formatBRL, formatDelta } from "@/lib/format";

interface Mover {
  ticker: string;
  nome: string;
  preco: number;
  variacaoPct: number;
}

const mockMovers: Mover[] = [
  { ticker: "PETR4", nome: "Petrobras PN",   preco: 48.66, variacaoPct: 2.34 },
  { ticker: "VALE3", nome: "Vale ON",        preco: 64.10, variacaoPct: -1.12 },
  { ticker: "ITUB4", nome: "Itau Unibanco",  preco: 33.78, variacaoPct: 0.92 },
  { ticker: "BBAS3", nome: "Banco do Brasil", preco: 28.45, variacaoPct: -0.45 },
];

interface TopMoversTileProps {
  span?: string;
  movers?: Mover[];
}

// Lista compacta de movimentadores do dia — ticker, nome, preco, delta.
export function TopMoversTile({
  span = "lg:col-span-6",
  movers = mockMovers,
}: TopMoversTileProps) {
  return (
    <BentoTile span={span}>
      <header className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
          Movimentadores
        </p>
        <span className="text-xs text-text-tertiary">Hoje</span>
      </header>

      <ul className="flex-1 divide-y divide-[var(--border-subtle)] -mx-1 min-h-0 overflow-hidden">
        {movers.map((m) => {
          const up = m.variacaoPct >= 0;
          return (
            <li
              key={m.ticker}
              className="flex items-center justify-between gap-3 px-1 py-2"
            >
              <div className="min-w-0">
                <p
                  data-mono
                  className="font-mono text-sm font-semibold text-text-primary"
                >
                  {m.ticker}
                </p>
                <p className="text-xs text-text-secondary truncate">{m.nome}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  data-mono
                  className="font-mono text-sm text-text-primary"
                >
                  {formatBRL(m.preco)}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    up ? "text-gain" : "text-loss"
                  }`}
                >
                  {up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {formatDelta(m.variacaoPct)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}
