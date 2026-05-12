import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorSuppressor } from "@/components/ErrorSuppressor";
import "./globals.css";

// Fonte oficial da marca: Inter (UI) — pesos do brandbook
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// JetBrains Mono — valores monetarios, %, datas, tickers
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nuvary Invest | Consultoria de Investimentos com IA",
  description: "Plataforma de consultoria de investimentos orientada por Inteligência Artificial, com foco em automação de carteiras, monitoramento contínuo e trilhas de educação financeira.",
  keywords: ["investimentos", "fintech", "inteligência artificial", "carteira", "consultoria financeira"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ErrorSuppressor>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorSuppressor>
      </body>
    </html>
  );
}
