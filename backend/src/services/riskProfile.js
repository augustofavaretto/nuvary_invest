import { questionnaire, investorProfiles } from '../data/questionnaire.js';

class RiskProfileService {
  // Retorna apenas as perguntas (sem as pontuações)
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

  // Calcula a pontuação total a partir das respostas { "1": "A", ... }
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

  // Classifica o perfil do investidor baseado na pontuação
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

  // Analisa as respostas agrupadas por categoria
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

  // Determina o nível de uma categoria baseado no percentual
  getCategoryLevel(ratio) {
    if (ratio <= 0.25) return 'Muito Baixo';
    if (ratio <= 0.5) return 'Baixo';
    if (ratio <= 0.75) return 'Médio';
    return 'Alto';
  }

  // Processa as respostas e retorna o resultado completo da análise
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

    const score = this.calculateScore(answers);
    const profile = this.classifyProfile(score);
    const categoryAnalysis = this.analyzeByCategory(answers);

    return {
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      score: {
        total: score,
        min: 11,
        max: 44,
        percentage: Math.round(((score - 11) / 33) * 100),
      },
      profile,
      categoryAnalysis,
      answers,
    };
  }
}

export const riskProfileService = new RiskProfileService();
