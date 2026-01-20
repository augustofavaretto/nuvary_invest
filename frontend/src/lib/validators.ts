export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarSenha(senha: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(senha);
}

export function validarNome(nome: string): boolean {
  return nome.trim().length >= 3;
}

export function getErroSenha(senha: string): string | null {
  if (!senha) return 'Senha é obrigatória';
  if (senha.length < 8) return 'Mínimo 8 caracteres';
  if (!/[a-z]/.test(senha)) return 'Deve conter letra minúscula';
  if (!/[A-Z]/.test(senha)) return 'Deve conter letra maiúscula';
  if (!/\d/.test(senha)) return 'Deve conter número';
  return null;
}

export function getErroNome(nome: string): string | null {
  if (!nome) return 'Nome é obrigatório';
  if (nome.trim().length < 3) return 'Mínimo 3 caracteres';
  return null;
}

export function getErroEmail(email: string): string | null {
  if (!email) return 'Email é obrigatório';
  if (!validarEmail(email)) return 'Email inválido';
  return null;
}
