'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuickAction } from '@/types/chat';
import {
  Target,
  Newspaper,
  TrendingUp,
  BookOpen,
  PieChart,
  HelpCircle,
  Wallet,
  BarChart3,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  newspaper: Newspaper,
  trending: TrendingUp,
  book: BookOpen,
  pie: PieChart,
  help: HelpCircle,
  wallet: Wallet,
  chart: BarChart3,
};

const quickActions: QuickAction[] = [
  {
    id: 'profile',
    label: 'Meu Perfil',
    icon: 'target',
    prompt: 'Com base no meu perfil de investidor, quais são as melhores estratégias para mim?',
    category: 'profile',
  },
  {
    id: 'allocation',
    label: 'Alocação Ideal',
    icon: 'pie',
    prompt: 'Me mostre a alocação de ativos recomendada para o meu perfil e explique cada categoria.',
    category: 'profile',
  },
  {
    id: 'news',
    label: 'Notícias do Mercado',
    icon: 'newspaper',
    prompt: 'Quais são as principais notícias do mercado financeiro hoje e como podem impactar meus investimentos?',
    category: 'market',
  },
  {
    id: 'market',
    label: 'Análise de Mercado',
    icon: 'trending',
    prompt: 'Me dê uma análise geral do mercado de ações brasileiro no momento atual.',
    category: 'analysis',
  },
  {
    id: 'learn',
    label: 'O que é Renda Fixa?',
    icon: 'book',
    prompt: 'Explique o que é renda fixa, os principais tipos de investimentos e quando devo investir nessa classe.',
    category: 'education',
  },
  {
    id: 'stocks',
    label: 'Começar em Ações',
    icon: 'chart',
    prompt: 'Como um iniciante deve começar a investir em ações? Quais cuidados devo ter?',
    category: 'education',
  },
  {
    id: 'diversify',
    label: 'Diversificação',
    icon: 'wallet',
    prompt: 'Por que a diversificação é importante e como posso diversificar minha carteira corretamente?',
    category: 'education',
  },
  {
    id: 'help',
    label: 'Ajuda',
    icon: 'help',
    prompt: 'O que você pode fazer por mim? Quais tipos de perguntas posso fazer?',
    category: 'education',
  },
];

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-2"
    >
      {quickActions.map((action) => {
        const Icon = iconMap[action.icon];
        return (
          <motion.div key={action.id} variants={item}>
            <Button
              variant="outline"
              className="
                w-full h-auto py-3 px-3
                flex flex-col items-center gap-2
                border-border hover:border-[#00B8D9] hover:bg-[#00B8D9]/5
                text-foreground hover:text-[#00B8D9]
                transition-all duration-200
                disabled:opacity-50
              "
              onClick={() => onAction(action.prompt)}
              disabled={disabled}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center leading-tight">
                {action.label}
              </span>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
