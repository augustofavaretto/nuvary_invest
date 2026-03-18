'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface Profile {
  id: string;
  nome: string;
  email: string;
  aceite_termos: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Redireciona para redefinir senha quando o link de recuperação é clicado
        if (event === 'PASSWORD_RECOVERY') {
          setUser(session?.user ?? null);
          router.push('/redefinir-senha');
          return;
        }
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      // Preenche campos extras do user_metadata como fallback se não estiverem no perfil
      const meta = user?.user_metadata ?? {};
      setProfile({
        ...data,
        cpf: data.cpf ?? meta.cpf ?? null,
        data_nascimento: data.data_nascimento ?? meta.data_nascimento ?? null,
        telefone: data.telefone ?? meta.telefone ?? null,
        aceite_termos: data.aceite_termos ?? meta.aceite_termos ?? false,
        data_aceite_termos: data.data_aceite_termos ?? meta.data_aceite_termos ?? null,
      });
    } else {
      setProfile(data);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  const value = {
    user,
    profile,
    loading,
    logout,
    refreshProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
