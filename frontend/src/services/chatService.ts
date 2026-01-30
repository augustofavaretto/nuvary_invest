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

// Gera um novo ID de conversa
export function gerarConversaId(): string {
  return uuidv4();
}

// Salva mensagem associada a uma conversa
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

// Busca histórico simples (sem conversa específica)
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

// Busca histórico paginado de uma conversa específica
export async function buscarHistoricoPaginado(
  pagina = 1,
  porPagina = 20,
  conversaId?: string
): Promise<{
  mensagens: Mensagem[];
  total: number;
  totalPaginas: number;
  paginaAtual: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { mensagens: [], total: 0, totalPaginas: 0, paginaAtual: 1 };

  let query = supabase
    .from('chat_historico')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (conversaId) {
    query = query.eq('conversa_id', conversaId);
  }

  const { count, error: countError } = await query;

  if (countError) throw countError;

  const total = count || 0;
  const totalPaginas = Math.ceil(total / porPagina);
  const offset = Math.max(0, total - (pagina * porPagina));
  const limite = pagina === totalPaginas ? (total % porPagina) || porPagina : porPagina;

  let dataQuery = supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .range(offset, offset + limite - 1);

  if (conversaId) {
    dataQuery = dataQuery.eq('conversa_id', conversaId);
  }

  const { data, error } = await dataQuery;

  if (error) throw error;

  return {
    mensagens: data || [],
    total,
    totalPaginas,
    paginaAtual: pagina,
  };
}

// Busca mensagens de uma conversa específica
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

// Lista todas as conversas do usuário
export async function listarConversas(): Promise<Conversa[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Busca todas as mensagens agrupadas por conversa_id
  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) return [];

  // Agrupa mensagens por conversa_id
  const conversasMap = new Map<string, Mensagem[]>();

  data.forEach((msg) => {
    const cid = msg.conversa_id || 'sem_conversa';
    if (!conversasMap.has(cid)) {
      conversasMap.set(cid, []);
    }
    conversasMap.get(cid)!.push(msg);
  });

  // Converte para array de conversas
  const conversas: Conversa[] = [];

  conversasMap.forEach((mensagens, conversaId) => {
    // Ordena mensagens por data (mais antiga primeiro)
    mensagens.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Pega a primeira mensagem do usuário como título
    const primeiraMensagemUser = mensagens.find(m => m.role === 'user');
    const titulo = primeiraMensagemUser
      ? primeiraMensagemUser.content.substring(0, 50) + (primeiraMensagemUser.content.length > 50 ? '...' : '')
      : 'Nova conversa';

    // Pega a última mensagem
    const ultimaMensagem = mensagens[mensagens.length - 1];

    conversas.push({
      id: conversaId,
      titulo,
      ultimaMensagem: ultimaMensagem.content.substring(0, 100),
      dataAtualizacao: ultimaMensagem.created_at,
      totalMensagens: mensagens.length
    });
  });

  // Ordena por data de atualização (mais recente primeiro)
  conversas.sort((a, b) =>
    new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime()
  );

  return conversas;
}

// Busca conversas por texto
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

  // Agrupa por conversa_id e retorna conversas únicas
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

// Conta total de mensagens
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

// Limpa todo o histórico do usuário
export async function limparHistorico() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const { error } = await supabase
    .from('chat_historico')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

// Deleta uma conversa específica
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
