export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceiteTermos: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  errors?: { field: string; message: string }[];
}

export interface InvestorProfile {
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
