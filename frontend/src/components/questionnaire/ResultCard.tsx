'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionnaireResult } from '@/types/questionnaire';
import {
  Shield,
  Scale,
  Rocket,
  Flame,
  RefreshCw,
  TrendingUp,
  PiggyBank,
  Building2,
  Globe,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

interface ResultCardProps {
  result: QuestionnaireResult;
  onRestart: () => void;
}

// Cores dos perfis conforme manual da marca
const profileConfig = {
  conservador: {
    icon: Shield,
    color: '#3B82F6',
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    bgLight: 'bg-[#3B82F6]/10',
    text: 'text-[#3B82F6]',
  },
  moderado: {
    icon: Scale,
    color: '#10B981',
    gradient: 'from-[#10B981] to-[#059669]',
    bgLight: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
  },
  arrojado: {
    icon: Rocket,
    color: '#F59E0B',
    gradient: 'from-[#F59E0B] to-[#D97706]',
    bgLight: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
  },
  agressivo: {
    icon: Flame,
    color: '#EF4444',
    gradient: 'from-[#EF4444] to-[#DC2626]',
    bgLight: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
  },
};

const allocationIcons = {
  rendaFixa: PiggyBank,
  rendaVariavel: TrendingUp,
  fundosImobiliarios: Building2,
  internacional: Globe,
};

const allocationLabels = {
  rendaFixa: 'Renda Fixa',
  rendaVariavel: 'Renda Variavel',
  fundosImobiliarios: 'FIIs',
  internacional: 'Internacional',
};

// Cores dos graficos conforme manual
const allocationColors = {
  rendaFixa: 'bg-[#00B8D9]',
  rendaVariavel: 'bg-[#007EA7]',
  fundosImobiliarios: 'bg-[#F59E0B]',
  internacional: 'bg-[#6B7280]',
};

export function ResultCard({ result, onRestart }: ResultCardProps) {
  const profile = result.profile;
  const config = profileConfig[profile.type];
  const ProfileIcon = config.icon;

  // Salva o perfil no localStorage para uso no chatbot
  useEffect(() => {
    const profileData = {
      type: profile.type,
      name: profile.name,
      score: result.score.total,
      recommendedAllocation: profile.recommendedAllocation,
    };
    localStorage.setItem('investorProfile', JSON.stringify(profileData));
  }, [profile, result.score.total]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card className="border border-[#E5E7EB] shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${config.gradient} p-8 text-white text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <ProfileIcon className="w-10 h-10" />
          </motion.div>
          <p className="text-white/80 text-sm mb-2">Seu perfil e</p>
          <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="text-2xl font-bold">{result.score.total}</span>
            <span className="text-white/80">/ 40 pontos</span>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-[#6B7280] text-center leading-relaxed">
            {profile.description}
          </p>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <Card className="border border-[#E5E7EB] shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#0B1F33]">Analise por Categoria</h3>
          <div className="space-y-4">
            {Object.entries(result.categoryAnalysis).map(([key, analysis]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-[#0B1F33]">
                    {key === 'tolerancia_risco' ? 'Tolerancia a Risco' : key === 'objetivos' ? 'Objetivos' : 'Horizonte'}
                  </span>
                  <span className="text-[#6B7280]">{analysis.percentage}%</span>
                </div>
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full nuvary-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.percentage}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Allocation */}
      <Card className="border border-[#E5E7EB] shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#0B1F33]">Alocacao Recomendada</h3>

          {/* Allocation Bar */}
          <div className="flex h-10 rounded-lg overflow-hidden mb-4">
            {Object.entries(profile.recommendedAllocation).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${allocationColors[key as keyof typeof allocationColors]} flex items-center justify-center`}
              >
                {value >= 15 && (
                  <span className="text-white text-xs font-semibold">{value}%</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(profile.recommendedAllocation).map(([key, value]) => {
              const Icon = allocationIcons[key as keyof typeof allocationIcons];
              return (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${allocationColors[key as keyof typeof allocationColors]}`}
                  />
                  <Icon className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-[#0B1F33]">
                    {allocationLabels[key as keyof typeof allocationLabels]}
                  </span>
                  <span className="text-sm font-semibold ml-auto text-[#0B1F33]">{value}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Investments */}
      <Card className="border border-[#E5E7EB] shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#0B1F33]">Investimentos Sugeridos</h3>
          <div className="flex flex-wrap gap-2">
            {profile.suggestedInvestments.map((investment, index) => (
              <motion.div
                key={investment}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Badge className="px-3 py-1.5 text-sm bg-[#00B8D9]/10 text-[#00B8D9] border border-[#00B8D9]/30 hover:bg-[#00B8D9]/20">
                  {investment}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card className="border border-[#E5E7EB] shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#0B1F33]">Suas Caracteristicas</h3>
          <ul className="space-y-3">
            {profile.characteristics.map((characteristic, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 text-[#6B7280]"
              >
                <CheckCircle2 className={`w-5 h-5 ${config.text}`} />
                {characteristic}
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Chat CTA */}
      <Card className="border-[#00B8D9]/30 bg-[#00B8D9]/5">
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-10 h-10 text-[#00B8D9] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#0B1F33] mb-2">
            Quer saber mais sobre seu perfil?
          </h3>
          <p className="text-[#6B7280] text-sm mb-4">
            Converse com nosso assistente de IA para tirar duvidas e receber recomendacoes personalizadas.
          </p>
          <Link href="/chat">
            <Button className="nuvary-gradient text-white w-full" size="lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversar com Assistente
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Restart Button */}
      <Button
        onClick={onRestart}
        variant="outline"
        className="w-full border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9]/10"
        size="lg"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refazer Questionario
      </Button>
    </motion.div>
  );
}
