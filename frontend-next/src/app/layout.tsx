import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fonte oficial da marca: Inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
