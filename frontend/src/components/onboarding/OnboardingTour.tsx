'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

export interface TourStep {
  /** Seletor CSS do elemento a destacar. Ausente = passo centralizado (sem spotlight). */
  target?: string;
  title: string;
  description: string;
  /** Lado do tooltip relativo ao alvo. Default: 'bottom'. */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  run: boolean;
  onFinish: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // respiro do spotlight ao redor do alvo
const CARD_W = 320;
const GAP = 14; // distância do tooltip ao alvo

export function OnboardingTour({ steps, run, onFinish }: OnboardingTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Reinicia para o passo 0 sempre que o tour (re)começa
  useEffect(() => {
    if (run) setIndex(0);
  }, [run]);

  const step = steps[index];

  // Calcula a posição do alvo (e rola até ele). Recalcula em resize/scroll.
  const measure = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!run) return;
    measure();
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [run, index, measure]);

  // Atalhos de teclado
  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish();
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, steps.length, onFinish]);

  if (!run || !mounted || !step) return null;

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const next = () => (isLast ? onFinish() : setIndex((i) => i + 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // Posição do tooltip
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  let cardStyle: React.CSSProperties;

  if (rect) {
    const placement = step.placement ?? 'bottom';
    let top = 0;
    let left = 0;
    if (placement === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + GAP;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - GAP - CARD_W;
    } else if (placement === 'top') {
      top = rect.top - GAP;
      left = rect.left + rect.width / 2 - CARD_W / 2;
    } else {
      top = rect.top + rect.height + GAP;
      left = rect.left + rect.width / 2 - CARD_W / 2;
    }
    // Mantém o card dentro da viewport
    left = Math.max(12, Math.min(left, vw - CARD_W - 12));
    top = Math.max(12, Math.min(top, vh - 220));
    const translateY = placement === 'right' || placement === 'left' ? 'translateY(-50%)' : placement === 'top' ? 'translateY(-100%)' : 'none';
    cardStyle = { position: 'fixed', top, left, width: CARD_W, transform: translateY, zIndex: 10001 };
  } else {
    // Passo centralizado (welcome / final)
    cardStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      width: CARD_W,
      transform: 'translate(-50%, -50%)',
      zIndex: 10001,
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000]" aria-modal="true" role="dialog">
      {/* Overlay com spotlight via box-shadow gigante */}
      {rect ? (
        <motion.div
          key={`spot-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 12,
            boxShadow: '0 0 0 9999px rgba(2, 8, 23, 0.72)',
            outline: '2px solid var(--cyan)',
          }}
        />
      ) : (
        <div className="fixed inset-0" style={{ background: 'rgba(2, 8, 23, 0.72)' }} />
      )}

      {/* Tooltip / card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          style={{ ...cardStyle, background: 'var(--surface-1)', border: '1px solid var(--border)', padding: 18 }}
          className="rounded-[var(--r-lg)] shadow-2xl"
        >
            {/* Fechar/pular */}
            <button
              type="button"
              onClick={onFinish}
              aria-label="Pular tour"
              className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full transition-colors hover:bg-[var(--glass)]"
              style={{ color: 'var(--t2)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {isFirst && (
              <div
                className="w-10 h-10 rounded-[var(--r-md)] grid place-items-center mb-3"
                style={{ background: 'rgba(0,184,217,0.15)', color: 'var(--cyan)' }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
            )}

            <h3 className="text-[16px] font-bold mb-1.5 pr-6" style={{ color: 'var(--t1)' }}>
              {step.title}
            </h3>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--t2)' }}>
              {step.description}
            </p>

            <div className="flex items-center justify-between gap-2">
              {/* Progresso */}
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className="rounded-full transition-all shrink-0"
                    style={{
                      width: i === index ? 16 : 5,
                      height: 5,
                      background: i === index ? 'var(--cyan)' : 'var(--surface-3, var(--border))',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--r-sm)] text-[12.5px] font-semibold transition-colors"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--r-sm)] text-[12.5px] font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'var(--cyan)', color: 'white' }}
                >
                  {isLast ? (
                    <>
                      Concluir
                      <Check className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}
