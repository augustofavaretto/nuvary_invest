"use client";

import { Play, Clock } from "lucide-react";
import { BentoTile } from "../BentoTile";

interface NextLessonTileProps {
  span?: string;
  titulo?: string;
  duracao?: string;
  progressoPct?: number; // 0-100
  trilha?: string;
  thumbnailUrl?: string;
  onPlay?: () => void;
}

// Anel de progresso SVG (sem dependencias). raio=18, circ=2*PI*18 ~ 113.1.
function ProgressRing({ pct }: { pct: number }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle
        cx="22"
        cy="22"
        r={radius}
        stroke="var(--border-default)"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="22"
        cy="22"
        r={radius}
        stroke="#00B8D9"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 22 22)"
      />
      <text
        x="22"
        y="25"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
        className="text-text-primary font-medium"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// NextLessonTile — proxima aula da trilha educacional.
// Thumbnail + titulo + duracao + progresso circular.
export function NextLessonTile({
  span = "lg:col-span-6",
  titulo = "Como montar sua primeira carteira",
  duracao = "8 min",
  progressoPct = 35,
  trilha = "Jornada do investidor",
  thumbnailUrl,
  onPlay,
}: NextLessonTileProps) {
  return (
    <BentoTile span={span} interactive onClick={onPlay}>
      <header className="mb-3">
        <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
          Proxima aula
        </p>
      </header>

      <div className="flex-1 flex items-center gap-4 min-h-0">
        {/* Thumbnail / placeholder */}
        <div
          className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-navy-500 via-cyan-700 to-cyan-500 flex items-center justify-center"
          style={
            thumbnailUrl
              ? {
                  backgroundImage: `url(${thumbnailUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <span className="absolute inset-0 bg-black/20" />
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-cyan-700 shadow-md">
            <Play className="w-4 h-4 fill-current" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-tertiary">{trilha}</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5 leading-snug line-clamp-2">
            {titulo}
          </p>
          <p className="text-xs text-text-secondary mt-1 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duracao}
          </p>
        </div>

        <ProgressRing pct={progressoPct} />
      </div>
    </BentoTile>
  );
}
