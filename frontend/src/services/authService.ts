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
  // Limpa qualquer sessao antiga do navegador para o estado pos-signup ser
  // autoritativo (evita pular a confirmacao de e-mail por uma sessao residual
  // de um teste/login anterior).
  await supabase.auth.signOut().catch(() => {});

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo: `${window.location.origin}/questionario`,
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

  // Salva campos adicionais na tabela profiles (upsert para garantir mesmo se trigger ainda não rodou)
  if (data.user) {
    const agora = new Date().toISOString();
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      nome,
      email,
      cpf,
      data_nascimento: dataNascimento,
      telefone,
      aceite_termos: aceiteTermos,
      data_aceite_termos: aceiteTermos ? agora : null,
      updated_at: agora
    }, { onConflict: 'id' });

    if (upsertError) {
      console.error('[cadastrar] Erro ao salvar perfil:', upsertError.message);
    }
  }

  return data;
}

export async function login(email: string, senha: string) {
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
