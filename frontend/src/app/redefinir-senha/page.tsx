'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/public/AuthLayout';
import { PasswordInput } from '@/components/public/AuthFields';
import { redefinirSenha } from '@/services/authService';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await redefinirSenha(novaSenha);
      setIsSuccess(true);
      setTimeout(() => {
        // hard redirect — evita loop de sessao em alguns navegadores
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setErro(msg || 'Não foi possível redefinir a senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mt-8 sm:mt-16">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 sm:p-9 shadow-2xl">
          {!isSuccess ? (
            <>
              <header className="text-center mb-7">
                <h1
                  className="font-extrabold text-3xl tracking-tight"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  Redefinir senha
                </h1>
                <p className="mt-1.5 text-sm text-slate-400">
                  Escolha uma nova senha para continuar
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Nova senha
                  </label>
                  <PasswordInput
                    value={novaSenha}
                    onChange={setNovaSenha}
                    visible={showPwd}
                    onToggle={() => setShowPwd((v) => !v)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Confirmar senha
                  </label>
                  <PasswordInput
                    value={confirmarSenha}
                    onChange={setConfirmarSenha}
                    visible={showPwd2}
                    onToggle={() => setShowPwd2((v) => !v)}
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                  />
                </div>

                {erro && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-300">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_30px_-10px_rgba(6,182,212,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
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
                Senha redefinida!
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Você será redirecionado para a tela de login em instantes.
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-6 text-sm text-cyan-400 hover:text-cyan-300"
              >
                Ir agora
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
