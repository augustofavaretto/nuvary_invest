import { openaiService } from '../services/openai.js';

export const aiController = {
  async chat(req, res, next) {
    try {
      const { message, conversationHistory = [], history = [], userContext = {} } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
      }

      // Suporta ambos os formatos: conversationHistory (novo) e history (antigo)
      const chatHistory = conversationHistory.length > 0 ? conversationHistory : history;

      const response = await openaiService.assistantChat(message, chatHistory, userContext);

      res.json({
        success: true,
        content: response.content,
        response: response.content, // Mantém compatibilidade
        usage: response.usage,
      });
    } catch (error) {
      next(error);
    }
  },

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
};
