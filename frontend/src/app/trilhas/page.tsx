'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Play, ChevronLeft, ChevronRight, Plus, Check,
  GraduationCap, TrendingUp, PiggyBank, Coins, BarChart2,
  FileText, Star, BookOpen, Building, Landmark, Globe, X,
  Clock, Signal,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Level = 'Iniciante' | 'Intermediário' | 'Avançado';

interface VideoCard {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  categoryLabel: string;
  duration: string;
  level: Level;
  gradient: string;
  icon: React.ElementType;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  label: string;
  gradient: string;
  cta: string;
}

// ─── Hero slides ──────────────────────────────────────────────────────────────

const HERO_SLIDES: HeroSlide[] = [
  {
    label: 'NOVIDADE NA ÁREA!',
    title: 'Aprenda a montar\nsua carteira de\ninvestimentos.',
    subtitle: 'DO ZERO AO PATRIMÔNIO: JORNADA NUVARY',
    gradient: 'from-[#0B1F33] via-[#1e3a5f] to-[#00B8D9]',
    cta: 'Começar Agora',
  },
  {
    label: 'MAIS ASSISTIDO',
    title: 'Renda Fixa ou\nVariável? Entenda\na diferença.',
    subtitle: 'RENDA FIXA: CDI, SELIC E IPCA NA PRÁTICA',
    gradient: 'from-[#1e3a5f] via-[#0B1F33] to-[#4f46e5]',
    cta: 'Assistir Agora',
  },
  {
    label: 'MASTERCLASS',
    title: 'Análise técnica\ndo zero ao\navançado.',
    subtitle: 'ANÁLISE GRÁFICA COM CANDLESTICKS E INDICADORES',
    gradient: 'from-[#0B1F33] via-[#374151] to-[#1e3a5f]',
    cta: 'Assistir Agora',
  },
];

// ─── Categorias de navegação ──────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'jornada', label: 'JORNADA' },
  { id: 'populares', label: 'MAIS POPULARES' },
  { id: 'renda_fixa', label: 'RENDA FIXA' },
  { id: 'renda_variavel', label: 'RENDA VARIÁVEL' },
  { id: 'fiis', label: 'FIIs' },
  { id: 'cripto', label: 'CRIPTOMOEDAS' },
  { id: 'analise', label: 'ANÁLISE TÉCNICA' },
  { id: 'imposto_renda', label: 'IMPOSTO DE RENDA' },
];

// ─── Base de vídeos ───────────────────────────────────────────────────────────

