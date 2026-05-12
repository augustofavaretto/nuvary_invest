import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizes = { sm: 24, md: 32, lg: 48, xl: 72 };

// Logo oficial Nuvary Invest.
// Restricoes do brandbook: NUNCA rotacionar, distorcer, aplicar sombra,
// bevel, glow ou alterar cores. Espacamento minimo ao redor = largura da
// letra "N" (aprox. 70% da altura).
export function Logo({
  variant = "full",
  size = "md",
  className,
  priority = false,
}: LogoProps) {
  const h = sizes[size];
  const minSpacing = Math.round(h * 0.7);
  const w = variant === "full" ? Math.round(h * 3.6) : h;

  return (
    <div
      className={cn("inline-flex items-center", className)}
      style={{ padding: `${minSpacing / 2}px` }}
    >
      <Image
        src={variant === "full" ? "/brand/nuvary-full.svg" : "/brand/nuvary-icon.svg"}
        alt="Nuvary Invest"
        height={h}
        width={w}
        priority={priority}
        style={{ filter: "none", transform: "none" }}
      />
    </div>
  );
}
