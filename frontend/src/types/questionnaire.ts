export interface QuestionOption {
  value: string;
  text: string;
}

export interface Question {
  id: number;
  category: 'objetivos' | 'horizonte' | 'tolerancia_risco';
  question: string;
  options: QuestionOption[];
}

export interface Questionnaire {
  title: string;
  description: string;
  questions: Question[];
}

export interface AllocationRecommendation {
  rendaFixa: number;
  rendaVariavel: number;
  fundosImobiliarios: number;
  internacional: number;
}

export interface InvestorProfile {
  type: 'conservador' | 'moderado' | 'arrojado' | 'agressivo';
  name: string;
  color: string;
  description: string;
  characteristics: string[];
  recommendedAllocation: AllocationRecommendation;
  suggestedInvestments: string[];
}

export interface CategoryAnalysis {
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
}

export interface QuestionnaireResult {
  success: boolean;
  userId: string;
  timestamp: string;
  score: {
    total: number;
    min: number;
    max: number;
    percentage: number;
  };
  profile: InvestorProfile;
  categoryAnalysis: {
    objetivos: CategoryAnalysis;
    horizonte: CategoryAnalysis;
    tolerancia_risco: CategoryAnalysis;
  };
  answers: Record<string, string>;
}

export type Answers = Record<number, string>;
