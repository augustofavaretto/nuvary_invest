'use client';

import { motion } from 'framer-motion';
import { QuickAction } from '@/types/chat';

const quickActions: QuickAction[] = [
  {
    id: 'profile',
    label: 'Meu perfil',
    icon: 'target',
    prompt: 'Com base no meu perfil de investidor, quais são as melhores estratégias para mim?',
    category: 'profile',
  },
  {
    id: 'allocation',
    label: 'Alocação',
    icon: 'pie',
    prompt: 'Me mostre a alocação de ativos recomendada para o meu perfil e explique cada categoria.',
    category: 'profile',
  },
  {
    id: 'portfolio-insights',
    label: 'Insights da carteira',
    icon: 'wallet',
    prompt: 'Analise minha carteira atual e me forneça insights práticos: diversificação, concentração de risco, alocação por classe comparada ao meu perfil e oportunidades de rebalanceamento. Cite ativos específicos quando relevante.',
    category: 'profile',
  },
  {
    id: 'news',
    label: 'Mercado hoje',
    icon: 'newspaper',
    prompt: 'Quais são as principais notícias do mercado financeiro hoje e como podem impactar meus investimentos?',
    category: 'market',
  },
  {
    id: 'market',
    label: 'Análise',
    icon: 'trending',
    prompt: 'Me dê uma análise geral do mercado de ações brasileiro no momento atual.',
    category: 'analysis',
  },
  {
    id: 'learn',
    label: 'Renda fixa',
    icon: 'book',
    prompt: 'Explique o que é renda fixa, os principais tipos de investimentos e quando devo investir nessa classe.',
    category: 'education',
  },
  {
    id: 'stocks',
    label: 'Ações',
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

// Pills compactos no estilo do mini-chat do dashboard (rounded-full, sem icones, flex-wrap). Padroniza visualmente as sugestoes em todos os pontos do app.
export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2 justify-center"
    >
      {quickActions.map((action) => (
        <motion.button
          key={action.id}
          variants={item}
          type="button"
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.03 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="inline-flex items-center px-4 py-2 rounded-[var(--r-pill)] text-[13px] font-medium bg-[var(--surface-1)] text-[var(--t1)] border border-[var(--border)] hover:border-[var(--border-hi)] hover:text-[var(--cyan)] hover:bg-[var(--glass)] transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          {action.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
