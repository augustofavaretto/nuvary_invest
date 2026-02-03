import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversa_id?: string;
}

interface Conversa {
  id: string;
  titulo: string;
  ultimaMensagem: string;
  dataAtualizacao: string;
  totalMensagens: number;
}

export function gerarConversaId(): string {
  return uuidv4();
}

export async function salvarMensagem(
  role: 'user' | 'assistant',
  content: string,
  conversaId?: string
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const { data, error } = await supabase
    .from('chat_historico')
    .insert({
      user_id: user.id,
      role,
      content,
      conversa_id: conversaId || null
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

export async function buscarMensagensPorConversa(conversaId: string): Promise<Mensagem[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .eq('conversa_id', conversaId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function listarConversas(): Promise<Conversa[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const conversasMap = new Map<string, Mensagem[]>();

  data.forEach((msg) => {
    const cid = msg.conversa_id || 'sem_conversa';
    if (!conversasMap.has(cid)) {
      conversasMap.set(cid, []);
    }
    conversasMap.get(cid)!.push(msg);
  });

  const conversas: Conversa[] = [];

  conversasMap.forEach((mensagens, conversaId) => {
    mensagens.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const primeiraMensagemUser = mensagens.find(m => m.role === 'user');
    const titulo = primeiraMensagemUser
      ? primeiraMensagemUser.content.substring(0, 50) + (primeiraMensagemUser.content.length > 50 ? '...' : '')
      : 'Nova conversa';

    const ultimaMensagem = mensagens[mensagens.length - 1];

    conversas.push({
      id: conversaId,
      titulo,
      ultimaMensagem: ultimaMensagem.content.substring(0, 100),
      dataAtualizacao: ultimaMensagem.created_at,
      totalMensagens: mensagens.length
    });
  });

  conversas.sort((a, b) =>
    new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime()
  );

  return conversas;
}

export async function buscarConversas(termo: string): Promise<Conversa[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .ilike('content', `%${termo}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const conversasMap = new Map<string, Mensagem[]>();

  data.forEach((msg) => {
    const cid = msg.conversa_id || 'sem_conversa';
    if (!conversasMap.has(cid)) {
      conversasMap.set(cid, []);
    }
    conversasMap.get(cid)!.push(msg);
  });

  const conversas: Conversa[] = [];

  conversasMap.forEach((mensagens, conversaId) => {
    mensagens.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const primeiraMensagemUser = mensagens.find(m => m.role === 'user');
    const titulo = primeiraMensagemUser
      ? primeiraMensagemUser.content.substring(0, 50) + (primeiraMensagemUser.content.length > 50 ? '...' : '')
      : 'Nova conversa';

    const ultimaMensagem = mensagens[mensagens.length - 1];

    conversas.push({
      id: conversaId,
      titulo,
      ultimaMensagem: ultimaMensagem.content.substring(0, 100),
      dataAtualizacao: ultimaMensagem.created_at,
      totalMensagens: mensagens.length
    });
  });

  conversas.sort((a, b) =>
    new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime()
  );

  return conversas;
}

export async function limparHistorico() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const { error } = await supabase
    .from('chat_historico')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function deletarConversa(conversaId: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const { error } = await supabase
    .from('chat_historico')
    .delete()
    .eq('user_id', user.id)
    .eq('conversa_id', conversaId);

  if (error) throw error;
}

export async function contarMensagens(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from('chat_historico')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) throw error;
  return count || 0;
}
