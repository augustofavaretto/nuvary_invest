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
  cpf?: string | null;
  data_nascimento?: string | null;
  telefone?: string | null;
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
      (event, session) => {
        // Redireciona para redefinir senha quando o link de recuperação é clicado
        if (event === 'PASSWORD_RECOVERY') {
          setUser(session?.user ?? null);
          router.push('/redefinir-senha');
          return;
        }
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id); // sem await — não bloqueia a fila de eventos
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

    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    // Aceita varios formatos de chave por compatibilidade (nome, full_name, name).
    const nomeMeta =
      (meta.nome as string | undefined) ||
      (meta.full_name as string | undefined) ||
      (meta.name as string | undefined) ||
      '';

    if (data) {
      // Preenche campos extras do user_metadata como fallback se não estiverem no perfil.
      // Para `nome`, usa OR (nao ??) pra que string vazia no DB caia no metadata.
      setProfile({
        ...data,
        nome: data.nome || nomeMeta,
        cpf: data.cpf ?? meta.cpf ?? null,
        data_nascimento: data.data_nascimento ?? meta.data_nascimento ?? null,
        telefone: data.telefone ?? meta.telefone ?? null,
        aceite_termos: data.aceite_termos ?? meta.aceite_termos ?? false,
        data_aceite_termos: data.data_aceite_termos ?? meta.data_aceite_termos ?? null,
      });
    } else if (user) {
      // Sem linha na tabela `profiles` — monta um stub a partir do user_metadata
      // pra que Dashboard/TopBar ja exibam o nome certo.
      setProfile({
        id: user.id,
        nome: nomeMeta,
        email: user.email ?? '',
        aceite_termos: (meta.aceite_termos as boolean) ?? false,
        cpf: (meta.cpf as string | null) ?? null,
        data_nascimento: (meta.data_nascimento as string | null) ?? null,
        telefone: (meta.telefone as string | null) ?? null,
      });
    } else {
      setProfile(null);
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
