'use client';

import { Calendar } from 'lucide-react';

interface GreetingCardProps {
  nome: string;
  dataHoje: string;
}

// Card de saudacao do dashboard — "Olá, {nome}!" + data.
// Layout fiel ao mockup (exemplo frontend.html: .greeting).
export function GreetingCard({ nome, dataHoje }: GreetingCardProps) {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] px-8 py-7">
      <h1 className="text-[28px] font-bold text-[var(--t1)] leading-[1.15] tracking-[-0.02em]">
        Olá, <span className="text-[var(--cyan)]">{nome}!</span>
      </h1>
      <div className="mt-2 flex items-center gap-2 text-[13.5px] text-[var(--t2)]">
        <Calendar className="w-3.5 h-3.5 text-[var(--cyan)]" />
        {dataHoje}
      </div>
    </div>
  );
}
