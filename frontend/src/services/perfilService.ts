import supabase from '@/lib/supabase';
import { STRINGS } from '@/constants/strings';

export interface PerfilInvestidor {
  id?: string;
  user_id?: string;
  idade?: string;
  perfil_risco?: string;
  perfilRisco?: string;
  objetivo_principal?: string;
  horizonte_investimento?: string;
  nivel_conhecimento?: number;
  renda_mensal?: string;
  respostas_completas?: unknown;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Helper para verificar se é AbortError
function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export async function salvarPerfilInvestidor(respostas: PerfilInvestidor) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error(STRINGS.errors.usuarioNaoAutenticado);

    const { data, error } = await supabase
      .from('perfil_investidor')
      .upsert({
        user_id: user.id,
        idade: respostas.idade,
        perfil_risco: respostas.perfilRisco || respostas.perfil_risco,
        objetivo_principal: respostas.objetivo_principal,
        horizonte_investimento: respostas.horizonte_investimento,
        nivel_conhecimento: respostas.nivel_conhecimento,
        renda_mensal: respostas.renda_mensal,
        respostas_completas: respostas,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (isAbortError(error)) return null;
    throw error;
  }
}

export async function buscarPerfilInvestidor(): Promise<PerfilInvestidor | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('perfil_investidor')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw error;
    }
    return data;
  } catch (error) {
    if (isAbortError(error)) return null;
    throw error;
  }
}

export async function verificarSeTemPerfil(): Promise<boolean> {
  try {
    const perfil = await buscarPerfilInvestidor();
    return !!perfil;
  } catch (error) {
    if (isAbortError(error)) return false;
    throw error;
  }
}

export async function deletarPerfilInvestidor() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error(STRINGS.errors.usuarioNaoAutenticado);

    const { error } = await supabase
      .from('perfil_investidor')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    if (isAbortError(error)) return { success: false };
    throw error;
  }
}
