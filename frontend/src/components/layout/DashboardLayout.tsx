'use client';

import { Sidebar, MobileSidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PremiumUpgradeBanner } from './PremiumUpgradeBanner';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { AlertToastContainer } from '@/components/dashboard/AlertToastContainer';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Quando true, oculta o TopBar (telas que tem header proprio, ex: Chat full-screen) */
  hideTopBar?: boolean;
}

// ── DashboardLayout (AppShell) ──────────────────────────────────────────────
// Estrutura padrao do redesign:
//   ┌─────────┬──────────────────────────────────────┐
//   │         │  TopBar (80px, sticky)               │
//   │ Sidebar ├──────────────────────────────────────┤
//   │  96px   │  Main (children)                     │
//   │ (fixa)  │                                      │
//   └─────────┴──────────────────────────────────────┘
// Tela inteira em dark, com ambient gradient sutil de fundo.
export function DashboardLayout({ children, hideTopBar = false }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      {/* Ambient — gradient radial sutil de fundo */}
      <div className="nv-ambient" />

      {/* Sidebar desktop (fixa) + mobile (drawer) */}
      <Sidebar />
      <MobileSidebar />

      {/* Area principal — desloca conforme largura da sidebar em lg+ */}
      <div className="relative z-[1] lg:ml-[var(--sidebar-w)] min-h-screen flex flex-col">
        {!hideTopBar && (
          <TopBar notificationSlot={<NotificationBell />} />
        )}

        {/* Banner global de upsell — so aparece para usuario free */}
        <PremiumUpgradeBanner />

        <main className="flex-1 nv-view-in">
          {children}
        </main>
      </div>

      <AlertToastContainer />
      <OnboardingGate />
    </div>
  );
}
