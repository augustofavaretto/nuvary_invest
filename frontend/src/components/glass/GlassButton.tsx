"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassButtonVariant = "regular" | "prominent" | "ghost";
type GlassButtonSize = "sm" | "md" | "lg";

interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<GlassButtonVariant, string> = {
  // regular: bg-glass + texto on-glass
  regular:
    "bg-bg-glass backdrop-blur-xl border border-[var(--border-default)] text-[var(--text-on-glass)] hover:border-[var(--border-strong)]",
  // prominent: gradient cyan, sombra-cta, brilho — CTAs principais
  prominent:
    "bg-gradient-cta text-white shadow-cta hover:shadow-cta-hover border-0",
  // ghost: transparent, ganha bg sutil no hover
  ghost:
    "bg-transparent text-[var(--text-on-glass)] hover:bg-bg-glass-hover border border-transparent hover:border-[var(--border-subtle)]",
};

const sizeClasses: Record<GlassButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

// GlassButton — CTA principal e secundario.
// "prominent" e o CTA brand (gradient cyan + shimmer no hover).
// Use sempre que houver acao destacada em landing, modais ou empty states.
export function GlassButton({
  variant = "regular",
  size = "md",
  className,
  children,
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl",
        "font-medium transition-[border-color,box-shadow,background-color] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "disabled:opacity-50 disabled:pointer-events-none",
        "overflow-hidden",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Shimmer no hover (apenas variantes que tem cor de fundo solida ou glass) */}
      {variant !== "ghost" && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-1/3",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "-translate-x-full group-hover:animate-shimmer pointer-events-none"
          )}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
