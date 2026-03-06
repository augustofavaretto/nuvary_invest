import OpenAI from 'openai';
import { config } from '../config/index.js';

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.model = config.openai.model;
  }

  // === CHAT COMPLETION ===

  async chat(messages, options = {}) {
    const { model = this.model } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages,
    });

    return {
      content: response.choices[0]?.message?.content,
      usage: response.usage,
      model: response.model,
    };
  }

  async ask(question, options = {}) {
    return this.chat([{ role: 'user', content: question }], options);
  }

  // === ANÁLISE FINANCEIRA ===

  async analyzeStock(symbol, stockData) {
    const systemPrompt = `Você é um analista financeiro especializado em mercado de ações.
Analise os dados fornecidos e forneça insights claros e objetivos em português.
Seja direto e forneça recomendações práticas.`;

    const userPrompt = `Analise a ação ${symbol} com os seguintes dados:
${JSON.stringify(stockData, null, 2)}

Forneça:
1. Análise geral da situação atual
2. Pontos positivos
3. Pontos de atenção
4. Perspectiva de curto prazo`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5 }
    );
  }

  async analyzeNews(newsArticles, symbol = null) {
    const systemPrompt = `Você é um analista de mercado especializado em interpretar notícias financeiras.
Analise as notícias fornecidas e identifique tendências e impactos potenciais no mercado.
Responda sempre em português.`;

    const context = symbol ? ` relacionadas a ${symbol}` : '';
    const userPrompt = `Analise estas notícias${context} e forneça um resumo dos principais pontos e possíveis impactos no mercado:

${newsArticles.map((n, i) => `${i + 1}. ${n.title}\n   ${n.description || ''}`).join('\n\n')}

Forneça:
1. Resumo geral do sentimento das notícias
2. Principais temas identificados
3. Possíveis impactos no mercado
4. Recomendações para investidores`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5, maxTokens: 1500 }
    );
  }

  async explainTerm(term) {
    const systemPrompt = `Você é um educador financeiro. Explique termos e conceitos financeiros
de forma clara e acessível, usando exemplos práticos quando possível.
Responda sempre em português.`;

    const userPrompt = `Explique de forma clara e didática o seguinte termo/conceito financeiro: "${term}"

Inclua:
1. Definição simples
2. Como funciona na prática
3. Exemplo prático
4. Por que é importante para investidores`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.6 }
    );
  }

  async generateInvestmentSuggestion(profile) {
    const systemPrompt = `Você é um consultor de investimentos. Forneça sugestões personalizadas
baseadas no perfil do investidor. Seja sempre prudente e mencione que investimentos envolvem riscos.
Responda sempre em português.`;

    const userPrompt = `Com base neste perfil de investidor, sugira uma estratégia de investimento:

Perfil: ${profile.type || 'Moderado'}
Objetivo: ${profile.goal || 'Crescimento de patrimônio'}
Horizonte: ${profile.horizon || 'Médio prazo (3-5 anos)'}
Capital disponível: ${profile.capital || 'Não especificado'}
Tolerância a risco: ${profile.riskTolerance || 'Média'}

Forneça:
1. Sugestão de alocação de ativos (%)
2. Tipos de investimentos recomendados
3. Dicas de diversificação
4. Alertas e considerações importantes`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.6, maxTokens: 1500 }
    );
  }

  async compareTwoStocks(stock1, stock2, data1, data2) {
    const systemPrompt = `Você é um analista financeiro comparativo. Compare ações de forma objetiva,
destacando pontos fortes e fracos de cada uma. Responda sempre em português.`;

    const userPrompt = `Compare as ações ${stock1} e ${stock2}:

${stock1}:
${JSON.stringify(data1, null, 2)}

${stock2}:
${JSON.stringify(data2, null, 2)}

Forneça:
1. Tabela comparativa dos principais indicadores
2. Pontos fortes de cada ação
3. Pontos fracos de cada ação
4. Qual parece mais atrativa no momento e por quê
5. Para qual perfil de investidor cada uma é mais adequada`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5, maxTokens: 2000 }
    );
  }

  async summarizeMarket(marketData) {
    const systemPrompt = `Você é um comentarista de mercado financeiro. Forneça resumos claros
e objetivos sobre a situação atual do mercado. Responda sempre em português.`;

    const userPrompt = `Faça um resumo da situação atual do mercado com base nestes dados:

${JSON.stringify(marketData, null, 2)}

Forneça:
1. Visão geral do mercado
2. Principais movimentos do dia
3. Setores em destaque (positivo e negativo)
4. O que ficar de olho nos próximos dias`;

    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5, maxTokens: 1500 }
    );
  }

  // === ASSISTENTE GERAL ===

  async assistantChat(message, conversationHistory = [], userContext = {}) {
    const { profile, portfolio } = userContext;

    let systemPrompt = `Você é o **Nuvary**, assistente virtual inteligente da **Nuvary Invest** — plataforma brasileira de gestão e educação de investimentos.

## Identidade
- Você representa a Nuvary Invest, uma plataforma moderna e acessível para investidores brasileiros
- Seu objetivo é ajudar o usuário a tomar melhores decisões financeiras com base no seu perfil e carteira real

## O que a Nuvary Invest oferece
- **Dashboard**: visão geral do patrimônio, performance e evolução da carteira
- **Minha Carteira**: cadastro e acompanhamento de ações B3, FIIs, Renda Fixa, Tesouro Direto, Criptomoedas, ETFs e fundos
- **Chat IA**: você — assistente personalizado de investimentos
- **Trilhas Educativas**: 8 categorias com 48 vídeos sobre finanças e investimentos
- **Relatórios**: performance, extratos, DARF e análise de Imposto de Renda
- **Perfil de Investidor**: questionário de análise de risco (Conservador, Moderado, Arrojado, Agressivo)

## Mercado brasileiro
- Principais referências: IBOVESPA, IFIX, CDI, Selic, IPCA, IGP-M
- Ativos: ações B3, FIIs, CDB, LCI, LCA, Tesouro Direto (Selic, IPCA+, Prefixado), debêntures, fundos, criptomoedas
- Reguladores: CVM, ANBIMA, BCB (Banco Central do Brasil)

## Diretrizes de resposta
- Responda SEMPRE em português brasileiro claro e direto
- Use markdown quando útil (negrito, listas, tabelas)
- Personalize as respostas com base no perfil e carteira do usuário quando disponíveis
- Para análise de ativos: apresente pontos positivos, riscos e contexto do mercado
- Nunca garanta lucros ou retornos específicos — sempre mencione riscos
- Se não souber algo, admita e indique fontes confiáveis (CVM, ANBIMA, B3, Tesouro Direto)
- Seja conciso mas completo — evite respostas longas desnecessárias`;

    if (profile) {
      systemPrompt += `

## Perfil do usuário
- **Perfil de risco**: ${profile.nome} (${profile.tipo})
- **Nível de conhecimento**: ${profile.pontuacao}/100
- **Alocação recomendada**: Renda Fixa ${profile.rf}% | Renda Variável ${profile.rv}% | FIIs ${profile.fii}% | Internacional ${profile.intl}%
- Adapte sempre suas sugestões a este perfil`;
    }

    if (portfolio && portfolio.length > 0) {
      const totalValue = portfolio.reduce((sum, a) => sum + (a.totalValue || 0), 0);
      const categories = {};
      portfolio.forEach(a => {
        const key = a.type || a.category || 'outros';
        categories[key] = (categories[key] || 0) + (a.totalValue || 0);
      });
      const categoryLines = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => `  - ${cat}: R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${((Number(val) / totalValue) * 100).toFixed(1)}%)`)
        .join('\n');
      const topAssets = [...portfolio]
        .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
        .slice(0, 8)
        .map(a => `  - ${a.name} (${a.ticker}): R$ ${Number(a.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        .join('\n');

      systemPrompt += `

## Carteira atual do usuário
- **Patrimônio total**: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Distribuição por categoria**:
${categoryLines}
- **Principais ativos**:
${topAssets}
- Use estes dados para análises e sugestões personalizadas`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    return this.chat(messages);
  }
}

export const openaiService = new OpenAIService();
