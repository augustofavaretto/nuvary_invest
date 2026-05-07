import supabase from '@/lib/supabase';

export async function getEmailRelatoriosAtivo(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('profiles')
    .select('email_relatorios_ativo')
    .eq('id', user.id)
    .single();
  return !!data?.email_relatorios_ativo;
}

export async function setEmailRelatoriosAtivo(enabled: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('profiles')
    .update({ email_relatorios_ativo: enabled })
    .eq('id', user.id);
}
