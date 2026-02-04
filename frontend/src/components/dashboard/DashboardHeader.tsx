'use client';

import { User, Calendar } from 'lucide-react';
import { PerfilInvestidor } from '@/services/perfilService';

interface DashboardHeaderProps {
  userName: string;
  investorProfile: PerfilInvestidor | null;
}

const profileColors: Record<string, { bg: string; text: string; label: string }> = {
  conservador: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Conservador' },
  moderado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Moderado' },
  arrojado: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Arrojado' },
  agressivo: { bg: 'bg-red-100', text: 'text-red-700', label: 'Agressivo' },
};

export function DashboardHeader({ userName, investorProfile }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const profileType = investorProfile?.perfil_risco?.toLowerCase() || '';
  const profileStyle = profileColors[profileType] || profileColors.conservador;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB] mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F33]">
            Ola, {userName || 'Investidor'}!
          </h1>
          <p className="text-[#6B7280] flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>

        {investorProfile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Seu perfil:</span>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${profileStyle.bg} ${profileStyle.text}`}
            >
              {profileStyle.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
