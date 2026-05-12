"use client";

import { cn } from "@/lib/utils";

interface LiquidGlassEffectProps {
  className?: string;
  children: React.ReactNode;
  /**
   * Intensidade do efeito (1-3). Padrao: 2.
   * 1 = blur leve + glow sutil; 3 = blur intenso + glow forte.
   */
  intensity?: 1 | 2 | 3;
}

// LiquidGlassEffect — wrapper para destacar elementos pontuais com glass
// premium: icone do chat IA flutuante, badge "Premium" do pricing, botao
// CTA do hero.
//
// Implementacao CSS pura (sem liquid-glass-react). Quando/se a dependencia
// for adicionada, este componente pode passar a usa-la com fallback CSS
// para Safari/Firefox.
//
// REGRA: usar com moderacao — efeito chama atencao, deve ser excecao,
// nao regra. Nao aplicar em conteudo de dados.
export function LiquidGlassEffect({
  className,
  children,
  intensity = 2,
}: LiquidGlassEffectProps) {
  const blurMap = { 1: "backdrop-blur-md", 2: "backdrop-blur-xl", 3: "backdrop-blur-2xl" } as const;
  const glowMap = {
    1: "shadow-[0_0_20px_rgba(0,184,217,0.25)]",
    2: "shadow-[0_0_40px_rgba(0,184,217,0.40)]",
    3: "shadow-[0_0_60px_rgba(0,184,217,0.55)]",
  } as const;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-2xl overflow-hidden",
        blurMap[intensity],
        glowMap[intensity],
        "bg-gradient-to-br from-white/15 via-white/5 to-transparent",
        "dark:from-cyan-500/20 dark:via-cyan-500/5 dark:to-transparent",
        "border border-white/20 dark:border-cyan-500/25",
        // Fallback se backdrop-filter nao suportado
        "supports-[not_(backdrop-filter:blur(0))]:bg-bg-card",
        className
      )}
    >
      {/* Highlight superior — simula reflexo de luz */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent dark:from-white/8"
      />
      <span className="relative z-10 inline-flex">{children}</span>
    </div>
  );
}
