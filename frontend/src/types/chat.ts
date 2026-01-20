export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  category: 'profile' | 'market' | 'education' | 'analysis';
}

export interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

export interface InvestorProfileContext {
  type: 'conservador' | 'moderado' | 'arrojado' | 'agressivo';
  name: string;
  score: number;
  recommendedAllocation: {
    rendaFixa: number;
    rendaVariavel: number;
    fundosImobiliarios: number;
    internacional: number;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  profile: InvestorProfileContext | null;
}
