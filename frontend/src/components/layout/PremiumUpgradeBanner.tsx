'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

const DISMISS_KEY = 'nuvary_premium_banner_dismissed';

// Rotas onde o banner NAO deve aparecer:
// - /premium, /login, /cadastro, /questionario: fluxo de pagamento/onboarding
// - /chat: tela de produto principal, ruido visual atrapalha
// - /configuracoes: ja tem secao Premium dedicada
const HIDDEN_ROUTES = ['/premium', '/login', '/cadastro', '/questionario', '/chat', '/configuracoes'];

// Banner global de upsell para usuario no plano free. Aparece no topo do
// app em todas as paginas autenticadas, dismissivel por sessao (volta a
// aparecer quando o usuario abrir o sistema de novo).
export function PremiumUpgradeBanner() {
  const pathname = usePathname();
  const { isPremium, loading } = usePremium();
  const [dismissed, setDismissed] = useState(true); // padrao escondido ate o hydrate

  useEffect(() => {
    // sessionStorage so existe no client; checa apos mount
    try {
      const flag = sessionStorage.getItem(DISMISS_KEY);
      setDismissed(flag === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // sessionStorage indisponivel — banner volta no proximo render
    }
  };

  // Esconde em rotas de fluxo de pagamento ou enquanto carrega status
  if (loading || isPremium || dismissed) return null;
  if (pathname && HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden mx-6 lg:mx-10 mt-4 mb-2 rounded-[var(--r-md)]"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,184,217,0.22) 0%, rgba(0,126,167,0.08) 60%, transparent 100%), var(--surface-1)',
          border: '1px solid rgba(0,184,217,0.35)',
          boxShadow: '0 4px 18px rgba(0,184,217,0.10)',
        }}
      >
        {/* Glow decorativo */}
        <div
          aria-hidden
          className="absolute -top-1/2 -right-10 w-[260px] h-[260px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(0,184,217,0.25), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 flex items-center gap-3 px-4 py-3">
          <div
            className="w-10 h-10 rounded-[var(--r-md)] grid place-items-center shrink-0"
            style={{ background: 'var(--grad-brand-h)', color: 'white' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <strong
              className="text-[14px] font-semibold block"
              style={{ color: 'var(--t1)' }}
            >
              Desbloqueie todo o potencial do Nuvary Invest
            </strong>
            <span
              className="text-[12.5px] hidden sm:inline"
              style={{ color: 'var(--t2)' }}
            >
              Alertas em tempo real, relatórios diários por e-mail, Chat IA
              ilimitado e suporte 24h.
            </span>
          </div>

          <Link
            href="/premium"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--r-sm)] text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-[1px] shrink-0"
            style={{
              background: 'var(--cyan)',
              boxShadow: '0 4px 14px rgba(0,184,217,0.28)',
            }}
          >
            Fazer upgrade
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 grid place-items-center rounded-full transition-colors hover:bg-[var(--glass)] shrink-0"
            style={{ color: 'var(--t2)' }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
