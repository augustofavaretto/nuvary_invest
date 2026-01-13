// Questionário de Perfil de Investidor - 10 Perguntas Objetivas
// Categorias: Tolerância a Risco, Horizonte de Investimento, Objetivos Financeiros

export const questionnaire = {
  title: 'Questionário de Perfil de Investidor',
  description: 'Responda às 10 perguntas abaixo para descobrir seu perfil de investidor',
  questions: [
    // === OBJETIVOS FINANCEIROS (3 perguntas) ===
    {
      id: 1,
      category: 'objetivos',
      question: 'Qual seu principal objetivo ao investir?',
      options: [
        { value: 'A', text: 'Preservar meu patrimônio e ter segurança', points: 1 },
        { value: 'B', text: 'Ter renda passiva estável (dividendos, juros)', points: 2 },
        { value: 'C', text: 'Crescimento moderado com alguma segurança', points: 3 },
        { value: 'D', text: 'Maximizar ganhos, mesmo com riscos elevados', points: 4 },
      ],
    },
    {
      id: 2,
      category: 'objetivos',
      question: 'Qual porcentagem da sua renda mensal você consegue investir?',
      options: [
        { value: 'A', text: 'Menos de 10%', points: 1 },
        { value: 'B', text: 'Entre 10% e 20%', points: 2 },
        { value: 'C', text: 'Entre 20% e 40%', points: 3 },
        { value: 'D', text: 'Mais de 40%', points: 4 },
      ],
    },
    {
      id: 3,
      category: 'objetivos',
      question: 'Como você descreveria seu conhecimento sobre investimentos?',
      options: [
        { value: 'A', text: 'Iniciante - conheço apenas poupança', points: 1 },
        { value: 'B', text: 'Básico - conheço renda fixa (CDB, Tesouro)', points: 2 },
        { value: 'C', text: 'Intermediário - conheço ações e fundos', points: 3 },
        { value: 'D', text: 'Avançado - conheço derivativos e mercado internacional', points: 4 },
      ],
    },

    // === HORIZONTE DE INVESTIMENTO (3 perguntas) ===
    {
      id: 4,
      category: 'horizonte',
      question: 'Em quanto tempo você pretende usar o dinheiro que está investindo?',
      options: [
        { value: 'A', text: 'Menos de 1 ano', points: 1 },
        { value: 'B', text: 'Entre 1 e 3 anos', points: 2 },
        { value: 'C', text: 'Entre 3 e 10 anos', points: 3 },
        { value: 'D', text: 'Mais de 10 anos', points: 4 },
      ],
    },
    {
      id: 5,
      category: 'horizonte',
      question: 'Se precisasse do dinheiro antes do prazo planejado, como seria?',
      options: [
        { value: 'A', text: 'Muito provável, preciso de liquidez total', points: 1 },
        { value: 'B', text: 'Possível, mas tenho reserva de emergência', points: 2 },
        { value: 'C', text: 'Improvável, tenho outras fontes de renda', points: 3 },
        { value: 'D', text: 'Quase impossível, esse dinheiro é de longo prazo', points: 4 },
      ],
    },
    {
      id: 6,
      category: 'horizonte',
      question: 'Qual sua idade?',
      options: [
        { value: 'A', text: 'Acima de 60 anos', points: 1 },
        { value: 'B', text: 'Entre 45 e 60 anos', points: 2 },
        { value: 'C', text: 'Entre 30 e 45 anos', points: 3 },
        { value: 'D', text: 'Abaixo de 30 anos', points: 4 },
      ],
    },

    // === TOLERÂNCIA A RISCO (4 perguntas) ===
    {
      id: 7,
      category: 'tolerancia_risco',
      question: 'Ao escolher um investimento, o que é mais importante para você?',
      options: [
        { value: 'A', text: 'Segurança total, mesmo com retorno baixo', points: 1 },
        { value: 'B', text: 'Equilíbrio entre segurança e rentabilidade', points: 2 },
        { value: 'C', text: 'Bom retorno, aceitando alguma variação', points: 3 },
        { value: 'D', text: 'Máximo retorno possível, independente do risco', points: 4 },
      ],
    },
    {
      id: 8,
      category: 'tolerancia_risco',
      question: 'Como você se sente em relação a oscilações no valor dos seus investimentos?',
      options: [
        { value: 'A', text: 'Fico muito ansioso e perco o sono', points: 1 },
        { value: 'B', text: 'Fico preocupado, mas consigo lidar', points: 2 },
        { value: 'C', text: 'Entendo que faz parte e não me afeta muito', points: 3 },
        { value: 'D', text: 'Vejo como oportunidade e fico tranquilo', points: 4 },
      ],
    },
    {
      id: 9,
      category: 'tolerancia_risco',
      question: 'Qual tipo de investimento você se sentiria mais confortável ao aplicar uma quantia significativa?',
      options: [
        { value: 'A', text: 'Poupança ou Tesouro Selic, mesmo rendendo pouco', points: 1 },
        { value: 'B', text: 'CDB ou Tesouro IPCA com rentabilidade garantida', points: 2 },
        { value: 'C', text: 'Fundos multimercado ou ações de empresas consolidadas', points: 3 },
        { value: 'D', text: 'Ações de crescimento, criptomoedas ou startups', points: 4 },
      ],
    },
    {
      id: 10,
      category: 'tolerancia_risco',
      question: 'Você já investiu em renda variável (ações, fundos de ações)?',
      options: [
        { value: 'A', text: 'Nunca e não pretendo', points: 1 },
        { value: 'B', text: 'Nunca, mas tenho curiosidade', points: 2 },
        { value: 'C', text: 'Sim, com valores pequenos', points: 3 },
        { value: 'D', text: 'Sim, represente boa parte dos meus investimentos', points: 4 },
      ],
    },
  ],
};

