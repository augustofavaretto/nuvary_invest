'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LifeBuoy, HelpCircle, ChevronDown, Mail, Send } from 'lucide-react';

// Contato de suporte (mesmo e-mail do mailto pré-preenchido)
const SUPORTE_EMAIL = 'investnet123@gmail.com';
const SUPORTE_SUBJECT = 'Suporte Nuvary Invest';
const SUPORTE_BODY = `Olá, equipe Nuvary Invest!

Preciso de ajuda com:

[descreva sua dúvida ou problema aqui]

Obrigado!`;
const SUPORTE_HREF = `mailto:${SUPORTE_EMAIL}?subject=${encodeURIComponent(
  SUPORTE_SUBJECT,
)}&body=${encodeURIComponent(SUPORTE_BODY)}`;

// ── Perguntas frequentes (ajuda da plataforma) ──────────────────────────────
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Como adiciono ativos à minha carteira?',
    a: 'Vá em Minha Carteira, escolha a categoria (Renda Fixa, Ações, FIIs, Internacional ou Criptomoedas) e clique para adicionar. Informe o ticker, a quantidade e o preço médio de compra — o preço atual é buscado automaticamente.',
  },
  {
    q: 'Os preços dos ativos são atualizados automaticamente?',
    a: 'Sim. Ações e FIIs vêm da B3 (Brapi), as criptomoedas do CoinGecko e os indicadores (CDI, Selic, dólar) do Banco Central. A atualização roda em segundo plano ao abrir a carteira, e você também pode forçar pelo botão de atualizar.',
  },
  {
    q: 'Como funcionam os alertas de variação?',
    a: 'Quando um ativo da sua carteira varia 5% ou mais, você recebe um alerta no sino do topo. É um recurso Premium e pode ser ligado ou desligado em Configurações → Funcionalidades Premium.',
  },
  {
    q: 'O que está incluído no plano Premium?',
    a: 'Alertas de variação ≥5%, relatório diário por e-mail, exportação de extratos (XLS/PDF), informe de Imposto de Renda e Chat IA ilimitado.',
  },
  {
    q: 'Como cancelo minha assinatura Premium?',
    a: 'Em Configurações → Assinatura Premium, clique em “Cancelar assinatura”. Você mantém o acesso Premium até o fim do período já pago e não há cobrança de renovação.',
  },
  {
    q: 'Como funciona o assistente de IA?',
    a: 'No Chat IA, o assistente responde dúvidas sobre investimentos usando o contexto da sua carteira e do seu perfil. O conteúdo é educativo e não constitui recomendação personalizada de investimento.',
  },
  {
    q: 'Onde vejo meus relatórios e o informe de IR?',
    a: 'Na página Relatórios você encontra as abas de Performance, Extratos e Imposto de Renda, com gráficos e opção de exportar.',
  },
  {
    q: 'Como recebo o relatório diário por e-mail?',
    a: 'Ative em Configurações → “Relatórios diários”. O envio acontece todos os dias às 8h (horário de Brasília). Há um botão de teste para você validar o recebimento na hora.',
  },
  {
    q: 'O que é o perfil de investidor?',
    a: 'Um questionário rápido que classifica você entre conservador, moderado, arrojado ou agressivo, ajustando as sugestões da plataforma. Você pode refazê-lo a qualquer momento na página Perfil.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Autenticação e dados ficam no Supabase com regras de acesso por usuário (cada conta só enxerga os próprios dados) e a comunicação é via HTTPS. Veja mais na Política de Privacidade.',
  },
];

export default function SuportePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return null;

  return (
    <DashboardLayout>
      <div className="max-w-[760px] mx-auto px-6 py-8">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3.5 mb-7"
        >
          <div
            className="w-11 h-11 rounded-[var(--r-md)] grid place-items-center shrink-0"
            style={{ background: 'rgba(0,184,217,0.12)', color: 'var(--cyan)' }}
          >
            <LifeBuoy className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--t1)' }}>
              Central de Ajuda
            </h1>
            <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--t2)' }}>
              Tire suas dúvidas ou fale com nosso suporte
            </p>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[var(--r-lg)] px-6 py-5 mb-4"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5 mb-[18px]">
            <HelpCircle className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="rounded-[var(--r-md)] overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left transition-colors hover:bg-[var(--glass)]"
                  >
                    <span className="text-[14px] font-semibold" style={{ color: 'var(--t1)' }}>
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-[18px] h-[18px] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--t2)' }}
                    />
                  </button>
                  {open && (
                    <div
                      className="px-4 pb-4 pt-3 text-[13px] leading-relaxed"
                      style={{ color: 'var(--t2)', borderTop: '1px solid var(--border)' }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Contato por e-mail */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[var(--r-lg)] px-6 py-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Mail className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
              Não encontrou sua resposta?
            </h2>
          </div>
          <p className="text-[13px] mb-4" style={{ color: 'var(--t2)' }}>
            Fale direto com a nossa equipe — respondemos no e-mail{' '}
            <strong style={{ color: 'var(--t1)' }}>{SUPORTE_EMAIL}</strong>.
          </p>
          <a
            href={SUPORTE_HREF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--cyan)', color: 'white', boxShadow: '0 4px 14px rgba(0,184,217,0.28)' }}
          >
            <Send className="w-4 h-4" />
            Falar com o suporte
          </a>
        </motion.section>

        {/* Atalho para os termos/privacidade */}
        <p className="text-[12px] text-center mt-6" style={{ color: 'var(--t2)' }}>
          Veja também nossos{' '}
          <Link href="/termos" className="hover:underline" style={{ color: 'var(--cyan)' }}>
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="hover:underline" style={{ color: 'var(--cyan)' }}>
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </DashboardLayout>
  );
}
