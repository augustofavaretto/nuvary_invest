import { riskProfileService } from '../services/riskProfile.js';

export const riskProfileController = {
  // GET /api/profile/questionnaire — retorna o questionário (sem pontuações)
  getQuestionnaire: async (req, res, next) => {
    try {
      const questionnaire = riskProfileService.getQuestionsOnly();
      res.json({
        success: true,
        data: questionnaire,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/profile/submit — processa as respostas e retorna o perfil
  submitAnswers: async (req, res, next) => {
    try {
      const { userId, answers } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório',
        });
      }

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'answers deve ser um objeto com as respostas',
        });
      }

      const result = riskProfileService.processAnswers(userId, answers);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