// Perfis de investidor com descrições e recomendações
export const investorProfiles = {
  conservador: {
    name: 'Conservador',
    minScore: 10,
    maxScore: 17,
    color: '#3b82f6', // Azul
    description:
      'Você prioriza a segurança e preservação do seu patrimônio. Prefere investimentos de baixo risco, mesmo que isso signifique retornos menores.',
    characteristics: [
      'Baixa tolerância a perdas',
      'Prefere estabilidade e previsibilidade',
      'Horizonte de curto a médio prazo',
      'Prioriza liquidez e segurança',
    ],
    recommendedAllocation: {
      rendaFixa: 80,
      rendaVariavel: 10,
      fundosImobiliarios: 5,
      internacional: 5,
    },
    suggestedInvestments: [
      'Tesouro Selic',
      'CDB com liquidez diária',
      'Fundos DI',
      'Poupança (para reserva imediata)',
    ],
  },
  moderado: {
    name: 'Moderado',
    minScore: 18,
    maxScore: 25,
    color: '#10b981', // Verde
    description:
      'Você busca equilíbrio entre segurança e rentabilidade. Aceita algum risco em troca de retornos potencialmente maiores.',
    characteristics: [
      'Tolerância moderada a oscilações',
      'Busca crescimento com segurança',
      'Horizonte de médio prazo',
      'Diversificação é importante',
    ],
    recommendedAllocation: {
      rendaFixa: 55,
      rendaVariavel: 25,
      fundosImobiliarios: 10,
      internacional: 10,
    },
    suggestedInvestments: [
      'Tesouro IPCA+',
      'CDB de médio prazo',
      'Fundos multimercado',
      'Ações de empresas sólidas (blue chips)',
      'Fundos imobiliários',
    ],
  },
  arrojado: {
    name: 'Arrojado',
    minScore: 26,
    maxScore: 33,
    color: '#f59e0b', // Laranja
    description:
      'Você está disposto a correr riscos moderados a altos em busca de melhores retornos. Entende que oscilações fazem parte do processo.',
    characteristics: [
      'Boa tolerância a volatilidade',
      'Foco em crescimento do patrimônio',
      'Horizonte de médio a longo prazo',
      'Aceita perdas temporárias',
    ],
    recommendedAllocation: {
      rendaFixa: 30,
      rendaVariavel: 45,
      fundosImobiliarios: 10,
      internacional: 15,
    },
    suggestedInvestments: [
      'Ações diversificadas',
      'ETFs de índices',
      'Fundos de ações',
      'BDRs (ações internacionais)',
      'Criptomoedas (pequena parcela)',
    ],
  },
  agressivo: {
    name: 'Agressivo',
    minScore: 34,
    maxScore: 40,
    color: '#ef4444', // Vermelho
    description:
      'Você busca maximizar retornos e está preparado para alta volatilidade. Tem conhecimento avançado e horizonte de longo prazo.',
    characteristics: [
      'Alta tolerância a risco',
      'Busca retornos acima da média',
      'Horizonte de longo prazo',
      'Experiência em mercados voláteis',
    ],
    recommendedAllocation: {
      rendaFixa: 15,
      rendaVariavel: 55,
      fundosImobiliarios: 10,
      internacional: 20,
    },
    suggestedInvestments: [
      'Ações de crescimento (small caps)',
      'ETFs internacionais',
      'Criptomoedas',
      'Opções e derivativos',
      'Mercados emergentes',
      'Startups e venture capital',
    ],
  },
};

export default { questionnaire, investorProfiles };
