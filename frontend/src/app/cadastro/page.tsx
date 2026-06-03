'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, IdCard, Calendar, Phone, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/public/AuthLayout';
import { Field, PasswordInput } from '@/components/public/AuthFields';
import { cadastrar } from '@/services/authService';
import supabase from '@/lib/supabase';
import { isValidCPF } from '@/lib/cpf';

// Mascaras visuais (CPF, data, telefone) — apenas display.
// O payload enviado ao backend e limpo via .replace(/\D/g, '').
function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskDate(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

type ForcaSenha = {
  pct: number;
  label: string;
  bar: string;
  text: string;
};

function calcStrength(pwd: string): ForcaSenha {
  if (!pwd) return { pct: 0, label: '', bar: '', text: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 2) return { pct: 33, label: 'Fraca', bar: 'bg-red-400', text: 'text-red-300' };
  if (score <= 3) return { pct: 66, label: 'Média', bar: 'bg-amber-400', text: 'text-amber-300' };
  return { pct: 100, label: 'Forte', bar: 'bg-emerald-400', text: 'text-emerald-300' };
}

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    nascimento: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceite: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Marca que o usuario ja saiu do campo CPF — so mostramos o erro depois do
  // primeiro blur pra nao acusar "invalido" enquanto ele esta digitando.
  const [cpfTouched, setCpfTouched] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const senhaForca = useMemo(() => calcStrength(form.senha), [form.senha]);
  const cpfValido = isValidCPF(form.cpf);
  const cpfDigits = form.cpf.replace(/\D/g, '').length;
  const cpfErrorMsg =
    cpfTouched && cpfDigits > 0 && !cpfValido
      ? cpfDigits < 11
        ? 'CPF incompleto.'
        : 'CPF inválido. Verifique os números digitados.'
      : '';
  const podeEnviar =
    !!form.nome &&
    cpfValido &&
    form.email.includes('@') &&
    form.senha.length >= 8 &&
    form.senha === form.confirmarSenha &&
    form.aceite;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!cpfValido) {
      setCpfTouched(true);
      setError('Informe um CPF válido para continuar.');
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!form.aceite) {
      setError('Você precisa aceitar os Termos e a Política de Privacidade.');
      return;
    }

    setLoading(true);
    try {
      // Backend espera o mesmo payload de antes: cpf e telefone sem mascara,
      // data no formato DD/MM/AAAA (string), aceiteTermos boolean.
      await cadastrar({
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ''),
        dataNascimento: form.nascimento,
        telefone: form.telefone.replace(/\D/g, ''),
        email: form.email,
        senha: form.senha,
        aceiteTermos: form.aceite,
      });

      // Se a sessao foi criada (email confirmation desligado), vai direto
      // para o questionario. Senao, leva para login com flag de sucesso.
      const { data: { session } } = await supabase.auth.getSession();
      router.push(session ? '/questionario' : '/login?registered=true');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (/already registered|already been registered/i.test(msg)) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (/rate|429|over_email/i.test(msg)) {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setError(msg || 'Não foi possível criar sua conta.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl mt-4 sm:mt-8">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 sm:p-9 shadow-2xl">
          <header className="text-center mb-7">
            <h1
              className="font-extrabold text-3xl tracking-tight"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Criar conta
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Preencha os dados para começar sua jornada
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="Nome completo"
              icon={User}
              value={form.nome}
              onChange={(v) => set('nome', v)}
              placeholder="Seu nome"
              autoComplete="name"
              required
            />

            <Field
              label="CPF"
              icon={IdCard}
              value={form.cpf}
              onChange={(v) => set('cpf', maskCPF(v))}
              onBlur={() => setCpfTouched(true)}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              required
              error={cpfErrorMsg}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Data de nascimento"
                icon={Calendar}
                value={form.nascimento}
                onChange={(v) => set('nascimento', maskDate(v))}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                required
              />
              <Field
                label="Telefone"
                icon={Phone}
                value={form.telefone}
                onChange={(v) => set('telefone', maskPhone(v))}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                maxLength={15}
                required
              />
            </div>

            <Field
              label="Email"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Senha
              </label>
              <PasswordInput
                value={form.senha}
                onChange={(v) => set('senha', v)}
                visible={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              {form.senha && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full transition-all ${senhaForca.bar}`}
                      style={{ width: `${senhaForca.pct}%` }}
                    />
                  </div>
                  <span className={`text-xs ${senhaForca.text}`}>
                    {senhaForca.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Confirmar senha
              </label>
              <PasswordInput
                value={form.confirmarSenha}
                onChange={(v) => set('confirmarSenha', v)}
                visible={showPwd2}
                onToggle={() => setShowPwd2((v) => !v)}
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
              />
              {form.confirmarSenha && form.senha !== form.confirmarSenha && (
                <p className="mt-1.5 text-xs text-red-300">
                  As senhas não coincidem.
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.aceite}
                onChange={(e) => set('aceite', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0a1428] accent-cyan-500"
              />
              <span>
                Li e aceito os{' '}
                <Link
                  href="/termos"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link
                  href="/privacidade"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !podeEnviar}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_30px_-10px_rgba(6,182,212,0.6)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Já tem conta?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
