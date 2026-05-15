'use client';

import Link from 'next/link';
import { MessageSquare, ArrowRight, ChevronRight } from 'lucide-react';

interface Sugestao {
  emoji: string;
  titulo: string;
  prompt: string;
}

interface ChatPreviewWidgetProps {
  aiSuggestion: string;
  sugestoes: Sugestao[];
}

// Atalho do chat IA — snippet do assistant + 3 sugestoes clicaveis + CTA.
// Fiel ao mockup (.chat-widget).
export function ChatPreviewWidget({ aiSuggestion, sugestoes }: ChatPreviewWidgetProps) {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--t1)]">
          <MessageSquare className="w-5 h-5 text-[var(--cyan)]" />
          Assistente Nuvary
        </h2>
        <span
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-[var(--r-pill)] border"
          style={{
            background: 'rgba(0,184,217,0.12)',
            borderColor: 'rgba(0,184,217,0.4)',
            color: 'var(--cyan)',
          }}
        >
          IA
        </span>
      </div>

      {/* Snippet IA — limitado a 3 linhas para preview limpo */}
      <div
        className="bg-[var(--glass)] border border-[var(--border)] rounded-[var(--r-md)] p-4 mb-4 text-[13px] text-[var(--t1)] overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
          maxHeight: 'calc(3 * 1.5em + 2rem)',
        }}
      >
        {aiSuggestion ||
          'Olá! Posso analisar sua carteira, sugerir rebalanceamentos ou explicar termos. O que quer saber hoje?'}
      </div>

      {/* Sugestoes */}
      <ul className="space-y-2 mb-4 flex-1">
        {sugestoes.map((s) => (
          <li key={s.titulo}>
            <Link
              href={`/chat?q=${encodeURIComponent(s.prompt)}`}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-[var(--r-md)] bg-[var(--glass)] hover:bg-[var(--glass-2)] border border-[var(--border)] hover:border-[var(--border-hi)] text-[13px] text-[var(--t1)] transition-colors group"
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>{s.emoji}</span>
                {s.titulo}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--cyan)] transition-colors" />
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/chat"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[var(--r-md)] text-white font-semibold text-[13.5px] shadow-[var(--shadow-cta-soft)] transition-all hover:-translate-y-[1px]"
        style={{ background: 'var(--cyan)' }}
      >
        Abrir chat completo
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
