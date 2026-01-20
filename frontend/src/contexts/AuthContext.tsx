'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  InvestorProfile,
} from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  getInvestorProfile: () => Promise<InvestorProfile | null>;
  saveInvestorProfile: (profile: InvestorProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'nuvary_access_token';
const REFRESH_TOKEN_KEY = 'nuvary_refresh_token';
const USER_KEY = 'nuvary_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Salva tokens no localStorage
  const saveAuth = useCallback((token: string, refresh: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(userData);
  }, []);

  // Limpa autenticação
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.accessToken && data.user) {
        saveAuth(data.accessToken, data.refreshToken, data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.',
      };
    }
  }, [saveAuth]);

  // Registro
  const register = useCallback(async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [accessToken, refreshToken, clearAuth, router]);

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.accessToken) {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        setAccessToken(data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }, [refreshToken]);

  // Fetch com autenticação (auto-refresh)
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Se token expirado, tenta refresh
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        };
        response = await fetch(url, { ...options, headers: newHeaders });
      } else {
        clearAuth();
        router.push('/login');
      }
    }

    return response;
  }, [accessToken, refreshAccessToken, clearAuth, router]);

  // Obtém perfil de investidor
  const getInvestorProfile = useCallback(async (): Promise<InvestorProfile | null> => {
    try {
      const response = await authFetch(`${API_URL}/auth/investor-profile`);
      const data = await response.json();
      return data.success ? data.profile : null;
    } catch (error) {
      return null;
    }
  }, [authFetch]);

  // Salva perfil de investidor
  const saveInvestorProfile = useCallback(async (profile: InvestorProfile) => {
    try {
      await authFetch(`${API_URL}/auth/investor-profile`, {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  }, [authFetch]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
    getInvestorProfile,
    saveInvestorProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
