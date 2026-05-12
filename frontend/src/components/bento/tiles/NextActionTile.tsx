"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import { BentoTile } from "../BentoTile";

interface NextActionTileProps {
  span?: string;
  titulo?: string;
  descricao?: string;
  ctaLabel?: string;
  onAction?: () => void;
}

// NextActionTile — sugestao acionavel da IA.
// Acompanha sempre o disclaimer "Sugestoes educacionais, nao constituem
// oferta" (rodape do dashboard, nao precisa repetir aqui).
export function NextActionTile({
  span = "lg:col-span-4",
  titulo = "Aporte mensal recomendado: +R$ 500",
  descricao = "Com base no seu perfil moderado e na meta de aposentadoria, manter aporte constante reduz o impacto de volatilidade.",
  ctaLabel = "Configurar aporte automatico",
  onAction,
}: NextActionTileProps) {
  return (
    <BentoTile span={span} interactive onClick={onAction}>
      <header className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500">
          <Sparkles className="w-4 h-4" />
        </span>
        <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
          Proxima acao
        </p>
      </header>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div>
          <p className="text-sm font-semibold text-text-primary leading-snug">
            {titulo}
          </p>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-3">
            {descricao}
          </p>
        </div>

        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-500 hover:text-cyan-400 transition-colors self-start"
        >
          {ctaLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </BentoTile>
  );
}
