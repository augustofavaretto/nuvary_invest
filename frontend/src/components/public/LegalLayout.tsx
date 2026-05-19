import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  lastUpdate: string;
  version: string;
  backHref?: string;
  backLabel?: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}

// Wrapper para /termos e /privacidade.
export function LegalLayout({
  eyebrow,
  title,
  lastUpdate,
  version,
  backHref = '/cadastro',
  backLabel = 'Voltar ao cadastro',
  intro,
  children,
}: LegalLayoutProps) {
  return (
    <div
      className="min-h-screen bg-[#020817] text-slate-100 antialiased"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_60%)]" />
      </div>

      <header className="sticky top-0 z-30 bg-[#020817]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-extrabold tracking-tight text-lg"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Nuvary <span className="text-cyan-400">Invest</span>
          </Link>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-cyan-400 text-xs font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h1
          className="font-extrabold text-4xl sm:text-5xl tracking-tight mt-3"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          {title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
          <span>Última atualização: {lastUpdate}</span>
          <span className="text-slate-600">|</span>
          <span>Versão {version}</span>
        </div>

        {intro && <div className="mt-8">{intro}</div>}

        <div className="mt-10 space-y-10 text-slate-300 leading-relaxed [&_h2]:font-bold [&_h2]:text-xl [&_h2]:tracking-tight [&_h2]:text-white [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-white/[0.06] [&_h2]:mb-4 [&_h2]:[font-family:var(--font-manrope)]">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] text-sm text-slate-500">
          © 2026 Nuvary Invest. Todos os direitos reservados.
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5 sm:p-6 text-slate-300">
      {children}
    </div>
  );
}

export function LegalBullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 list-disc pl-5 marker:text-cyan-400">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
