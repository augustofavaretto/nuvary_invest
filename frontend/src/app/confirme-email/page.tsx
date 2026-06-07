'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/public/AuthLayout';
import { getWebmail } from '@/lib/webmail';

function ConfirmeEmailContent() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const webmail = getWebmail(email);

  return (
    <div className="w-full max-w-md mt-8 sm:mt-16">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-7 sm:p-9 shadow-2xl text-center">
        {/* Ícone */}
        <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center bg-cyan-500/10 border border-cyan-500/30 mb-5">
          <Mail className="w-7 h-7 text-cyan-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Confirme seu e-mail</h1>

        <p className="text-slate-400 text-sm leading-relaxed">
          Enviamos um link de confirmação{email ? ' para' : ''}
        </p>
        {email && (
          <p className="text-slate-100 font-semibold mb-3 mt-0.5 break-all">{email}</p>
        )}
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Abra seu e-mail e clique no link para ativar a conta. Depois disso você
          será levado direto ao questionário de perfil.
        </p>

        {/* Botão abrir caixa de e-mail */}
        {webmail && (
          <a
            href={webmail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold py-3 transition-colors mb-3"
          >
            <ExternalLink className="w-4 h-4" />
            {webmail.name ? `Abrir o ${webmail.name}` : 'Abrir meu e-mail'}
          </a>
        )}

        {/* Aviso spam */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-400 mb-5">
          Não recebeu? Verifique a pasta de{' '}
          <strong className="text-slate-300">spam</strong> ou aguarde alguns minutos.
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmeEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <ConfirmeEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
