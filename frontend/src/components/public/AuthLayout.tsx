import Link from 'next/link';
import Image from 'next/image';

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
      className="rounded-md bg-white flex items-center justify-center overflow-hidden"
      style={{ width: 36, height: 36 }}
    >
      <Image
        src="/brand/nuvary-icon.png"
        alt="Nuvary Invest"
        width={32}
        height={32}
        priority
        className="object-contain"
      />
    </div>
  );
}
