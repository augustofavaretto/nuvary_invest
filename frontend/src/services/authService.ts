import supabase from '@/lib/supabase';

interface CadastroData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  senha: string;
  aceiteTermos: boolean;
}

export async function cadastrar({ nome, cpf, dataNascimento, telefone, email, senha, aceiteTermos }: CadastroData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
        cpf,
        data_nascimento: dataNascimento,
        telefone,
        aceite_termos: aceiteTermos,
        data_aceite_termos: new Date().toISOString()
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function login(email: string, senha: string) {
  // TODO: Implementar login com Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/questionario`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function recuperarSenha(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`
  });

  if (error) throw error;
  return data;
}

export async function redefinirSenha(novaSenha: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: novaSenha
  });

  if (error) throw error;
  return data;
}

export async function getUsuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarNome(novoNome: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const { error: authError } = await supabase.auth.updateUser({
    data: { nome: novoNome }
  });

  if (authError) throw authError;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      nome: novoNome,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarSenha(senhaAtual: string, novaSenha: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) throw new Error('Usuário não autenticado');

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual
  });

  if (loginError) throw new Error('Senha atual incorreta');

  const { data, error } = await supabase.auth.updateUser({
    password: novaSenha
  });

  if (error) throw error;
  return data;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  const urlComCache = `${publicUrl}?t=${Date.now()}`;

  await supabase
    .from('profiles')
    .update({ avatar_url: urlComCache, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return urlComCache;
}
