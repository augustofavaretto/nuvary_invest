"use client";

import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

interface GlassNavProps extends React.HTMLAttributes<HTMLElement> {
  as?: "header" | "aside" | "nav" | "div";
  side?: Side; // controla qual borda recebe o divider sutil
  className?: string;
  children: React.ReactNode;
}

// Container Glass para sidebar/topbar/bottombar.
// backdrop-blur-xl + bg-bg-glass + border sutil de marca.
// Regra Apple: glass APENAS em navigation layer (sidebar, topbar, modais,
// chat panel, CTAs). Conteudo de dados (tiles, tabelas, graficos) usa
// bg-bg-card opaco.
export function GlassNav({
  as: Tag = "nav",
  side = "bottom",
  className,
  children,
  ...props
}: GlassNavProps) {
  const borderBySide: Record<Side, string> = {
    top: "border-b border-[var(--border-subtle)]",
    bottom: "border-b border-[var(--border-subtle)]",
    left: "border-r border-[var(--border-subtle)]",
    right: "border-l border-[var(--border-subtle)]",
  };

  return (
    <Tag
      className={cn(
        "bg-bg-glass backdrop-blur-xl",
        borderBySide[side],
        // Fallback se browser nao suporta backdrop-filter
        "supports-[not_(backdrop-filter:blur(0))]:bg-bg-elevated",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
