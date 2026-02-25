'use client';

import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Shield, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerfilInvestidor } from '@/services/perfilService';
import { STRINGS } from '@/constants/strings';

interface InvestorProfileCardProps {
  profile: PerfilInvestidor | null;
}

const profileConfig: Record<
  string,
  {
    icon: typeof Shield;
    color: string;
    bgColor: string;
    description: string;
    allocation: { label: string; percent: number; color: string }[];
  }
> = {
  conservador: {
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Priorizando segurança e estabilidade',
    allocation: [
      { label: 'Renda Fixa', percent: 70, color: '#3B82F6' },
      { label: STRINGS.perfil.acoes, percent: 15, color: '#10B981' },
      { label: 'FIIs', percent: 10, color: '#F59E0B' },
      { label: 'Internacional', percent: 5, color: '#8B5CF6' },
    ],
  },
  moderado: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Equilíbrio entre segurança e crescimento',
    allocation: [
      { label: 'Renda Fixa', percent: 50, color: '#3B82F6' },
      { label: STRINGS.perfil.acoes, percent: 25, color: '#10B981' },
      { label: 'FIIs', percent: 15, color: '#F59E0B' },
      { label: 'Internacional', percent: 10, color: '#8B5CF6' },
    ],
  },
  arrojado: {
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Focando em crescimento de longo prazo',
    allocation: [
      { label: 'Renda Fixa', percent: 30, color: '#3B82F6' },
      { label: STRINGS.perfil.acoes, percent: 40, color: '#10B981' },
      { label: 'FIIs', percent: 15, color: '#F59E0B' },
      { label: 'Internacional', percent: 15, color: '#8B5CF6' },
    ],
  },
  agressivo: {
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Maximizando retorno com maior risco',
    allocation: [
      { label: 'Renda Fixa', percent: 15, color: '#3B82F6' },
      { label: STRINGS.perfil.acoes, percent: 50, color: '#10B981' },
      { label: 'FIIs', percent: 15, color: '#F59E0B' },
      { label: 'Internacional', percent: 20, color: '#8B5CF6' },
    ],
  },
};

export function InvestorProfileCard({ profile }: InvestorProfileCardProps) {
  if (!profile) {
    return (
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-[#0B1F33] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#00B8D9]" />
            Perfil de Investidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#6B7280] text-center py-4">
            {STRINGS.perfil.fazerQuestionario}
          </p>
        </CardContent>
      </Card>
    );
  }

  const profileType = profile.perfil_risco?.toLowerCase() || 'conservador';
  const config = profileConfig[profileType] || profileConfig.conservador;
  const Icon = config.icon;

  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-[#0B1F33] flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#00B8D9]" />
          Perfil de Investidor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Badge */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
          <div>
            <p className={`font-bold text-lg capitalize ${config.color}`}>{profileType}</p>
            <p className="text-sm text-[#6B7280]">{config.description}</p>
          </div>
        </div>

        {/* Allocation Bars */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#0B1F33]">{STRINGS.perfil.alocacaoRecomendada}:</p>
          {config.allocation.map((item, index) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">{item.label}</span>
                <span className="font-medium text-[#0B1F33]">{item.percent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
