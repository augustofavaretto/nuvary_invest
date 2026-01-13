import { openaiService } from '../services/openai.js';

export const aiController = {
  // === CHAT ===

  async chat(req, res, next) {
    try {
      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      const response = await openaiService.assistantChat(message, history);

      res.json({
        success: true,
        response: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  async ask(req, res, next) {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Pergunta é obrigatória' });
      }

      const response = await openaiService.ask(question);

      res.json({
        success: true,
        question,
        answer: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  // === ANÁLISE FINANCEIRA ===

  async analyzeStock(req, res, next) {
    try {
      const { symbol } = req.params;
      const { stockData } = req.body;

      if (!stockData) {
        return res.status(400).json({ error: 'Dados da ação são obrigatórios' });
      }

      const response = await openaiService.analyzeStock(symbol, stockData);

      res.json({
        success: true,
        symbol,
        analysis: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  async analyzeNews(req, res, next) {
    try {
      const { articles, symbol } = req.body;

      if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ error: 'Lista de notícias é obrigatória' });
      }

      const response = await openaiService.analyzeNews(articles, symbol);

      res.json({
        success: true,
        articlesAnalyzed: articles.length,
        symbol: symbol || null,
        analysis: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  // === EDUCAÇÃO FINANCEIRA ===

  async explainTerm(req, res, next) {
    try {
      const { term } = req.params;

      if (!term) {
        return res.status(400).json({ error: 'Termo é obrigatório' });
      }

      const response = await openaiService.explainTerm(term);

      res.json({
        success: true,
        term,
        explanation: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  // === SUGESTÕES ===

  async investmentSuggestion(req, res, next) {
    try {
      const profile = req.body;

      const response = await openaiService.generateInvestmentSuggestion(profile);

      res.json({
        success: true,
        profile,
        suggestion: response.content,
        disclaimer:
          'Esta é uma sugestão educacional. Consulte um profissional antes de investir.',
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  async compareStocks(req, res, next) {
    try {
      const { stock1, stock2, data1, data2 } = req.body;

      if (!stock1 || !stock2) {
        return res.status(400).json({ error: 'Dois símbolos são obrigatórios' });
      }

      const response = await openaiService.compareTwoStocks(stock1, stock2, data1, data2);

      res.json({
        success: true,
        comparison: {
          stock1,
          stock2,
        },
        analysis: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

  async summarizeMarket(req, res, next) {
    try {
      const { marketData } = req.body;

      if (!marketData) {
        return res.status(400).json({ error: 'Dados do mercado são obrigatórios' });
      }

      const response = await openaiService.summarizeMarket(marketData);

      res.json({
        success: true,
        summary: response.content,
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },
};
