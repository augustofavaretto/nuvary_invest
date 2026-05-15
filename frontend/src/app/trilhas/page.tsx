'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Play, ChevronLeft, ChevronRight, Check,
  GraduationCap, TrendingUp, PiggyBank, BarChart2,
  FileText, Star, BookOpen, Building, Landmark, X,
  Clock, ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Level = 'Iniciante' | 'Intermediário' | 'Avançado';
type ThumbVariant = 't1' | 't2' | 't3' | 't4' | 't5';

interface VideoCard {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  duration: string;
  level: Level;
  thumb: ThumbVariant;
  icon: React.ElementType;
  videoUrl?: string;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  label: string;
  cta: string;
  category: string;
}

// ─── Hero slides ──────────────────────────────────────────────────────────────

const HERO_SLIDES: HeroSlide[] = [
  {
    label: 'NOVIDADE NA ÁREA!',
    title: 'Aprenda a montar sua carteira de investimentos.',
    subtitle: 'DO ZERO AO PATRIMÔNIO: JORNADA NUVARY',
    cta: 'Começar Agora',
    category: 'jornada',
  },
  {
    label: 'MAIS ASSISTIDO',
    title: 'Renda Fixa ou Variável? Entenda a diferença.',
    subtitle: 'RENDA FIXA: CDI, SELIC E IPCA NA PRÁTICA',
    cta: 'Assistir Agora',
    category: 'renda_fixa',
  },
  {
    label: 'MASTERCLASS',
    title: 'Análise técnica do zero ao avançado.',
    subtitle: 'ANÁLISE GRÁFICA COM CANDLESTICKS E INDICADORES',
    cta: 'Assistir Agora',
    category: 'populares',
  },
];

// ─── Categorias de navegacao ──────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'jornada', label: 'JORNADA', display: 'Jornada' },
  { id: 'populares', label: 'MAIS POPULARES', display: 'Mais populares' },
  { id: 'renda_fixa', label: 'RENDA FIXA', display: 'Renda Fixa' },
  { id: 'renda_variavel', label: 'RENDA VARIÁVEL', display: 'Renda Variável' },
  { id: 'fiis', label: 'FIIs', display: 'FIIs' },
  { id: 'imposto_renda', label: 'IMPOSTO DE RENDA', display: 'Imposto de Renda' },
];

// ─── Helper YouTube ───────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

// ─── Base de videos ───────────────────────────────────────────────────────────

