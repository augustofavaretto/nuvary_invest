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
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [alertasVariacao, setAlertasVariacaoState] = useState(true);
  const [emailRelatorios, setEmailRelatoriosState] = useState(false);

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

  if (authLoading) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Personalize sua experiência na plataforma
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Voltar ao Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* === APARÊNCIA === */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Aparência</h2>
              <p className="text-xs text-muted-foreground">Escolha o tema da interface</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Claro */}
            <button
              onClick={() => setTheme('light')}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Claro</span>
              {theme === 'light' && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>

            {/* Escuro */}
            <button
              onClick={() => setTheme('dark')}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400" />
              <span className="text-sm font-medium text-foreground">Escuro</span>
              {theme === 'dark' && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          </div>
        </motion.section>

        {/* === FUNCIONALIDADES PREMIUM === */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Funcionalidades Premium</h2>
              <p className="text-xs text-muted-foreground">Alertas e relatórios automáticos da sua carteira</p>
            </div>
          </div>

          <div className="space-y-1">
            <NotifToggle
              icon={<TrendingUp className="w-4 h-4" />}
              label="Alertas de variação"
              description="Notificação quando um ativo variar mais de 5%"
              value={alertasVariacao}
              onToggle={toggleAlertasVariacao}
            />
            <NotifToggle
              icon={<Mail className="w-4 h-4" />}
              label="Relatórios diários"
              description="Resumo diário da sua carteira enviado todos os dias às 8h"
              value={emailRelatorios}
              onToggle={toggleEmailRelatorios}
            />
          </div>
        </motion.section>

        {/* === CONTA === */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Conta e Segurança</h2>
              <p className="text-xs text-muted-foreground">Gerencie seus dados pessoais</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => router.push('/perfil')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Dados pessoais</p>
                  <p className="text-xs text-muted-foreground">Nome, email e foto de perfil</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={() => router.push('/perfil')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Segurança</p>
                  <p className="text-xs text-muted-foreground">Alterar senha</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </motion.section>

      </div>
    </DashboardLayout>
  );
}

// ── Componente auxiliar de toggle de notificação ──────────────────────────────
function NotifToggle({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <span className={value ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          value ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
