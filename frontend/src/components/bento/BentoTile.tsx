"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BentoTileVariant = "default" | "hero" | "ghost";

interface BentoTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  /** Classes do grid de span (ex: "lg:col-span-8 lg:row-span-2"). */
  span?: string;
  variant?: BentoTileVariant;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

// BentoTile — bloco de dados do dashboard.
// REGRA APPLE: NUNCA aplicar glass aqui. Tiles sempre usam bg-bg-card
// opaco para legibilidade de dados/numero/grafico. Glass so na navigation
// layer (Sidebar, Topbar, Modais, CTAs).
export function BentoTile({
  span = "lg:col-span-4",
  variant = "default",
  interactive = false,
  className,
  children,
  ...props
}: BentoTileProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-bg-card border border-[var(--border-subtle)]",
        "shadow-tile transition-shadow",
        interactive && "hover:shadow-tile-hover cursor-pointer hover:border-[var(--border-strong)]",
        variant === "hero" && "bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-cyan-500/5",
        variant === "ghost" && "bg-transparent border-dashed",
        span,
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      {variant === "hero" && (
        <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      )}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
  );
}
