import { riskProfileService } from '../services/riskProfile.js';

export const riskProfileController = {
  /**
   * GET /api/profile/questionnaire
   * Retorna o questionário (sem pontuações visíveis)
   */
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

  /**
   * POST /api/profile/submit
   * Processa as respostas e retorna o perfil
   * Body: { userId: string, answers: { "1": "A", "2": "B", ... } }
   */
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

  /**
   * GET /api/profile/user/:userId
   * Retorna o perfil atual do usuário
   */
  getUserProfile: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const profile = riskProfileService.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Perfil não encontrado para este usuário',
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/profile/user/:userId/history
   * Retorna o histórico de perfis do usuário
   */
  getUserHistory: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const history = riskProfileService.getUserProfileHistory(userId);

      res.json({
        success: true,
        data: {
          userId,
          totalAssessments: history.length,
          history,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/profile/user/:userId
   * Remove o perfil do usuário
   */
  deleteUserProfile: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const deleted = riskProfileService.deleteUserProfile(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Perfil não encontrado para este usuário',
        });
      }

      res.json({
        success: true,
        message: 'Perfil removido com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/profile/types
   * Lista todos os tipos de perfil disponíveis
   */
  getProfileTypes: async (req, res, next) => {
    try {
      const profiles = riskProfileService.getAllProfiles();

      res.json({
        success: true,
        data: profiles,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/profile/types/:type
   * Retorna detalhes de um tipo de perfil específico
   */
  getProfileTypeDetails: async (req, res, next) => {
    try {
      const { type } = req.params;

      const profile = riskProfileService.getProfileDetails(type);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de perfil não encontrado',
          validTypes: ['conservador', 'moderado', 'arrojado', 'agressivo'],
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/profile/statistics
   * Retorna estatísticas gerais (admin)
   */
  getStatistics: async (req, res, next) => {
    try {
      const stats = riskProfileService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/profile/calculate
   * Calcula o perfil sem salvar (para preview)
   * Body: { answers: { "1": "A", "2": "B", ... } }
   */
  calculatePreview: async (req, res, next) => {
    try {
      const { answers } = req.body;

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'answers deve ser um objeto com as respostas',
        });
      }

      const score = riskProfileService.calculateScore(answers);
      const profile = riskProfileService.classifyProfile(score);
      const categoryAnalysis = riskProfileService.analyzeByCategory(answers);

      res.json({
        success: true,
        preview: true,
        data: {
          score: {
            total: score,
            min: 10,
            max: 40,
            percentage: Math.round(((score - 10) / 30) * 100),
          },
          profile,
          categoryAnalysis,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
