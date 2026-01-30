import supabase from '@/lib/supabase';

interface PerfilInvestidor {
  idade?: string;
  perfilRisco: string;
  objetivo?: string;
  horizonte?: string;
  nivelConhecimento?: number;
  renda?: string;
  valorInvestir?: string;
  [key: string]: unknown;
}

export async function salvarPerfilInvestidor(respostas: PerfilInvestidor) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('perfil_investidor')
    .upsert({
      user_id: user.id,
      idade: respostas.idade,
      perfil_risco: respostas.perfilRisco,
      objetivo_principal: respostas.objetivo,
      horizonte_investimento: respostas.horizonte,
      nivel_conhecimento: respostas.nivelConhecimento,
      renda_mensal: respostas.renda,
      valor_investir: respostas.valorInvestir,
      respostas_completas: respostas,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function buscarPerfilInvestidor() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('perfil_investidor')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // PGRST116 = registro não encontrado (não é erro)
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function verificarSeTemPerfil(): Promise<boolean> {
  const perfil = await buscarPerfilInvestidor();
  return !!perfil;
}

export async function deletarPerfilInvestidor() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const { error } = await supabase
    .from('perfil_investidor')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
  return { success: true };
}
