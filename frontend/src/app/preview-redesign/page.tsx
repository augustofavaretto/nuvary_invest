"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft, MessageSquare } from "lucide-react";

import { Logo } from "@/components/shared/Logo";

import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassNav } from "@/components/glass/GlassNav";
import { LiquidGlassEffect } from "@/components/glass/LiquidGlassEffect";

import { BentoGrid } from "@/components/bento/BentoGrid";
import { PerformanceTile } from "@/components/bento/tiles/PerformanceTile";
import { AllocationTile } from "@/components/bento/tiles/AllocationTile";
import { NextActionTile } from "@/components/bento/tiles/NextActionTile";
import { TopMoversTile } from "@/components/bento/tiles/TopMoversTile";
import { NextLessonTile } from "@/components/bento/tiles/NextLessonTile";

// Rota de preview do redesign Glass + Bento (rebrand v4.6.0).
// Publica, sem auth, sem DashboardLayout. NAO afeta nenhuma pagina existente.
export default function PreviewRedesignPage() {
  return (
    <div className="dark min-h-screen bg-bg-base text-text-primary">
      {/* Aurora sutil de fundo */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-cyan-500/8 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-navy-500/40 blur-[120px]" />
      </div>

      {/* Topbar glass */}
      <GlassNav as="header" side="bottom" className="sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao app
            </Link>
            <span className="h-5 w-px bg-[var(--border-default)]" />
            <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
              Preview do redesign
            </span>
          </div>

          <Logo variant="full" size="md" />
        </div>
      </GlassNav>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-16">
        {/* ====================== HERO ====================== */}
        <section>
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-xs uppercase tracking-wider text-cyan-500 font-semibold">
              Nuvary Invest — Glass + Bento dark-first
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pre-visualizacao do{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-700 bg-clip-text text-transparent">
                novo design
              </span>
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl">
              Tudo nesta pagina foi adicionado nos commits c79427b → 1838ce7
              sem afetar nenhuma rota do app. Use para validar visualmente
              antes de aplicar nas paginas reais.
            </p>
          </div>
        </section>

        {/* ====================== BENTO DASHBOARD ====================== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-4">
            Bento Dashboard (Tarefa 4)
          </h2>
          <BentoGrid>
            <PerformanceTile span="lg:col-span-8 lg:row-span-2" />
            <AllocationTile span="lg:col-span-4" />
            <NextActionTile span="lg:col-span-4" />
            <TopMoversTile span="lg:col-span-6" />
            <NextLessonTile span="lg:col-span-6" />
          </BentoGrid>
        </section>

        {/* ====================== GLASS PRIMITIVES ====================== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-4">
            Glass primitives (Tarefa 2)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard variant="regular" className="p-6">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                GlassCard · regular
              </p>
              <p className="text-sm text-text-primary">
                Backdrop blur padrao, border sutil. Para overlays e modais.
              </p>
            </GlassCard>

            <GlassCard variant="clear" className="p-6">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                GlassCard · clear
              </p>
              <p className="text-sm text-text-primary">
                Blur mais leve, quase transparente. Para tooltips e menus.
              </p>
            </GlassCard>

            <GlassCard variant="elevated" interactive className="p-6">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                GlassCard · elevated + interactive
              </p>
              <p className="text-sm text-text-primary">
                Blur intenso + sombra de tile + hover sobe 2px com spring.
              </p>
            </GlassCard>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <GlassButton variant="prominent" size="lg">
              <Sparkles className="w-4 h-4" />
              CTA principal
            </GlassButton>
            <GlassButton variant="regular" size="md">
              Acao secundaria
            </GlassButton>
            <GlassButton variant="ghost" size="md">
              Acao sutil
            </GlassButton>

            <LiquidGlassEffect intensity={2} className="px-4 py-2 rounded-full">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-500">
                <Sparkles className="w-4 h-4" />
                Premium
              </span>
            </LiquidGlassEffect>
          </div>
        </section>

        {/* ====================== LOGO ====================== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-4">
            Logo (Tarefa 3)
          </h2>

          <div className="flex flex-wrap items-end gap-8 bg-bg-card border border-[var(--border-subtle)] rounded-2xl p-8">
            <div className="text-center">
              <Logo variant="full" size="sm" />
              <p className="text-xs text-text-tertiary mt-2">full · sm</p>
            </div>
            <div className="text-center">
              <Logo variant="full" size="md" />
              <p className="text-xs text-text-tertiary mt-2">full · md</p>
            </div>
            <div className="text-center">
              <Logo variant="full" size="lg" />
              <p className="text-xs text-text-tertiary mt-2">full · lg</p>
            </div>
            <div className="text-center">
              <Logo variant="icon" size="lg" />
              <p className="text-xs text-text-tertiary mt-2">icon · lg</p>
            </div>
            <div className="text-center">
              <Logo variant="icon" size="xl" />
              <p className="text-xs text-text-tertiary mt-2">icon · xl</p>
            </div>
          </div>
        </section>

        {/* ====================== TIPOGRAFIA ====================== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-4">
            Tipografia & cores brand (Tarefa 1)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-card border border-[var(--border-subtle)] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-3">
                Inter (UI)
              </p>
              <p className="text-2xl font-extrabold">Aa 800</p>
              <p className="text-xl font-bold">Aa 700</p>
              <p className="text-lg font-semibold">Aa 600</p>
              <p className="text-base font-medium">Aa 500</p>
              <p className="text-base">Aa 400</p>
            </div>

            <div className="bg-bg-card border border-[var(--border-subtle)] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-3">
                JetBrains Mono (valores)
              </p>
              <p className="font-mono text-2xl">R$ 47.832,15</p>
              <p className="font-mono text-base text-gain">+8,40% YTD</p>
              <p className="font-mono text-base text-loss">-1,12%</p>
              <p className="font-mono text-sm text-text-secondary">
                PETR4 · 06/05/2026
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "navy-500", hex: "#0B1F33" },
              { name: "cyan-500", hex: "#00B8D9" },
              { name: "cyan-700", hex: "#007EA7" },
              { name: "gain", hex: "#10B981" },
            ].map((c) => (
              <div
                key={c.name}
                className="bg-bg-card border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3"
              >
                <span
                  className="w-10 h-10 rounded-lg shrink-0 ring-1 ring-white/10"
                  style={{ background: c.hex }}
                />
                <div className="text-xs">
                  <p className="font-semibold">{c.name}</p>
                  <p className="font-mono text-text-tertiary">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================== FOOTER ====================== */}
        <footer className="pt-8 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-text-tertiary">
          <span>Preview do redesign · Maio 2026 · v4.6.0-preview</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar
          </Link>
        </footer>
      </main>

      {/* Chat FAB com LiquidGlass — preview do que ira para o app */}
      <div className="fixed bottom-6 right-6 z-40">
        <LiquidGlassEffect intensity={3} className="rounded-full">
          <button
            type="button"
            className="w-14 h-14 rounded-full inline-flex items-center justify-center text-cyan-300 hover:text-cyan-100 transition-colors"
            aria-label="Abrir chat IA"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </LiquidGlassEffect>
      </div>
    </div>
  );
}
