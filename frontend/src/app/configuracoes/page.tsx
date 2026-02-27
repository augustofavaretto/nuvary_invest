'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Mail,
  TrendingUp,
  MessageSquare,
  Shield,
  User,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';

type NotifKey =
  | 'email_relatorios'
  | 'email_alertas'
  | 'dashboard_noticias'
  | 'dashboard_variacao'
  | 'chat_sugestoes';

interface Preferencias {
  notificacoes: Record<NotifKey, boolean>;
}

const STORAGE_KEY = 'nuvary_preferencias';

const defaultPreferencias: Preferencias = {
  notificacoes: {
    email_relatorios: true,
    email_alertas: false,
    dashboard_noticias: true,
    dashboard_variacao: true,
    chat_sugestoes: true,
  },
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [preferencias, setPreferencias] = useState<Preferencias>(defaultPreferencias);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPreferencias(JSON.parse(saved));
    } catch {
      // usa padrão
    }
  }, []);

  const toggleNotif = (key: NotifKey) => {
    setPreferencias(prev => ({
      ...prev,
      notificacoes: { ...prev.notificacoes, [key]: !prev.notificacoes[key] },
    }));
  };

  const salvarPreferencias = () => {
    setSalvando(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
    setTimeout(() => {
      setSalvando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    }, 600);
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

          <div className="grid grid-cols-3 gap-3">
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

            {/* Sistema */}
            <button
              onClick={() => {
                const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setTheme(sys);
              }}
              className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-muted-foreground/40 transition-all"
            >
              <Monitor className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sistema</span>
            </button>
          </div>
        </motion.section>

        {/* === NOTIFICAÇÕES === */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Preferências de Notificação</h2>
              <p className="text-xs text-muted-foreground">Escolha o que deseja receber</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Por e-mail
            </p>

            <NotifToggle
              icon={<Mail className="w-4 h-4" />}
              label="Relatórios semanais"
              description="Resumo semanal da sua carteira e desempenho"
              value={preferencias.notificacoes.email_relatorios}
              onToggle={() => toggleNotif('email_relatorios')}
            />
            <NotifToggle
              icon={<TrendingUp className="w-4 h-4" />}
              label="Alertas de variação"
              description="Notificação quando um ativo variar mais de 5%"
              value={preferencias.notificacoes.email_alertas}
              onToggle={() => toggleNotif('email_alertas')}
            />

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4 px-1">
              No dashboard
            </p>

            <NotifToggle
              icon={<Bell className="w-4 h-4" />}
              label="Notícias financeiras"
              description="Exibir widget de notícias no dashboard"
              value={preferencias.notificacoes.dashboard_noticias}
              onToggle={() => toggleNotif('dashboard_noticias')}
            />
            <NotifToggle
              icon={<TrendingUp className="w-4 h-4" />}
              label="Variação do portfólio"
              description="Exibir variação diária no header"
              value={preferencias.notificacoes.dashboard_variacao}
              onToggle={() => toggleNotif('dashboard_variacao')}
            />
            <NotifToggle
              icon={<MessageSquare className="w-4 h-4" />}
              label="Sugestões do assistente IA"
              description="Mostrar sugestões personalizadas no dashboard"
              value={preferencias.notificacoes.chat_sugestoes}
              onToggle={() => toggleNotif('chat_sugestoes')}
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

        {/* Botão salvar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <button
            onClick={salvarPreferencias}
            disabled={salvando}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {salvo ? (
              <>
                <Check className="w-4 h-4" />
                Salvo!
              </>
            ) : salvando ? (
              'Salvando...'
            ) : (
              'Salvar preferências'
            )}
          </button>
        </motion.div>

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
