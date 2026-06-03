'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/public/AuthLayout';
import { Field, PasswordInput } from '@/components/public/AuthFields';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/services/authService';
import { verificarSeTemPerfil } from '@/services/perfilService';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [verifiqueEmail, setVerifiqueEmail] = useState(false);

  useEffect(() => {
    if (searchParams.get('verifique-email') === '1') {
      setVerifiqueEmail(true);
    } else if (searchParams.get('registered') === 'true') {
      setRegistered(true);
      const t = setTimeout(() => setRegistered(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        const temPerfil = await verificarSeTemPerfil();
        if (active) router.push(temPerfil ? '/dashboard' : '/questionario');
      } catch {
        // silencioso — usuario poderia estar offline
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const temPerfil = await verificarSeTemPerfil();
      router.push(temPerfil ? '/dashboard' : '/questionario');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg && !/invalid login|invalid_credentials/i.test(msg)
          ? msg
          : 'Email ou senha incorretos.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mt-8 sm:mt-16">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 sm:p-9 shadow-2xl">
          <header className="text-center mb-7">
            <h1
              className="font-extrabold text-3xl tracking-tight"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              Entrar
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Acesse sua conta para continuar
            </p>
          </header>

          {verifiqueEmail && (
            <div className="mb-5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-3 text-sm text-cyan-200">
              <p className="font-semibold mb-1">Confirme seu e-mail</p>
              <p className="text-cyan-200/80">
                Enviamos um link de confirmação. Acesse seu e-mail e clique no
                link para ativar a conta. Depois disso você será levado direto
                ao questionário de perfil.
              </p>
            </div>
          )}

          {registered && (
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-300">
              Conta criada com sucesso. Faça login para continuar.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="Email"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={setEmail}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-200">
                  Senha
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <PasswordInput
                value={password}
                onChange={setPassword}
                visible={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_30px_-10px_rgba(6,182,212,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Criar conta
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Ao continuar, você aceita os{' '}
          <Link href="/termos" className="hover:text-slate-300 underline underline-offset-2">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="hover:text-slate-300 underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020817]" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
