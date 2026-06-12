'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/hooks/usePremium';
import { cancelSubscription } from '@/services/premiumService';
import { getAlertsEnabled, setAlertsEnabled } from '@/services/alertasService';
import {
  getEmailRelatoriosAtivo,
  setEmailRelatoriosAtivo,
} from '@/services/emailReportService';
import supabase from '@/lib/supabase';
import {
  Sun,
  Moon,
  Sparkles,
  Mail,
  TrendingUp,
  Shield,
  User,
  Check,
  ChevronRight,
  X,
  Send,
  Loader2,
  Lock,
  Crown,
  AlertTriangle,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isPremium, state: subscriptionState, loading: premiumLoading, refresh: refreshPremium } = usePremium();

  const [alertasVariacao, setAlertasVariacaoState] = useState(true);
  const [emailRelatorios, setEmailRelatoriosState] = useState(false);
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [testeResultado, setTesteResultado] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cancelErro, setCancelErro] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getAlertsEnabled().then(setAlertasVariacaoState);
    getEmailRelatoriosAtivo().then(setEmailRelatoriosState);
  }, [isAuthenticated]);

  // Gate Premium — usuario free tentando ativar funcionalidade premium e redirecionado para /premium em vez de toggle.
  const tentarAtivarPremium = (): boolean => {
    if (!isPremium && !premiumLoading) {
      router.push('/premium');
      return true;
    }
    return false;
  };

  const toggleAlertasVariacao = async () => {
    if (tentarAtivarPremium()) return;
    const next = !alertasVariacao;
    setAlertasVariacaoState(next);
    await setAlertsEnabled(next);
  };

  const toggleEmailRelatorios = async () => {
    if (tentarAtivarPremium()) return;
    const next = !emailRelatorios;
    setEmailRelatoriosState(next);
    await setEmailRelatoriosAtivo(next);
  };

  const enviarRelatorioTeste = async () => {
    if (enviandoTeste) return;
    setEnviandoTeste(true);
    setTesteResultado(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setTesteResultado({ ok: false, msg: 'Sessao nao encontrada — refaca login' });
        return;
      }
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setTesteResultado({
          ok: true,
          msg: `E-mail enviado para ${json.sentTo}.`,
        });
      } else {
        setTesteResultado({
          ok: false,
          msg: json.error || json.resendError || `Erro ${res.status}`,
        });
      }
    } catch (e) {
      setTesteResultado({
        ok: false,
        msg: e instanceof Error ? e.message : 'Falha no envio',
      });
    } finally {
      setEnviandoTeste(false);
    }
  };

  const handleCancelarAssinatura = async () => {
    if (cancelando) return;
    setCancelando(true);
    setCancelErro(null);
    try {
      await cancelSubscription();
      await refreshPremium();
      setConfirmandoCancelamento(false);
    } catch (e) {
      setCancelErro(e instanceof Error ? e.message : 'Falha ao cancelar assinatura');
    } finally {
      setCancelando(false);
    }
  };

  // Assinatura paga real (whitelist/vitalicio tem expiresAt null e nao pode cancelar)
  const temAssinaturaPaga =
    !!subscriptionState.expiresAt &&
    (subscriptionState.status === 'active' || subscriptionState.status === 'cancelled');

  if (authLoading) return null;

  return (
    <DashboardLayout>
      {/* settings-wrap — max 760px centralizado, fiel ao mockup */}
      <div className="max-w-[760px] mx-auto px-6 py-8">

        {/* settings-head */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-7"
        >
          <div>
            <h1
              className="text-[26px] font-bold tracking-tight"
              style={{ color: 'var(--t1)' }}
            >
              Configurações
            </h1>
            <p className="text-[13.5px] mt-1" style={{ color: 'var(--t2)' }}>
              Personalize sua experiência na plataforma
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 grid place-items-center rounded-full transition-colors hover:bg-[var(--glass)]"
            style={{ color: 'var(--t2)' }}
            title="Voltar ao Dashboard"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* === APARENCIA === */}
        <SettingSection
          delay={0.05}
          icon={theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          title="Aparência"
          description="Escolha o tema da interface"
        >
          {/* theme-grid */}
          <div className="grid grid-cols-2 gap-3">
            <ThemeOption
              kind="claro"
              label="Claro"
              icon={<Sun />}
              active={theme === 'light'}
              onClick={() => setTheme('light')}
            />
            <ThemeOption
              kind="escuro"
              label="Escuro"
              icon={<Moon />}
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
            />
          </div>
        </SettingSection>

        {/* === FUNCIONALIDADES PREMIUM === */}
        <SettingSection
          delay={0.07}
          icon={<Sparkles className="w-5 h-5" />}
          title="Funcionalidades Premium"
          description="Alertas e relatórios automáticos da sua carteira"
        >
          {/* Banner free — convida upgrade quando usuario nao e Premium */}
          {!premiumLoading && !isPremium && (
            <button
              type="button"
              onClick={() => router.push('/premium')}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-[var(--r-md)] transition-colors hover:opacity-90 text-left"
              style={{
                background:
                  'linear-gradient(135deg, rgba(0,184,217,0.10), transparent 60%), var(--surface-2)',
                border: '1px solid rgba(0,184,217,0.30)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-[var(--r-md)] grid place-items-center shrink-0"
                  style={{ background: 'rgba(0,184,217,0.15)', color: 'var(--cyan)' }}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <strong className="text-[13.5px] font-semibold block" style={{ color: 'var(--t1)' }}>
                    Disponível no plano Premium
                  </strong>
                  <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                    Ative alertas em tempo real e o relatório diário por e-mail.
                  </span>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-[var(--r-pill)] shrink-0"
                style={{ background: 'var(--cyan)', color: 'white' }}
              >
                Fazer upgrade
                <ChevronRight className="w-3 h-3" />
              </span>
            </button>
          )}

          <ToggleRow
            icon={<TrendingUp className="w-4 h-4" />}
            label="Alertas de variação"
            description="Notificação quando um ativo variar mais de 5%"
            value={isPremium && alertasVariacao}
            onToggle={toggleAlertasVariacao}
            locked={!isPremium}
            first
          />
          <ToggleRow
            icon={<Mail className="w-4 h-4" />}
            label="Relatórios diários"
            description="Resumo diário da sua carteira enviado todos os dias às 8h"
            value={isPremium && emailRelatorios}
            onToggle={toggleEmailRelatorios}
            locked={!isPremium}
          />

          {/* Botao de teste de envio — apenas para Premium */}
          {isPremium && (
            <>
              <div
                className="flex items-center justify-between gap-3 pt-3.5"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="text-[12px]" style={{ color: 'var(--t2)' }}>
                  Não está recebendo? Dispare um envio de teste agora para validar.
                </div>
                <button
                  type="button"
                  onClick={enviarRelatorioTeste}
                  disabled={enviandoTeste}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--r-sm)] text-[12.5px] font-semibold transition-colors disabled:opacity-50 shrink-0"
                  style={{
                    background: 'var(--cyan)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(0,184,217,0.28)',
                  }}
                >
                  {enviandoTeste ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Enviar teste agora
                    </>
                  )}
                </button>
              </div>

              {testeResultado && (
                <div
                  className="mt-3 px-3.5 py-3 rounded-[var(--r-md)] text-[12.5px] leading-relaxed"
                  style={{
                    background: testeResultado.ok
                      ? 'rgba(16,185,129,0.10)'
                      : 'rgba(239,68,68,0.10)',
                    border: `1px solid ${testeResultado.ok ? 'rgba(16,185,129,0.30)' : 'rgba(239,68,68,0.30)'}`,
                    color: testeResultado.ok ? 'var(--gain)' : 'var(--loss)',
                  }}
                >
                  {testeResultado.msg}
                </div>
              )}
            </>
          )}
        </SettingSection>

        {/* === ASSINATURA === (apenas para quem tem assinatura paga real) */}
        {temAssinaturaPaga && (
          <SettingSection
            delay={0.09}
            icon={<Crown className="w-5 h-5" />}
            title="Assinatura Premium"
            description="Gerencie seu plano e renovação"
          >
            {/* Resumo do plano */}
            <div
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[var(--r-md)] mb-4"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div className="min-w-0">
                <strong className="text-[14px] font-semibold flex items-center gap-2" style={{ color: 'var(--t1)' }}>
                  Plano {subscriptionState.plan === 'anual' ? 'Anual' : 'Mensal'}
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background:
                        subscriptionState.status === 'cancelled'
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(16,185,129,0.12)',
                      color:
                        subscriptionState.status === 'cancelled' ? 'var(--warn)' : 'var(--gain)',
                    }}
                  >
                    {subscriptionState.status === 'cancelled' ? 'Cancelada' : 'Ativa'}
                  </span>
                </strong>
                <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                  {subscriptionState.status === 'cancelled'
                    ? `Acesso Premium até ${formatarData(subscriptionState.expiresAt)} — sem renovação`
                    : `Próxima renovação em ${formatarData(subscriptionState.expiresAt)}`}
                </span>
              </div>
            </div>

            {/* Acao de cancelar — somente quando ainda esta ativa */}
            {subscriptionState.status === 'active' && (
              <>
                {!confirmandoCancelamento ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelErro(null);
                      setConfirmandoCancelamento(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13px] font-semibold transition-colors"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.30)',
                      color: 'var(--loss)',
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancelar assinatura
                  </button>
                ) : (
                  <div
                    className="px-4 py-3.5 rounded-[var(--r-md)]"
                    style={{
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    <div className="flex items-start gap-2.5 mb-3.5">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--loss)' }} />
                      <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--t1)' }}>
                        Tem certeza? Você continuará com acesso Premium até{' '}
                        <strong>{formatarData(subscriptionState.expiresAt)}</strong>, mas a
                        assinatura não será renovada.
                      </p>
                    </div>

                    {cancelErro && (
                      <div
                        className="mb-3 px-3 py-2 rounded-[var(--r-sm)] text-[12px]"
                        style={{
                          background: 'rgba(239,68,68,0.10)',
                          border: '1px solid rgba(239,68,68,0.30)',
                          color: 'var(--loss)',
                        }}
                      >
                        {cancelErro}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleCancelarAssinatura}
                        disabled={cancelando}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[var(--r-sm)] text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                        style={{ background: 'var(--loss)', color: 'white' }}
                      >
                        {cancelando ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Cancelando…
                          </>
                        ) : (
                          'Sim, cancelar'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoCancelamento(false)}
                        disabled={cancelando}
                        className="flex-1 px-3.5 py-2 rounded-[var(--r-sm)] text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--t1)',
                        }}
                      >
                        Manter assinatura
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Quando ja cancelada, oferece reativar */}
            {subscriptionState.status === 'cancelled' && (
              <button
                type="button"
                onClick={() => router.push('/premium')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--cyan)', color: 'white' }}
              >
                <Sparkles className="w-4 h-4" />
                Reativar Premium
              </button>
            )}
          </SettingSection>
        )}

        {/* === CONTA E SEGURANCA === */}
        <SettingSection
          delay={0.1}
          icon={<Shield className="w-5 h-5" />}
          title="Conta e Segurança"
          description="Gerencie seus dados pessoais"
        >
          <RowLink
            icon={<User className="w-4 h-4" />}
            label="Dados pessoais"
            description="Nome, email e foto de perfil"
            onClick={() => router.push('/perfil')}
            first
          />
          <RowLink
            icon={<Shield className="w-4 h-4" />}
            label="Segurança"
            description="Alterar senha"
            onClick={() => router.push('/perfil')}
          />
        </SettingSection>

      </div>
    </DashboardLayout>
  );
}

