// Config dos 4 perfis de investidor. Usado como fallback quando o backend
// nao retorna todos os campos (descricao, tips, alocacao) ou quando renderizamos
// previews durante o questionario.
//
// IMPORTANTE: o backend ja retorna o perfil calculado (campo `type`). Aqui
// guardamos apenas dados visuais e textos que nao vem da API.

import {
  Shield,
  Gauge,
  Rocket,
  Zap,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  Globe,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

// alias para combinar com o nome usado no mockup
const ChartBar = BarChart3;

export type PerfilTipo = 'conservador' | 'moderado' | 'arrojado' | 'agressivo';

export interface PerfilAllocation {
  name: string;
  value: number; // 0-100
  color: string;
  icon: LucideIcon;
}

export interface PerfilTip {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PerfilConfig {
  type: PerfilTipo;
  name: string;
  description: string;
  /** Cor primaria via CSS var token (ex: 'var(--p-arrojado)') */
  color: string;
  colorVar: string;
  colorDarkVar: string;
  /** Nivel de risco mostrado no centro do donut */
  risk: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  /** Icone do hero (lucide) */
  icon: LucideIcon;
  /** 4 classes de ativo somando 100% */
  allocation: PerfilAllocation[];
  /** 3 tips contextuais */
  tips: PerfilTip[];
}

const RENDA_FIXA_COLOR = '#10B981';
const RENDA_VAR_COLOR = '#00B8D9';
const FIIS_COLOR = '#F59E0B';
const INTERN_COLOR = '#7C3AED';

export const PROFILES: Record<PerfilTipo, PerfilConfig> = {
  conservador: {
    type: 'conservador',
    name: 'Conservador',
    description:
      'Você prioriza segurança e estabilidade. Prefere proteger seu patrimônio com aplicações previsíveis e de baixo risco, mesmo que isso signifique retornos mais modestos.',
    color: '#10B981',
    colorVar: 'var(--p-conservador)',
    colorDarkVar: 'var(--p-conservador-d)',
    risk: 'Baixo',
    icon: Shield,
    allocation: [
      { name: 'Renda Fixa', value: 70, color: RENDA_FIXA_COLOR, icon: Briefcase },
      { name: 'Renda Variável', value: 10, color: RENDA_VAR_COLOR, icon: TrendingUp },
      { name: 'FIIs', value: 15, color: FIIS_COLOR, icon: ChartBar },
      { name: 'Internacional', value: 5, color: INTERN_COLOR, icon: Globe },
    ],
    tips: [
      {
        icon: Shield,
        title: 'Foco em segurança',
        description: 'Tesouro Selic, CDBs com FGC e fundos DI de baixo custo.',
      },
      {
        icon: Clock,
        title: 'Horizonte flexível',
        description: 'Liquidez para resgates quando precisar, sem grandes perdas.',
      },
      {
        icon: TrendingUp,
        title: 'Volatilidade baixa',
        description: 'Variações mínimas. Pouco impacto emocional ao acompanhar.',
      },
    ],
  },
  moderado: {
    type: 'moderado',
    name: 'Moderado',
    description:
      'Você busca equilíbrio entre segurança e crescimento. Aceita um pouco de volatilidade em troca de retornos melhores no médio e longo prazo.',
    color: '#00B8D9',
    colorVar: 'var(--p-moderado)',
    colorDarkVar: 'var(--p-moderado-d)',
    risk: 'Médio',
    icon: Gauge,
    allocation: [
      { name: 'Renda Fixa', value: 50, color: RENDA_FIXA_COLOR, icon: Briefcase },
      { name: 'Renda Variável', value: 30, color: RENDA_VAR_COLOR, icon: TrendingUp },
      { name: 'FIIs', value: 12, color: FIIS_COLOR, icon: ChartBar },
      { name: 'Internacional', value: 8, color: INTERN_COLOR, icon: Globe },
    ],
    tips: [
      {
        icon: Gauge,
        title: 'Diversificação',
        description: 'Mix de classes para reduzir risco sem abrir mão de retorno.',
      },
      {
        icon: TrendingUp,
        title: 'Crescimento gradual',
        description: 'Renda variável em parte da carteira, com proteção do resto.',
      },
      {
        icon: Calendar,
        title: 'Médio prazo',
        description: 'Carteira pensada para 3-7 anos, ajustada conforme objetivos.',
      },
    ],
  },
  arrojado: {
    type: 'arrojado',
    name: 'Arrojado',
    description:
      'Você busca crescimento e está confortável com volatilidade. Aceita riscos elevados em troca de retornos maiores no longo prazo.',
    color: '#F59E0B',
    colorVar: 'var(--p-arrojado)',
    colorDarkVar: 'var(--p-arrojado-d)',
    risk: 'Alto',
    icon: Rocket,
    allocation: [
      { name: 'Renda Fixa', value: 30, color: RENDA_FIXA_COLOR, icon: Briefcase },
      { name: 'Renda Variável', value: 45, color: RENDA_VAR_COLOR, icon: TrendingUp },
      { name: 'FIIs', value: 10, color: FIIS_COLOR, icon: ChartBar },
      { name: 'Internacional', value: 15, color: INTERN_COLOR, icon: Globe },
    ],
    tips: [
      {
        icon: TrendingUp,
        title: 'Foco em retorno',
        description: 'Maior peso em ações, ETFs e ativos de crescimento global.',
      },
      {
        icon: Clock,
        title: 'Horizonte longo',
        description: 'Carteira pensada para 7+ anos, suportando ciclos de mercado.',
      },
      {
        icon: ChartBar,
        title: 'Volatilidade aceita',
        description: 'Variações de 20%+ no curto prazo fazem parte da estratégia.',
      },
    ],
  },
  agressivo: {
    type: 'agressivo',
    name: 'Agressivo',
    description:
      'Você busca máximo retorno e tem total tolerância a risco. Está disposto a perder parte significativa do capital em troca de potencial de grandes ganhos.',
    color: '#EF4444',
    colorVar: 'var(--p-agressivo)',
    colorDarkVar: 'var(--p-agressivo-d)',
    risk: 'Muito Alto',
    icon: Zap,
    allocation: [
      { name: 'Renda Fixa', value: 10, color: RENDA_FIXA_COLOR, icon: Briefcase },
      { name: 'Renda Variável', value: 60, color: RENDA_VAR_COLOR, icon: TrendingUp },
      { name: 'FIIs', value: 5, color: FIIS_COLOR, icon: ChartBar },
      { name: 'Internacional', value: 25, color: INTERN_COLOR, icon: Globe },
    ],
    tips: [
      {
        icon: Zap,
        title: 'Alta exposição',
        description: 'Ações de crescimento, small caps, criptoativos e startups.',
      },
      {
        icon: Clock,
        title: 'Foco em décadas',
        description: 'Carteira pensada para 10+ anos, com ciclos longos de espera.',
      },
      {
        icon: AlertTriangle,
        title: 'Risco alto',
        description: 'Perdas de 30%+ no curto prazo são esperadas e toleradas.',
      },
    ],
  },
};

/** Resolve um valor de perfil (qualquer case) para o tipo canonico. */
export function normalizePerfilTipo(value: string | undefined | null): PerfilTipo {
  const key = String(value ?? '').toLowerCase().trim();
  if (key in PROFILES) return key as PerfilTipo;
  return 'moderado';
}