const VIDEOS: VideoCard[] = [
  // Jornada
  { id: 'j1', title: 'Comece a Investir do Zero', category: 'jornada', categoryLabel: 'JORNADA', duration: '12:30', level: 'Iniciante', gradient: 'from-[#1e3a5f] to-[#00B8D9]', icon: GraduationCap },
  { id: 'j2', title: 'Conhecendo seu Perfil de Investidor', category: 'jornada', categoryLabel: 'JORNADA', duration: '8:45', level: 'Iniciante', gradient: 'from-[#0B1F33] to-[#1e3a5f]', icon: Star },
  { id: 'j3', title: 'Como Funciona o Mercado Financeiro', category: 'jornada', categoryLabel: 'JORNADA', duration: '15:20', level: 'Iniciante', gradient: 'from-[#1e3a5f] to-[#4f46e5]', icon: BookOpen },
  { id: 'j4', title: 'Montando sua Primeira Carteira', category: 'jornada', categoryLabel: 'JORNADA', duration: '18:10', level: 'Iniciante', gradient: 'from-[#0B1F33] to-[#00B8D9]', icon: GraduationCap },
  { id: 'j5', title: 'Diversificação de Investimentos', category: 'jornada', categoryLabel: 'JORNADA', duration: '11:55', level: 'Intermediário', gradient: 'from-[#1e3a5f] to-[#6366f1]', icon: Star },
  { id: 'j6', title: 'Reserva de Emergência: Quanto Guardar?', category: 'jornada', categoryLabel: 'JORNADA', duration: '9:30', level: 'Iniciante', gradient: 'from-[#0B1F33] to-[#4f46e5]', icon: BookOpen },

  // Populares
  { id: 'p1', title: 'O que é CDI e Selic?', category: 'populares', categoryLabel: 'POPULAR', duration: '9:15', level: 'Iniciante', gradient: 'from-amber-700 to-amber-500', icon: TrendingUp },
  { id: 'p2', title: 'Renda Fixa vs Renda Variável', category: 'populares', categoryLabel: 'POPULAR', duration: '14:30', level: 'Iniciante', gradient: 'from-orange-700 to-orange-500', icon: BarChart2 },
  { id: 'p3', title: 'Juros Compostos na Prática', category: 'populares', categoryLabel: 'POPULAR', duration: '10:20', level: 'Iniciante', gradient: 'from-amber-800 to-yellow-500', icon: TrendingUp },
  { id: 'p4', title: 'Como Declarar Investimentos no IR', category: 'populares', categoryLabel: 'POPULAR', duration: '22:00', level: 'Intermediário', gradient: 'from-orange-800 to-amber-600', icon: FileText },
  { id: 'p5', title: 'Análise Fundamentalista para Iniciantes', category: 'populares', categoryLabel: 'POPULAR', duration: '16:45', level: 'Intermediário', gradient: 'from-amber-900 to-amber-600', icon: BookOpen },
  { id: 'p6', title: 'O que são Dividendos?', category: 'populares', categoryLabel: 'POPULAR', duration: '8:10', level: 'Iniciante', gradient: 'from-yellow-700 to-amber-500', icon: Star },

  // Renda Fixa
  { id: 'rf1', title: 'CDB, LCI e LCA: Qual Escolher?', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '13:20', level: 'Iniciante', gradient: 'from-[#1e3a5f] to-[#0066CC]', icon: PiggyBank },
  { id: 'rf2', title: 'Tesouro Direto: Guia Completo', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '20:15', level: 'Iniciante', gradient: 'from-[#0B1F33] to-[#1e3a5f]', icon: Landmark },
  { id: 'rf3', title: 'Como Funciona o IPCA+', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '11:40', level: 'Intermediário', gradient: 'from-blue-900 to-blue-600', icon: TrendingUp },
  { id: 'rf4', title: 'Debêntures e CRI/CRA', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '17:55', level: 'Avançado', gradient: 'from-[#0B1F33] to-blue-700', icon: FileText },
  { id: 'rf5', title: 'Tesouro Prefixado ou IPCA+?', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '14:10', level: 'Intermediário', gradient: 'from-blue-800 to-[#00B8D9]', icon: BarChart2 },
  { id: 'rf6', title: 'Rentabilidade Líquida: Calculando o IR', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '10:35', level: 'Intermediário', gradient: 'from-[#1e3a5f] to-sky-600', icon: FileText },

  // Renda Variável
  { id: 'rv1', title: 'Como Comprar sua Primeira Ação', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '15:30', level: 'Iniciante', gradient: 'from-[#4f46e5] to-[#7c3aed]', icon: TrendingUp },
  { id: 'rv2', title: 'ETFs - Fundos de Índice na Prática', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '12:45', level: 'Iniciante', gradient: 'from-[#6366f1] to-[#4f46e5]', icon: BarChart2 },
  { id: 'rv3', title: 'Dividendos: Renda Passiva com Ações', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '18:20', level: 'Intermediário', gradient: 'from-[#7c3aed] to-[#6366f1]', icon: Star },
  { id: 'rv4', title: 'BDRs: Investindo no Exterior pela B3', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '16:00', level: 'Intermediário', gradient: 'from-[#4338ca] to-[#6366f1]', icon: Globe },
  { id: 'rv5', title: 'Small Caps vs Blue Chips', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '13:55', level: 'Avançado', gradient: 'from-[#5b21b6] to-[#7c3aed]', icon: TrendingUp },
  { id: 'rv6', title: 'P/L, P/VP e EV/EBITDA', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '19:40', level: 'Avançado', gradient: 'from-violet-800 to-purple-600', icon: BookOpen },

  // FIIs
  { id: 'fii1', title: 'O que são Fundos Imobiliários?', category: 'fiis', categoryLabel: 'FIIs', duration: '11:20', level: 'Iniciante', gradient: 'from-emerald-800 to-emerald-600', icon: Building },
  { id: 'fii2', title: 'FIIs de Papel vs Tijolo', category: 'fiis', categoryLabel: 'FIIs', duration: '14:35', level: 'Intermediário', gradient: 'from-green-800 to-emerald-600', icon: Building },
  { id: 'fii3', title: 'Dividend Yield em FIIs', category: 'fiis', categoryLabel: 'FIIs', duration: '10:50', level: 'Intermediário', gradient: 'from-teal-700 to-emerald-600', icon: TrendingUp },
  { id: 'fii4', title: 'Como Analisar um FII', category: 'fiis', categoryLabel: 'FIIs', duration: '19:15', level: 'Intermediário', gradient: 'from-[#059669] to-[#10b981]', icon: BarChart2 },
  { id: 'fii5', title: 'Carteira de FIIs para Iniciantes', category: 'fiis', categoryLabel: 'FIIs', duration: '16:40', level: 'Iniciante', gradient: 'from-emerald-900 to-teal-700', icon: GraduationCap },
  { id: 'fii6', title: 'Vacância e FFO: Indicadores Chave', category: 'fiis', categoryLabel: 'FIIs', duration: '13:00', level: 'Avançado', gradient: 'from-green-900 to-emerald-700', icon: FileText },

  // Criptomoedas
  { id: 'c1', title: 'Bitcoin para Iniciantes', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '13:10', level: 'Iniciante', gradient: 'from-amber-700 to-yellow-500', icon: Coins },
  { id: 'c2', title: 'Ethereum e Contratos Inteligentes', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '15:25', level: 'Intermediário', gradient: 'from-purple-700 to-violet-600', icon: Coins },
  { id: 'c3', title: 'Carteiras Cripto: Hot vs Cold Wallet', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '12:00', level: 'Intermediário', gradient: 'from-orange-700 to-amber-500', icon: Star },
  { id: 'c4', title: 'Riscos das Criptomoedas', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '9:45', level: 'Iniciante', gradient: 'from-red-700 to-orange-600', icon: BookOpen },
  { id: 'c5', title: 'DeFi e Staking Explicados', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '17:30', level: 'Avançado', gradient: 'from-purple-800 to-indigo-600', icon: Coins },
  { id: 'c6', title: 'NFTs: Entendendo o Hype', category: 'cripto', categoryLabel: 'CRIPTOMOEDAS', duration: '11:15', level: 'Intermediário', gradient: 'from-indigo-700 to-purple-600', icon: Star },

  // Análise Técnica
  { id: 'at1', title: 'Análise Gráfica para Iniciantes', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '16:00', level: 'Iniciante', gradient: 'from-slate-700 to-slate-500', icon: BarChart2 },
  { id: 'at2', title: 'Candlesticks: Lendo o Mercado', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '18:45', level: 'Intermediário', gradient: 'from-gray-800 to-gray-600', icon: TrendingUp },
  { id: 'at3', title: 'Suporte, Resistência e Rompimento', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '14:20', level: 'Intermediário', gradient: 'from-[#0B1F33] to-slate-600', icon: BarChart2 },
  { id: 'at4', title: 'Médias Móveis na Prática', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '12:35', level: 'Intermediário', gradient: 'from-slate-800 to-[#1e3a5f]', icon: TrendingUp },
  { id: 'at5', title: 'RSI, MACD e IFR', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '20:50', level: 'Avançado', gradient: 'from-gray-900 to-slate-700', icon: BarChart2 },
  { id: 'at6', title: 'Ondas de Elliott Simplificadas', category: 'analise', categoryLabel: 'ANÁLISE TÉCNICA', duration: '22:10', level: 'Avançado', gradient: 'from-[#1e3a5f] to-gray-700', icon: TrendingUp },

  // Imposto de Renda
  { id: 'ir1', title: 'IR sobre Investimentos: Regras Gerais', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '14:15', level: 'Iniciante', gradient: 'from-[#374151] to-[#6B7280]', icon: FileText },
  { id: 'ir2', title: 'Como Declarar Ações no IR', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '22:30', level: 'Intermediário', gradient: 'from-gray-800 to-gray-600', icon: FileText },
  { id: 'ir3', title: 'FIIs e a Isenção de Imposto de Renda', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '11:00', level: 'Iniciante', gradient: 'from-[#374151] to-[#4B5563]', icon: Building },
  { id: 'ir4', title: 'Nota de Corretagem Explicada', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '13:40', level: 'Iniciante', gradient: 'from-gray-800 to-gray-600', icon: FileText },
  { id: 'ir5', title: 'Cripto e Imposto de Renda', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '17:20', level: 'Intermediário', gradient: 'from-slate-700 to-gray-600', icon: Coins },
  { id: 'ir6', title: 'Day Trade: Tributação Específica', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '16:05', level: 'Avançado', gradient: 'from-gray-900 to-slate-700', icon: BarChart2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<Level, string> = {
  'Iniciante': 'bg-emerald-500',
  'Intermediário': 'bg-amber-500',
  'Avançado': 'bg-red-500',
};

const CATEGORY_ACCENT: Record<string, string> = {
  jornada: 'text-[#00B8D9]',
  populares: 'text-amber-400',
  renda_fixa: 'text-sky-400',
  renda_variavel: 'text-violet-400',
  fiis: 'text-emerald-400',
  cripto: 'text-amber-400',
  analise: 'text-slate-300',
  imposto_renda: 'text-gray-300',
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function VideoCardItem({
  video,
  saved,
  onSave,
  onClick,
}: {
  video: VideoCard;
  saved: boolean;
  onSave: (id: string) => void;
  onClick: (video: VideoCard) => void;
}) {
  const Icon = video.icon;
  const accent = CATEGORY_ACCENT[video.category] || 'text-[#00B8D9]';

  return (
    <div
      className="flex-shrink-0 w-56 group cursor-pointer"
      onClick={() => onClick(video)}
    >
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-3">
        <div className={`bg-gradient-to-br ${video.gradient} aspect-video flex items-end p-3`}>
          <Icon className="absolute top-3 right-3 w-8 h-8 text-white/20" />
          <p className="text-white font-semibold text-sm leading-tight line-clamp-2 z-10">
            {video.title}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <span className="text-white text-xs font-medium">Em breve</span>
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {video.duration}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold mb-1 ${accent}`}>
            {video.categoryLabel}
          </p>
          <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-[#00B8D9] transition-colors">
            {video.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium ${LEVEL_COLOR[video.level]}`}>
              {video.level}
            </span>
            <span className="text-muted-foreground text-xs flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSave(video.id); }}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
            saved
              ? 'bg-[#00B8D9] border-[#00B8D9] text-white'
              : 'border-[#6B7280] text-[#6B7280] hover:border-[#00B8D9] hover:text-[#00B8D9]'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function VideoSection({
  categoryId,
  title,
  videos,
  savedList,
  onSave,
  onVideoClick,
}: {
  categoryId: string;
  title: string;
  videos: VideoCard[];
  savedList: Set<string>;
  onSave: (id: string) => void;
  onVideoClick: (v: VideoCard) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section id={categoryId} className="mb-10 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium cursor-pointer hover:text-[#00B8D9] transition-colors">
            VER TUDO
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <VideoCardItem
            key={video.id}
            video={video}
            saved={savedList.has(video.id)}
            onSave={onSave}
            onClick={onVideoClick}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TrilhasPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('jornada');
  const [savedList, setSavedList] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<VideoCard | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-rotação do hero a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detecta seção ativa no scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    CATEGORIES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const handleSave = useCallback((id: string) => {
    setSavedList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const scrollToCategory = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategory(id);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
      </div>
    );
  }

  const slide = HERO_SLIDES[heroIndex];

  return (
    <DashboardLayout>
      {/* Modal "Em Breve" */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setSelectedVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className={`bg-gradient-to-br ${selectedVideo.gradient} p-8 flex flex-col items-center gap-4`}>
                  <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <p className="text-white font-bold text-center text-lg leading-tight">
                    {selectedVideo.title}
                  </p>
                </div>
                <div className="p-6 text-center">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-3 ${LEVEL_COLOR[selectedVideo.level]}`}>
                    {selectedVideo.level}
                  </span>
                  <p className="text-foreground font-semibold text-base mb-1">
                    Vídeo em produção
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Este conteúdo estará disponível em breve. Adicione à sua lista para ser notificado!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-5">
                    <Clock className="w-4 h-4" />
                    <span>Duração estimada: {selectedVideo.duration}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(selectedVideo.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        savedList.has(selectedVideo.id)
                          ? 'bg-[#00B8D9] text-white'
                          : 'border-2 border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9]/10'
                      }`}
                    >
                      {savedList.has(selectedVideo.id) ? (
                        <><Check className="w-4 h-4" /> Na minha lista</>
                      ) : (
                        <><Plus className="w-4 h-4" /> Adicionar à lista</>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">

        {/* ── Hero Banner ── */}
        <div className={`relative bg-gradient-to-r ${slide.gradient} overflow-hidden`}
          style={{ minHeight: 280 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="px-6 py-10 md:px-12 max-w-3xl"
            >
              <div className="inline-block bg-[#00B8D9] text-white text-xs font-bold px-3 py-1 rounded mb-4 tracking-widest">
                {slide.label}
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-5 whitespace-pre-line">
                {slide.title}
              </h1>
              <button className="bg-[#00B8D9] hover:bg-[#007EA7] text-white font-bold text-sm px-6 py-3 rounded-full transition-colors">
                {slide.cta}
              </button>
              <p className="text-white/60 text-xs mt-4 tracking-wider uppercase">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="absolute bottom-4 left-6 md:left-12 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === heroIndex ? 'bg-[#00B8D9] w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Hero nav arrows */}
          <button
            onClick={() => setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ── Category Nav (sticky) ── */}
        <div
          ref={navRef}
          className="sticky top-0 z-40 bg-[#0B1F33] shadow-lg overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex min-w-max px-4">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToCategory(id)}
                className={`px-4 py-4 text-xs font-bold tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  activeCategory === id
                    ? 'text-[#00B8D9] border-[#00B8D9]'
                    : 'text-white/60 border-transparent hover:text-white/90'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conteúdo por categoria ── */}
        <div className="px-6 py-8 max-w-7xl mx-auto">

          {/* Minha Lista badge */}
          {savedList.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 bg-[#00B8D9]/10 border border-[#00B8D9]/30 rounded-xl px-4 py-3"
            >
              <Check className="w-4 h-4 text-[#00B8D9]" />
              <span className="text-sm text-foreground font-medium">
                {savedList.size} vídeo{savedList.size > 1 ? 's' : ''} na sua lista
              </span>
            </motion.div>
          )}

          {CATEGORIES.map(({ id, label }) => {
            const videos = VIDEOS.filter((v) => v.category === id);
            return (
              <VideoSection
                key={id}
                categoryId={id}
                title={label.charAt(0) + label.slice(1).toLowerCase().replace(/ ([a-z])/g, (_, c) => ` ${c.toUpperCase()}`)}
                videos={videos}
                savedList={savedList}
                onSave={handleSave}
                onVideoClick={setSelectedVideo}
              />
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="bg-[#0B1F33] py-8 px-6 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <span className="text-white/50 text-sm hover:text-white/80 cursor-pointer transition-colors">Termos de Uso e Privacidade</span>
            <span className="text-white/50 text-sm hover:text-white/80 cursor-pointer transition-colors">Atendimento</span>
          </div>
          <p className="text-white/30 text-xs">© Nuvary Invest {new Date().getFullYear()}</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
