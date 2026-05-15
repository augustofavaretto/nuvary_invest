'use client';

import { User as UserIcon } from 'lucide-react';

interface PerfilCardProps {
  perfil: string;
  helper?: string;
}

// "Seu perfil" — badge ambar para Arrojado/Moderado/Conservador/Agressivo.
// Fiel ao mockup (.profile-side + .profile-tag).
export function PerfilCard({
  perfil,
  helper = 'Focando em crescimento de longo prazo',
}: PerfilCardProps) {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] px-5 py-4.5 flex flex-col items-start justify-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--t2)]">
        <UserIcon className="w-3.5 h-3.5" />
        Seu perfil
      </span>
      <span
        className="inline-flex px-4.5 py-2 rounded-[var(--r-pill)] text-[18px] font-bold border"
        style={{
          background: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          color: 'var(--warn)',
        }}
      >
        {perfil}
      </span>
      <span className="text-[11.5px] text-[var(--t3)]">{helper}</span>
    </div>
  );
}
