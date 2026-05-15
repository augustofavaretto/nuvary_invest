'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [alertasVariacao, setAlertasVariacaoState] = useState(true);
  const [emailRelatorios, setEmailRelatoriosState] = useState(false);
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [testeResultado, setTesteResultado] = useState<{ ok: boolean; msg: string } | null>(null);

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

  const toggleAlertasVariacao = async () => {
    const next = !alertasVariacao;
    setAlertasVariacaoState(next);
    await setAlertsEnabled(next);
  };

  const toggleEmailRelatorios = async () => {
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
          msg: `E-mail enviado para ${json.sentTo} (Resend ID: ${json.resendId ?? '—'}). ${json.observacao ?? ''}`,
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
          <ToggleRow
            icon={<TrendingUp className="w-4 h-4" />}
            label="Alertas de variação"
            description="Notificação quando um ativo variar mais de 5%"
            value={alertasVariacao}
            onToggle={toggleAlertasVariacao}
            first
          />
          <ToggleRow
            icon={<Mail className="w-4 h-4" />}
            label="Relatórios diários"
            description="Resumo diário da sua carteira enviado todos os dias às 8h"
            value={emailRelatorios}
            onToggle={toggleEmailRelatorios}
          />

          {/* Botao de teste de envio — valida o pipeline e mostra erro detalhado */}
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
        </SettingSection>

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
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  first?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3.5 py-3.5"
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
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={value}
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