// Formata ISO date para "12 de março de 2026" (pt-BR). Retorna '—' se invalido.
function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Section card ───────────────────────────────────────────────────────────────

function SettingSection({
  icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[var(--r-lg)] px-6 py-5 mb-4"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3.5 mb-[18px]">
        <div
          className="w-10 h-10 rounded-[var(--r-md)] grid place-items-center shrink-0"
          style={{ background: 'rgba(0,184,217,0.12)', color: 'var(--cyan)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
            {title}
          </h3>
          <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--t2)' }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

// ── Theme option (Claro / Escuro) ─────────────────────────────────────────────

function ThemeOption({
  kind,
  label,
  icon,
  active,
  onClick,
}: {
  kind: 'claro' | 'escuro';
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const iconColor = kind === 'claro' ? 'var(--warn)' : '#818CF8';
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-2.5 px-6 py-[22px] rounded-[var(--r-md)] transition-all text-[14px] font-semibold"
      style={{
        background: 'var(--surface-2)',
        border: active ? '1px solid var(--cyan)' : '1px solid var(--border)',
        boxShadow: active ? '0 0 0 1px var(--cyan)' : 'none',
        color: 'var(--t1)',
      }}
    >
      <span className="w-6 h-6 grid place-items-center" style={{ color: iconColor }}>
        {icon}
      </span>
      {label}
      {active && (
        <span
          className="absolute top-2 right-2 w-5 h-5 rounded-full grid place-items-center"
          style={{ background: 'var(--cyan)' }}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
  first,
  locked,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  first?: boolean;
  /** Quando true, mostra badge Premium ao inves do switch e estado mutado. */
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3.5 py-3.5"
      style={{
        borderTop: first ? 'none' : '1px solid var(--border)',
        paddingTop: first ? 0 : undefined,
        opacity: locked ? 0.65 : 1,
      }}
    >
      <div
        className="w-8 h-8 rounded-[var(--r-sm)] grid place-items-center shrink-0"
        style={{ background: 'var(--surface-2)', color: 'var(--cyan)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <strong
          className="text-[14px] font-semibold flex items-center gap-2"
          style={{ color: 'var(--t1)' }}
        >
          {label}
          {locked && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(0,184,217,0.15)', color: 'var(--cyan)' }}
            >
              <Lock className="w-2.5 h-2.5" />
              Premium
            </span>
          )}
        </strong>
        <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
          {description}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={value}
        aria-label={locked ? `${label} (recurso premium)` : label}
        className="relative w-11 h-6 rounded-[var(--r-pill)] transition-colors shrink-0"
        style={{ background: value ? 'var(--cyan)' : 'var(--surface-3)' }}
      >
        <span
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
          style={{ left: value ? '23px' : '3px' }}
        />
      </button>
    </div>
  );
}

// ── Row link (Conta / Seguranca) ──────────────────────────────────────────────

function RowLink({
  icon,
  label,
  description,
  onClick,
  first,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  first?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3.5 py-3.5 transition-opacity hover:opacity-80 text-left"
      style={{
        borderTop: first ? 'none' : '1px solid var(--border)',
        paddingTop: first ? 0 : undefined,
      }}
    >
      <div
        className="w-8 h-8 rounded-[var(--r-sm)] grid place-items-center shrink-0"
        style={{ background: 'var(--surface-2)', color: 'var(--cyan)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <strong className="text-[14px] font-semibold block" style={{ color: 'var(--t1)' }}>
          {label}
        </strong>
        <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
          {description}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--t2)' }} />
    </button>
  );
}
