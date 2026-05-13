'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Check,
  CreditCard,
  FileText,
  Headphones,
  Infinity as InfinityIcon,
  Mail,
  Loader2,
  Sparkles,
  Wallet,
  X as XIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import {
  createCreditCardSubscription,
  createOneTimePayment,
  type SubscriptionPlan,
} from '@/services/premiumService';
import { formatBRL } from '@/lib/format';

type Method = 'credit_card' | 'pix' | 'boleto';

const FEATURES = [
  { icon: Bell, label: 'Alertas de variação ≥ 5% ilimitados' },
  { icon: Mail, label: 'Relatório diário por e-mail' },
  { icon: Sparkles, label: 'Tokens ilimitados no Chat IA' },
  { icon: Headphones, label: 'Suporte 24 horas' },
  { icon: Wallet, label: 'Ativos ilimitados na carteira' },
  { icon: FileText, label: 'Exportação completa de relatórios em PDF' },
];

const PRICE = {
  mensal: 79.99,
  anual: 849.99,
} as const;

export default function PremiumPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, state, loading: premiumLoading } = usePremium();

  const [plan, setPlan] = useState<SubscriptionPlan>('mensal');
  const [method, setMethod] = useState<Method>('credit_card');
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (authLoading) return null;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  async function handleSubmit() {
    setErro(null);
    setSubmitting(true);
    try {
      const resposta =
        method === 'credit_card'
          ? await createCreditCardSubscription(plan)
          : await createOneTimePayment(plan, method);
      // Redireciona para o Mercado Pago concluir o pagamento
      window.location.href = resposta.init_point;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setErro(msg);
      setSubmitting(false);
    }
  }

  // Calcula desconto do anual vs mensal x 12
  const economiaAnual = PRICE.mensal * 12 - PRICE.anual;

  return (
    <DashboardLayout>
      <div className="dark min-h-full bg-bg-base text-text-primary">
        {/* Aurora de fundo */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-cyan-500/8 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-navy-500/40 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              NUVARY PREMIUM
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Tire o máximo da sua{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-700 bg-clip-text text-transparent">
                jornada de investidor
              </span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Alertas, relatórios automáticos, suporte dedicado e ferramentas avançadas para acompanhar sua carteira sem fricção.
            </p>
          </motion.header>

          {/* Se ja for Premium, mostra status */}
          {isPremium && !premiumLoading && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 text-center">
              <p className="inline-flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <Check className="w-5 h-5" />
                Você já é Premium
              </p>
              <p className="text-sm text-text-secondary">
                Plano: <strong className="text-text-primary">{state.plan}</strong>
                {state.expiresAt && (
                  <>
                    {' · '}
                    Válido até{' '}
                    <strong className="text-text-primary">
                      {new Date(state.expiresAt).toLocaleDateString('pt-BR')}
                    </strong>
                  </>
                )}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 mt-4 text-sm text-cyan-400 hover:text-cyan-300"
              >
                Voltar ao Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Card features */}
            <motion.section
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6"
            >
              <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                O que você ganha
              </h2>
              <ul className="space-y-3">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.label} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 inline-flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed">{f.label}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.section>

            {/* Card seletor de plano + metodo */}
            <motion.section
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6"
            >
              {/* Toggle Mensal/Anual */}
              <h2 className="text-base font-semibold mb-3 inline-flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Escolha seu plano
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPlan('mensal')}
                  className={`rounded-xl p-3 text-left border transition-colors ${
                    plan === 'mensal'
                      ? 'bg-cyan-500/15 border-cyan-500/40'
                      : 'bg-muted/20 border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }`}
                >
                  <p className="text-xs uppercase tracking-wider text-text-secondary">Mensal</p>
                  <p data-mono className="font-mono text-lg font-semibold mt-0.5">
                    {formatBRL(PRICE.mensal)}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-1">por mês</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('anual')}
                  className={`rounded-xl p-3 text-left border transition-colors relative ${
                    plan === 'anual'
                      ? 'bg-cyan-500/15 border-cyan-500/40'
                      : 'bg-muted/20 border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }`}
                >
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Economize {formatBRL(economiaAnual)}
                  </span>
                  <p className="text-xs uppercase tracking-wider text-text-secondary">Anual</p>
                  <p data-mono className="font-mono text-lg font-semibold mt-0.5">
                    {formatBRL(PRICE.anual)}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {formatBRL(PRICE.anual / 12)} / mês
                  </p>
                </button>
              </div>

              {/* Metodo de pagamento */}
              <h3 className="text-sm font-semibold mb-2 mt-5 inline-flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Método de pagamento
              </h3>
              <div className="space-y-2 mb-5">
                <MethodOption
                  active={method === 'credit_card'}
                  onClick={() => setMethod('credit_card')}
                  title="Cartão de crédito"
                  subtitle="Cobrança automática mensal — cancele quando quiser"
                />
                <MethodOption
                  active={method === 'pix'}
                  onClick={() => setMethod('pix')}
                  title="PIX"
                  subtitle="Pagamento único — renovação manual no fim do período"
                />
                <MethodOption
                  active={method === 'boleto'}
                  onClick={() => setMethod('boleto')}
                  title="Boleto bancário"
                  subtitle="Pagamento único — compensação em até 3 dias úteis"
                />
              </div>

              {erro && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-3">
                  {erro}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || isPremium}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00B8D9] hover:bg-[#007EA7] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecionando para o Mercado Pago...
                  </>
                ) : (
                  <>
                    Continuar para pagamento
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-text-tertiary text-center mt-3">
                Pagamento seguro via Mercado Pago. Cancele a assinatura recorrente quando quiser.
              </p>
            </motion.section>
          </div>

          {/* Tabela comparativa Free x Premium */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6"
          >
            <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-cyan-400" />
              Comparação Free x Premium
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 font-medium">Recurso</th>
                    <th className="text-center py-2 font-medium">Free</th>
                    <th className="text-center py-2 font-medium text-cyan-400">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow label="Carteira no Supabase" free="✓" premium="✓" />
                  <ComparisonRow label="Ativos cadastrados" free="até 10" premium="ilimitados" />
                  <ComparisonRow label="Chat IA" free="limite mensal" premium="ilimitado" />
                  <ComparisonRow label="Alertas de variação ≥ 5%" free={<XIcon className="w-4 h-4 text-red-400 mx-auto" />} premium={<Check className="w-4 h-4 text-emerald-400 mx-auto" />} />
                  <ComparisonRow label="Relatório diário por e-mail" free={<XIcon className="w-4 h-4 text-red-400 mx-auto" />} premium={<Check className="w-4 h-4 text-emerald-400 mx-auto" />} />
                  <ComparisonRow label="Suporte" free="comunidade" premium="24h dedicado" />
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MethodOption({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left border transition-colors flex items-center gap-3 ${
        active
          ? 'bg-cyan-500/15 border-cyan-500/40'
          : 'bg-muted/20 border-[var(--border-subtle)] hover:border-[var(--border-default)]'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 shrink-0 inline-flex items-center justify-center ${
          active ? 'border-cyan-400' : 'border-text-tertiary'
        }`}
      >
        {active && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-text-tertiary">{subtitle}</span>
      </span>
    </button>
  );
}

function ComparisonRow({
  label,
  free,
  premium,
}: {
  label: string;
  free: React.ReactNode;
  premium: React.ReactNode;
}) {
  return (
    <tr className="border-b border-[var(--border-subtle)]/50 last:border-0">
      <td className="py-2.5">{label}</td>
      <td className="py-2.5 text-center text-text-secondary">{free}</td>
      <td className="py-2.5 text-center text-text-primary font-medium">{premium}</td>
    </tr>
  );
}
