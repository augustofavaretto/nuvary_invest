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
    const { model = this.model, temperature = 0.7, maxTokens = 1000 } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
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

  async assistantChat(message, conversationHistory = []) {
    const systemPrompt = `Você é o assistente virtual da Nuvary Invest, uma plataforma de investimentos.
Você ajuda usuários com:
- Dúvidas sobre investimentos e mercado financeiro
- Explicação de termos e conceitos
- Análise de ações e ativos
- Dicas de educação financeira

Seja sempre educado, claro e objetivo. Responda em português.
Se não souber algo, admita e sugira onde o usuário pode encontrar a informação.
Nunca forneça recomendações como garantia de lucro.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    return this.chat(messages, { temperature: 0.7, maxTokens: 1000 });
  }
}

export const openaiService = new OpenAIService();
