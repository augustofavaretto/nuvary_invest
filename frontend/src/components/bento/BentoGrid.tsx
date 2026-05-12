"use client";

import { cn } from "@/lib/utils";

interface BentoGridProps {
  className?: string;
  children: React.ReactNode;
}

// Grid Bento — arquitetura de informacao do dashboard.
// Tile maior = mais importante (PerformanceTile span-8 row-span-2 e a regra).
// auto-rows-[180px] garante alturas previsiveis; gap 4/6 mobile/desktop.
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12",
        "auto-rows-[180px] gap-4 lg:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}
