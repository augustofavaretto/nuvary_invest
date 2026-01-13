import { questionnaire, investorProfiles } from '../data/questionnaire.js';

// Armazenamento em memória dos perfis de usuários
const userProfiles = new Map();

class RiskProfileService {
  /**
   * Retorna o questionário completo
   */
  getQuestionnaire() {
    return questionnaire;
  }

  /**
   * Retorna apenas as perguntas (sem as pontuações)
   */
  getQuestionsOnly() {
    return {
      title: questionnaire.title,
      description: questionnaire.description,
      questions: questionnaire.questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options.map((opt) => ({
          value: opt.value,
          text: opt.text,
        })),
      })),
    };
  }

  /**
   * Calcula a pontuação total baseada nas respostas
   * @param {Object} answers - Objeto com as respostas { "1": "A", "2": "B", ... }
   * @returns {number} - Pontuação total (10-40)
   */
  calculateScore(answers) {
    let totalScore = 0;

    questionnaire.questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const selectedOption = question.options.find((opt) => opt.value === answer);
        if (selectedOption) {
          totalScore += selectedOption.points;
        }
      }
    });

    return totalScore;
  }

  /**
   * Classifica o perfil do investidor baseado na pontuação
   * @param {number} score - Pontuação total
   * @returns {Object} - Perfil do investidor
   */
  classifyProfile(score) {
    for (const [key, profile] of Object.entries(investorProfiles)) {
      if (score >= profile.minScore && score <= profile.maxScore) {
        return {
          type: key,
          ...profile,
        };
      }
    }

    // Fallback para conservador se algo der errado
    return {
      type: 'conservador',
      ...investorProfiles.conservador,
    };
  }

  /**
   * Analisa as respostas por categoria
   * @param {Object} answers - Respostas do usuário
   * @returns {Object} - Análise por categoria
   */
  analyzeByCategory(answers) {
    const categories = {
      tolerancia_risco: { score: 0, maxScore: 0, questions: 0 },
      horizonte: { score: 0, maxScore: 0, questions: 0 },
      objetivos: { score: 0, maxScore: 0, questions: 0 },
    };

    questionnaire.questions.forEach((question) => {
      const category = categories[question.category];
      if (category) {
        category.maxScore += 4; // Máximo de pontos por questão
        category.questions += 1;

        const answer = answers[question.id];
        if (answer) {
          const selectedOption = question.options.find((opt) => opt.value === answer);
          if (selectedOption) {
            category.score += selectedOption.points;
          }
        }
      }
    });

    // Calcula percentual de cada categoria
    const analysis = {};
    for (const [key, data] of Object.entries(categories)) {
      analysis[key] = {
        score: data.score,
        maxScore: data.maxScore,
        percentage: Math.round((data.score / data.maxScore) * 100),
        level: this.getCategoryLevel(data.score / data.maxScore),
      };
    }

    return analysis;
  }

  /**
   * Determina o nível de uma categoria baseado no percentual
   */
  getCategoryLevel(ratio) {
    if (ratio <= 0.25) return 'Muito Baixo';
    if (ratio <= 0.5) return 'Baixo';
    if (ratio <= 0.75) return 'Médio';
    return 'Alto';
  }

  /**
   * Processa as respostas e retorna o resultado completo
   * @param {string} userId - ID do usuário
   * @param {Object} answers - Respostas do questionário
   * @returns {Object} - Resultado completo da análise
   */
  processAnswers(userId, answers) {
    // Valida se todas as perguntas foram respondidas
    const missingQuestions = questionnaire.questions.filter(
      (q) => !answers[q.id]
    );

    if (missingQuestions.length > 0) {
      return {
        success: false,
        error: 'Questionário incompleto',
        missingQuestions: missingQuestions.map((q) => q.id),
      };
    }

    // Calcula pontuação e classifica
    const score = this.calculateScore(answers);
    const profile = this.classifyProfile(score);
    const categoryAnalysis = this.analyzeByCategory(answers);

    // Monta resultado
    const result = {
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      score: {
        total: score,
        min: 10,
        max: 40,
        percentage: Math.round(((score - 10) / 30) * 100),
      },
      profile,
      categoryAnalysis,
      answers,
    };

    // Armazena o perfil do usuário
    this.saveUserProfile(userId, result);

    return result;
  }

  /**
   * Salva o perfil do usuário
   */
  saveUserProfile(userId, profileData) {
    const existingProfiles = userProfiles.get(userId) || [];
    existingProfiles.push({
      ...profileData,
      savedAt: new Date().toISOString(),
    });

    // Mantém apenas os últimos 10 registros
    if (existingProfiles.length > 10) {
      existingProfiles.shift();
    }

    userProfiles.set(userId, existingProfiles);
  }

  /**
   * Recupera o perfil atual do usuário
   */
  getUserProfile(userId) {
    const profiles = userProfiles.get(userId);
    if (!profiles || profiles.length === 0) {
      return null;
    }
    return profiles[profiles.length - 1]; // Retorna o mais recente
  }

  /**
   * Recupera o histórico de perfis do usuário
   */
  getUserProfileHistory(userId) {
    return userProfiles.get(userId) || [];
  }

  /**
   * Lista todos os perfis disponíveis
   */
  getAllProfiles() {
    return Object.entries(investorProfiles).map(([key, profile]) => ({
      type: key,
      name: profile.name,
      color: profile.color,
      description: profile.description,
      scoreRange: `${profile.minScore}-${profile.maxScore}`,
    }));
  }

  /**
   * Retorna detalhes de um perfil específico
   */
  getProfileDetails(profileType) {
    const profile = investorProfiles[profileType];
    if (!profile) {
      return null;
    }
    return {
      type: profileType,
      ...profile,
    };
  }

  /**
   * Exclui o perfil de um usuário
   */
  deleteUserProfile(userId) {
    const existed = userProfiles.has(userId);
    userProfiles.delete(userId);
    return existed;
  }

  /**
   * Estatísticas gerais (para admin)
   */
  getStatistics() {
    const stats = {
      totalUsers: userProfiles.size,
      totalAssessments: 0,
      profileDistribution: {
        conservador: 0,
        moderado: 0,
        arrojado: 0,
        agressivo: 0,
      },
    };

    userProfiles.forEach((profiles) => {
      stats.totalAssessments += profiles.length;
      if (profiles.length > 0) {
        const latestProfile = profiles[profiles.length - 1];
        if (latestProfile.profile && latestProfile.profile.type) {
          stats.profileDistribution[latestProfile.profile.type]++;
        }
      }
    });

    return stats;
  }
}

export const riskProfileService = new RiskProfileService();
