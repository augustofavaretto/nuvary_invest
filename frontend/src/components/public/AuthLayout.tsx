import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Wrapper para /login, /cadastro e /recuperar-senha — fundo dark navy
// + atmospherics ciano. Espelha o design publico da landing.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen bg-[#020817] text-slate-100 antialiased relative overflow-hidden"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* Background atmospherics */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,165,233,0.07),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top brand bar */}
      <header className="relative z-10 px-5 sm:px-8 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <AuthLogo />
          <span
            className="font-extrabold tracking-tight text-lg"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Nuvary <span className="text-cyan-400">Invest</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 px-5 sm:px-8 pb-12 pt-4 sm:pt-8 flex justify-center">
        {children}
      </main>
    </div>
  );
}

function AuthLogo() {
  return (
    <div
      className="rounded-md bg-white flex items-center justify-center"
      style={{ width: 36, height: 36 }}
    >
      <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
        <path
          d="M7 19c-2.2 0-4-1.8-4-4s1.8-4 4-4c.3-2.8 2.7-5 5.5-5 2.1 0 4 1.2 4.9 3 .6-.2 1.2-.3 1.8-.3 3 0 5.4 2.4 5.4 5.3 1.9.4 3.4 2.1 3.4 4.1 0 2.3-1.9 4.2-4.2 4.2"
          stroke="#0e7490"
          strokeWidth="1.5"
          fill="#ecfeff"
        />
        <rect x="9" y="15" width="2.8" height="6" fill="#06b6d4" rx="0.5" />
        <rect x="13.5" y="12" width="2.8" height="9" fill="#06b6d4" rx="0.5" />
        <rect x="18" y="14" width="2.8" height="7" fill="#06b6d4" rx="0.5" />
      </svg>
    </div>
  );
}
