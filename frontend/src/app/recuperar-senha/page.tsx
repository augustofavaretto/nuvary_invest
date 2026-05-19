'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/public/AuthLayout';
import { Field } from '@/components/public/AuthFields';
import { recuperarSenha } from '@/services/authService';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await recuperarSenha(email);
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || 'Não foi possível enviar as instruções.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mt-8 sm:mt-16">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 sm:p-9 shadow-2xl">
          {!sent ? (
            <>
              <header className="text-center mb-7">
                <h1
                  className="font-extrabold text-3xl tracking-tight"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Recuperar senha
                </h1>
                <p className="mt-1.5 text-sm text-slate-400">
                  Digite seu email para receber instruções
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Field
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_30px_-10px_rgba(6,182,212,0.6)] disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Lembrou a senha?{' '}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Voltar para login
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="text-emerald-400" size={28} />
              </div>
              <h2
                className="font-extrabold text-2xl tracking-tight"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                Verifique sua caixa de entrada
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Se houver uma conta vinculada a{' '}
                <span className="text-slate-200">{email}</span>, você receberá em
                instantes um email com instruções para redefinir a senha.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Não esqueça de conferir o spam ou lixo eletrônico.
              </p>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                <ArrowLeft size={14} />
                Voltar para login
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
