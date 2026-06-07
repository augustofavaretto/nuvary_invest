import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
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

// Manrope — display (paginas publicas: landing, auth, legal)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
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
  // Projeto acadêmico/demo — não indexar em buscadores (reduz exposição
  // sem afetar o funcionamento; o app segue acessível por link direto).
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Script inline que aplica o tema (dark|light) ANTES da hidratacao,
  // lendo do localStorage (mesma chave do ThemeContext). Evita o flash
  // de tela branca quando o usuario tem tema dark.
  const themeBootScript = `
    (function() {
      try {
        var saved = localStorage.getItem('nuvary_theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved || (prefersDark ? 'dark' : 'light');
        if (theme === 'dark') document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`}
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
