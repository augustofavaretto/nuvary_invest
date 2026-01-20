import supabase from '@/lib/supabase';

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  aceiteTermos: boolean;
}

export async function cadastrar({ nome, email, senha, aceiteTermos }: CadastroData) {
  // 1. Criar usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome: nome
      }
    }
  });

  if (error) throw error;

  // 2. Atualizar aceite dos termos
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        aceite_termos: aceiteTermos,
        data_aceite_termos: new Date().toISOString()
      })
      .eq('id', data.user.id);
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
