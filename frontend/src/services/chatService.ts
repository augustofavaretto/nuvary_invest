import supabase from '@/lib/supabase';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function salvarMensagem(role: 'user' | 'assistant', content: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('chat_historico')
    .insert({
      user_id: user.id,
      role,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function buscarHistorico(limite = 50): Promise<Mensagem[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limite);

  if (error) throw error;
  return data || [];
}

export async function limparHistorico() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('chat_historico')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
