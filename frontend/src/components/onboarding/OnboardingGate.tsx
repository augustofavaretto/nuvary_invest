'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingTour, type TourStep } from './OnboardingTour';

// Flag por usuário: cada conta vê o tour uma vez (mesmo compartilhando o
// navegador). Sem o id, cai no global como fallback.
const STORAGE_KEY = 'nuvary_onboarding_v1';
const storageKeyFor = (userId?: string | null) =>
  userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;

// Evento global para refazer o tour (disparado, ex., pela Central de Ajuda)
export const START_ONBOARDING_EVENT = 'nuvary:start-onboarding';

const ALL_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo à Nuvary Invest! 👋',
    description:
      'Vamos te mostrar rapidinho onde fica cada coisa. Leva menos de um minuto — use “Próximo” ou as setas do teclado.',
  },
  {
    target: '[data-tour="carteira"]',
    title: 'Sua carteira',
    description:
      'Monte e acompanhe seus investimentos — ações, FIIs, renda fixa, internacional e cripto — com preços atualizados automaticamente.',
    placement: 'right',
  },
  {
    target: '[data-tour="chat"]',
    title: 'Assistente de IA',
    description:
      'Tire dúvidas sobre investimentos com a IA, que entende o contexto da sua carteira e do seu perfil.',
    placement: 'right',
  },
  {
    target: '[data-tour="relatorios"]',
    title: 'Relatórios',
    description:
      'Veja performance, extratos e o informe de Imposto de Renda, com gráficos e opção de exportar.',
    placement: 'right',
  },
  {
    target: '[data-tour="trilhas"]',
    title: 'Trilhas educativas',
    description:
      'Aprenda do básico ao avançado com vídeos organizados por tema.',
    placement: 'right',
  },
  {
    target: '[data-tour="alertas"]',
    title: 'Alertas de variação',
    description:
      'Quando um ativo da sua carteira varia 5% ou mais, o aviso aparece aqui no sino. (recurso Premium)',
    placement: 'bottom',
  },
  {
    target: '[data-tour="conta"]',
    title: 'Sua conta',
    description:
      'Acesse seu perfil, as configurações e a assinatura Premium por este menu.',
    placement: 'bottom',
  },
  {
    title: 'Tudo pronto! 🚀',
    description:
      'Explore à vontade. Você pode refazer este tour quando quiser na Central de Ajuda (menu Suporte).',
  },
];

export function OnboardingGate() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);

  // Filtra para os passos cujos alvos existem (ex.: no mobile a sidebar fica oculta)
  const start = useCallback(() => {
    const effective = ALL_STEPS.filter(
      (s) => !s.target || document.querySelector(s.target),
    );
    setSteps(effective);
    setRun(true);
  }, []);

  // Auto-início no primeiro acesso — na carteira (1ª página após cadastro +
  // questionário), após a UI renderizar e o usuário carregar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/carteira') return;
    if (!user?.id) return; // espera a sessão para usar o flag por usuário
    if (localStorage.getItem(storageKeyFor(user.id))) return;
    const t = setTimeout(start, 900);
    return () => clearTimeout(t);
  }, [pathname, user?.id, start]);

  // Refazer manualmente via evento
  useEffect(() => {
    const onReplay = () => start();
    window.addEventListener(START_ONBOARDING_EVENT, onReplay);
    return () => window.removeEventListener(START_ONBOARDING_EVENT, onReplay);
  }, [start]);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(storageKeyFor(user?.id), '1');
    } catch {
      /* ignore */
    }
    setRun(false);
  }, [user?.id]);

  return <OnboardingTour steps={steps} run={run} onFinish={finish} />;
}
