"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassVariant = "regular" | "clear" | "elevated";

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: GlassVariant;
  interactive?: boolean;
  enableRefraction?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<GlassVariant, string> = {
  // regular: bg-bg-glass + blur padrao + border sutil
  regular:
    "bg-bg-glass backdrop-blur-xl border border-[var(--border-subtle)]",
  // clear: blur mais leve + border quase imperceptivel
  clear:
    "bg-[var(--bg-glass-nav)]/40 backdrop-blur-md border border-[var(--border-subtle)]",
  // elevated: blur mais intenso + sombra-tile + border default
  elevated:
    "bg-bg-glass backdrop-blur-2xl border border-[var(--border-default)] shadow-tile",
};

// GlassCard — primitive para overlays/modais/sidebars/CTA cards.
// REGRA APPLE: glass APENAS em navigation layer. Para tiles de dados (Bento),
// use <BentoTile> com bg-bg-card opaco.
export function GlassCard({
  variant = "regular",
  interactive = false,
  enableRefraction = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variantClasses[variant],
        // Refraction Chromium-only via SVG filter
        enableRefraction && "[filter:url(#glass-refraction)]",
        interactive && "cursor-pointer hover:border-[var(--border-strong)] transition-colors",
        // Fallback se backdrop-filter nao for suportado
        "supports-[not_(backdrop-filter:blur(0))]:bg-bg-elevated",
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      {/* SVG filter inline para refraction (Chromium); ignorado por Safari/Firefox */}
      {enableRefraction && (
        <svg className="absolute pointer-events-none" width="0" height="0">
          <filter id="glass-refraction">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </motion.div>
  );
}