const VIDEOS: VideoCard[] = [
  // Jornada
  { id: 'j1', title: 'Comece a Investir do Zero', category: 'jornada', categoryLabel: 'JORNADA', duration: '12:30', level: 'Iniciante', thumb: 't1', icon: GraduationCap, videoUrl: 'https://www.youtube.com/watch?v=dJyJ77GkhBE' },
  { id: 'j2', title: 'Conhecendo seu Perfil de Investidor', category: 'jornada', categoryLabel: 'JORNADA', duration: '8:45', level: 'Iniciante', thumb: 't1', icon: Star, videoUrl: 'https://www.youtube.com/watch?v=shfYMvEXqm4' },
  { id: 'j3', title: 'Como Funciona o Mercado Financeiro', category: 'jornada', categoryLabel: 'JORNADA', duration: '15:20', level: 'Iniciante', thumb: 't1', icon: BookOpen, videoUrl: 'https://www.youtube.com/watch?v=rdYo6GR1MuI' },
  { id: 'j4', title: 'Montando sua Primeira Carteira', category: 'jornada', categoryLabel: 'JORNADA', duration: '18:10', level: 'Iniciante', thumb: 't1', icon: GraduationCap, videoUrl: 'https://www.youtube.com/watch?v=JdJyp__diIc' },
  { id: 'j5', title: 'Diversificação de Investimentos', category: 'jornada', categoryLabel: 'JORNADA', duration: '11:55', level: 'Intermediário', thumb: 't1', icon: Star, videoUrl: 'https://www.youtube.com/watch?v=uuciPHqVYVk' },
  { id: 'j6', title: 'Reserva de Emergência: Quanto Guardar?', category: 'jornada', categoryLabel: 'JORNADA', duration: '9:30', level: 'Iniciante', thumb: 't1', icon: BookOpen, videoUrl: 'https://www.youtube.com/watch?v=shfYMvEXqm4' },

  // Populares
  { id: 'p1', title: 'O que é CDI e Selic?', category: 'populares', categoryLabel: 'POPULAR', duration: '9:15', level: 'Iniciante', thumb: 't2', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=dJyJ77GkhBE' },
  { id: 'p2', title: 'Renda Fixa vs Renda Variável', category: 'populares', categoryLabel: 'POPULAR', duration: '14:30', level: 'Iniciante', thumb: 't2', icon: BarChart2, videoUrl: 'https://www.youtube.com/watch?v=rdYo6GR1MuI' },
  { id: 'p3', title: 'Juros Compostos na Prática', category: 'populares', categoryLabel: 'POPULAR', duration: '10:20', level: 'Iniciante', thumb: 't2', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=uuciPHqVYVk' },
  { id: 'p4', title: 'Como Declarar Investimentos no IR', category: 'populares', categoryLabel: 'POPULAR', duration: '22:00', level: 'Intermediário', thumb: 't2', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=NcOXbDJFPtY' },

  // Renda Fixa
  { id: 'rf1', title: 'CDB, LCI e LCA: Qual Escolher?', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '13:20', level: 'Iniciante', thumb: 't2', icon: PiggyBank, videoUrl: 'https://www.youtube.com/watch?v=shfYMvEXqm4' },
  { id: 'rf2', title: 'Tesouro Direto: Guia Completo', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '20:15', level: 'Iniciante', thumb: 't2', icon: Landmark, videoUrl: 'https://www.youtube.com/watch?v=dJyJ77GkhBE' },
  { id: 'rf3', title: 'Como Funciona o IPCA+', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '11:40', level: 'Intermediário', thumb: 't2', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=rdYo6GR1MuI' },
  { id: 'rf5', title: 'Tesouro Prefixado ou IPCA+?', category: 'renda_fixa', categoryLabel: 'RENDA FIXA', duration: '14:10', level: 'Intermediário', thumb: 't2', icon: BarChart2, videoUrl: 'https://www.youtube.com/watch?v=uuciPHqVYVk' },

  // Renda Variavel
  { id: 'rv1', title: 'Como Comprar sua Primeira Ação', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '15:30', level: 'Iniciante', thumb: 't3', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=rdYo6GR1MuI' },
  { id: 'rv2', title: 'ETFs - Fundos de Índice na Prática', category: 'renda_variavel', categoryLabel: 'RENDA VARIÁVEL', duration: '12:45', level: 'Iniciante', thumb: 't3', icon: BarChart2, videoUrl: 'https://www.youtube.com/watch?v=dJyJ77GkhBE' },

  // FIIs
  { id: 'fii1', title: 'O que são Fundos Imobiliários?', category: 'fiis', categoryLabel: 'FIIs', duration: '11:20', level: 'Iniciante', thumb: 't4', icon: Building, videoUrl: 'https://www.youtube.com/watch?v=4gLDeLA6cz8' },
  { id: 'fii2', title: 'FIIs de Papel vs Tijolo', category: 'fiis', categoryLabel: 'FIIs', duration: '14:35', level: 'Intermediário', thumb: 't4', icon: Building, videoUrl: 'https://www.youtube.com/watch?v=4gLDeLA6cz8' },
  { id: 'fii3', title: 'Dividend Yield em FIIs', category: 'fiis', categoryLabel: 'FIIs', duration: '10:50', level: 'Intermediário', thumb: 't4', icon: TrendingUp, videoUrl: 'https://www.youtube.com/watch?v=8yOeM-yc2sU' },
  { id: 'fii4', title: 'Como Analisar um FII', category: 'fiis', categoryLabel: 'FIIs', duration: '19:15', level: 'Intermediário', thumb: 't4', icon: BarChart2, videoUrl: 'https://www.youtube.com/watch?v=6J8bHlauoSw' },
  { id: 'fii5', title: 'Carteira de FIIs para Iniciantes', category: 'fiis', categoryLabel: 'FIIs', duration: '16:40', level: 'Iniciante', thumb: 't4', icon: GraduationCap, videoUrl: 'https://www.youtube.com/watch?v=8yOeM-yc2sU' },
  { id: 'fii6', title: 'Vacância e FFO: Indicadores Chave', category: 'fiis', categoryLabel: 'FIIs', duration: '13:00', level: 'Avançado', thumb: 't4', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=pLRCrKLsf_k' },

  // Imposto de Renda
  { id: 'ir1', title: 'IR sobre Investimentos: Regras Gerais', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '14:15', level: 'Iniciante', thumb: 't5', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=NcOXbDJFPtY' },
  { id: 'ir2', title: 'Como Declarar Ações no IR', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '22:30', level: 'Intermediário', thumb: 't5', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=v0AZzHEF9Og' },
  { id: 'ir3', title: 'FIIs e a Isenção de Imposto de Renda', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '11:00', level: 'Iniciante', thumb: 't5', icon: Building, videoUrl: 'https://www.youtube.com/watch?v=1LpBOXzgQtA' },
  { id: 'ir4', title: 'Nota de Corretagem Explicada', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '13:40', level: 'Iniciante', thumb: 't5', icon: FileText, videoUrl: 'https://www.youtube.com/watch?v=xOo8UoGuVEA' },
  { id: 'ir6', title: 'Day Trade: Tributação Específica', category: 'imposto_renda', categoryLabel: 'IMPOSTO DE RENDA', duration: '16:05', level: 'Avançado', thumb: 't5', icon: BarChart2, videoUrl: 'https://www.youtube.com/watch?v=v0AZzHEF9Og' },
];

// ─── Helpers visuais ──────────────────────────────────────────────────────────

// Gradients .t1–.t5 do mockup (lesson-thumb)
const THUMB_GRADIENT: Record<ThumbVariant, string> = {
  t1: 'linear-gradient(135deg, #00B8D9, #007EA7)',
  t2: 'linear-gradient(135deg, #1E40AF, #312E81)',
  t3: 'linear-gradient(135deg, #6D28D9, #4338CA)',
  t4: 'linear-gradient(135deg, #0E7490, #155E75)',
  t5: 'linear-gradient(135deg, #0B1F33, #1E3A5F)',
};

// level-chip do mockup
const LEVEL_STYLE: Record<Level, { background: string; color: string }> = {
  'Iniciante':     { background: 'rgba(16,185,129,0.12)', color: 'var(--gain)' },
  'Intermediário': { background: 'var(--warn-soft)',      color: 'var(--warn)' },
  'Avançado':      { background: 'var(--loss-soft)',      color: 'var(--loss)' },
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function LessonCard({
  video,
  watched,
  onClick,
}: {
  video: VideoCard;
  watched: boolean;
  onClick: (video: VideoCard) => void;
}) {
  const Icon = video.icon;

  return (
    <article
      className="rounded-[var(--r-lg)] overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      onClick={() => onClick(video)}
    >
      {/* lesson-thumb (130px gradient) */}
      <div
        className="relative h-[130px] grid place-items-center overflow-hidden"
        style={{ background: THUMB_GRADIENT[video.thumb] }}
      >
        <Icon className="w-[80px] h-[80px]" style={{ color: 'rgba(255,255,255,0.18)' }} />

        {watched && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-pill)] text-[10px] font-bold text-white"
            style={{ background: 'var(--gain)' }}
          >
            <Check className="w-3 h-3" />
            Concluído
          </div>
        )}

        {/* play-overlay */}
        <div
          className="absolute w-11 h-11 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Play className="w-[18px] h-[18px] text-white fill-white" />
        </div>

        {/* lesson-duration */}
        <span
          className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-semibold text-white"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          {video.duration}
        </span>
      </div>

      {/* lesson-body */}
      <div className="px-4 pt-3.5 pb-4">
        <div
          className="text-[10.5px] font-bold uppercase tracking-[0.08em] mb-1.5"
          style={{ color: 'var(--cyan)' }}
        >
          {video.categoryLabel}
        </div>
        <div
          className="text-[14px] font-semibold leading-[1.35] mb-2.5 line-clamp-2 min-h-[38px]"
          style={{ color: 'var(--t1)' }}
        >
          {video.title}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-[var(--r-pill)] text-[10.5px] font-bold"
            style={LEVEL_STYLE[video.level]}
          >
            {video.level}
          </span>
          <span
            className="flex items-center gap-1 text-[11.5px]"
            style={{ color: 'var(--t2)' }}
          >
            <Clock className="w-[11px] h-[11px]" />
            {video.duration}
          </span>
        </div>
      </div>
    </article>
  );
}

function VideoSection({
  categoryId,
  title,
  videos,
  watchedList,
  onViewAll,
  onVideoClick,
}: {
  categoryId: string;
  title: string;
  videos: VideoCard[];
  watchedList: Set<string>;
  onViewAll: (categoryId: string, title: string) => void;
  onVideoClick: (v: VideoCard) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section id={categoryId} className="mb-8 scroll-mt-20">
      {/* trilhas-section-head */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--t1)' }}>
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onViewAll(categoryId, title)}
            className="text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:text-[var(--cyan)]"
            style={{ color: 'var(--t2)' }}
          >
            Ver tudo
          </button>
          {/* see-all arrows */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="w-7 h-7 rounded-full grid place-items-center transition-colors hover:bg-[var(--cyan)] hover:text-white hover:border-[var(--cyan)]"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Próximo"
              className="w-7 h-7 rounded-full grid place-items-center transition-colors hover:bg-[var(--cyan)] hover:text-white hover:border-[var(--cyan)]"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-[260px]">
            <LessonCard
              video={video}
              watched={watchedList.has(video.id)}
              onClick={onVideoClick}
            />
          </div>
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
  const [watchedList, setWatchedList] = useState<Set<string>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<VideoCard | null>(null);
  const [categoryView, setCategoryView] = useState<{ id: string; title: string } | null>(null);

  // Auto-rotacao do hero a cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Detecta secao ativa no scroll
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

  const handleWatched = useCallback((id: string) => {
    setWatchedList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleVideoClick = useCallback((video: VideoCard) => {
    setSelectedVideo(video);
  }, []);

  const handleViewAll = useCallback((id: string, title: string) => {
    setCategoryView({ id, title });
  }, []);

  const scrollToCategory = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategory(id);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cyan)' }} />
      </div>
    );
  }

  const slide = HERO_SLIDES[heroIndex];

  return (
    <DashboardLayout>
      {/* Modal Player YouTube */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.8)' }}
              onClick={() => setSelectedVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-3xl overflow-hidden rounded-[var(--r-lg)]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex-shrink-0 px-2.5 py-0.5 rounded-[var(--r-pill)] text-[10.5px] font-bold"
                      style={LEVEL_STYLE[selectedVideo.level]}
                    >
                      {selectedVideo.level}
                    </span>
                    <p className="font-semibold text-[14px] truncate" style={{ color: 'var(--t1)' }}>
                      {selectedVideo.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="w-8 h-8 rounded-md grid place-items-center transition-colors hover:bg-[var(--surface-2)] flex-shrink-0 ml-3"
                    style={{ color: 'var(--t2)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Player 16:9 */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {selectedVideo.videoUrl && getYouTubeId(selectedVideo.videoUrl) ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.videoUrl)}?autoplay=1&rel=0`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: THUMB_GRADIENT[selectedVideo.thumb] }}
                    >
                      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Vídeo não disponível
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--t2)' }}>
                      <Clock className="w-3.5 h-3.5" />
                      {selectedVideo.duration}
                    </span>
                    <span className="text-[12px]" style={{ color: 'var(--t3)' }}>
                      {selectedVideo.categoryLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleWatched(selectedVideo.id);
                      setSelectedVideo(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--r-sm)] text-[12px] font-semibold transition-colors"
                    style={
                      watchedList.has(selectedVideo.id)
                        ? {
                            background: 'rgba(16,185,129,0.12)',
                            color: 'var(--gain)',
                            border: '1px solid rgba(16,185,129,0.4)',
                          }
                        : {
                            background: 'var(--gain)',
                            color: 'white',
                            border: '1px solid var(--gain)',
                          }
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    {watchedList.has(selectedVideo.id) ? 'Desmarcar' : 'Concluído'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ver Tudo overlay */}
      <AnimatePresence>
        {categoryView && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.8)' }}
              onClick={() => setCategoryView(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            >
              <div
                className="w-full sm:max-w-5xl overflow-hidden flex flex-col max-h-[90vh] rounded-[var(--r-lg)]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              >
                <div
                  className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <h2 className="text-[18px] font-bold" style={{ color: 'var(--t1)' }}>
                    {categoryView.title}
                  </h2>
                  <button
                    onClick={() => setCategoryView(null)}
                    className="w-8 h-8 rounded-md grid place-items-center transition-colors hover:bg-[var(--surface-2)]"
                    style={{ color: 'var(--t2)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {VIDEOS.filter((v) => v.category === categoryView.id).map((video) => (
                      <LessonCard
                        key={video.id}
                        video={video}
                        watched={watchedList.has(video.id)}
                        onClick={(v) => { setCategoryView(null); handleVideoClick(v); }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">

        {/* trilhas-hero — gradient ciano + badge + h1 grande + CTA branco */}
        <div
          className="relative overflow-hidden rounded-[var(--r-xl)] mb-7 flex items-center"
          style={{
            background: 'var(--grad-brand-h)',
            padding: '56px 56px 64px',
            minHeight: 320,
          }}
        >
          {/* Glow overlay */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 30% 80%, rgba(11,31,51,0.4), transparent 50%)',
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 max-w-[540px]"
            >
              <span
                className="inline-block px-3.5 py-1.5 rounded-[var(--r-pill)] text-[12px] font-bold uppercase tracking-[0.08em] text-white mb-4"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}
              >
                {slide.label}
              </span>
              <h1
                className="text-white font-extrabold tracking-tight mb-5"
                style={{ fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: 1.1 }}
              >
                {slide.title}
              </h1>
              <button
                onClick={() => scrollToCategory(slide.category)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--r-pill)] text-[14px] font-bold transition-all hover:-translate-y-px"
                style={{
                  background: 'white',
                  color: 'var(--cyan-700, #007EA7)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                }}
              >
                {slide.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p
                className="text-[11.5px] font-medium uppercase tracking-[0.12em] mt-6"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {slide.subtitle}
              </p>

              {/* dots */}
              <div className="flex gap-1.5 mt-3">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="block w-7 h-1 rounded-sm transition-colors"
                    style={{
                      background:
                        i === heroIndex ? 'white' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* trilhas-cats — abas underline */}
        <div
          className="flex gap-7 px-1 mb-6 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map(({ id, display }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => scrollToCategory(id)}
                className="relative py-3.5 text-[13.5px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-colors"
                style={{ color: isActive ? 'var(--cyan)' : 'var(--t2)' }}
              >
                {display}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-px h-0.5 rounded-sm"
                    style={{ background: 'var(--cyan)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Conteudo por categoria */}
        {CATEGORIES.map(({ id, display }) => {
          const videos = VIDEOS.filter((v) => v.category === id);
          if (videos.length === 0) return null;
          return (
            <VideoSection
              key={id}
              categoryId={id}
              title={display}
              videos={videos}
              watchedList={watchedList}
              onViewAll={handleViewAll}
              onVideoClick={handleVideoClick}
            />
          );
        })}

      </div>
    </DashboardLayout>
  );
}
