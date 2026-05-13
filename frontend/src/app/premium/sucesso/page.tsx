'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PremiumSucessoPage() {
  return (
    <DashboardLayout>
      <div className="dark min-h-full bg-bg-base text-text-primary flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-[var(--border-subtle)] rounded-2xl shadow-tile p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 inline-flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pagamento confirmado!</h1>
          <p className="text-sm text-text-secondary mb-6">
            Seu acesso ao <strong className="text-text-primary">Nuvary Premium</strong> foi liberado.
            Você já pode usar todas as funcionalidades exclusivas.
          </p>

          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              O que está disponível agora
            </p>
            <ul className="text-sm space-y-1 text-text-secondary">
              <li>• Alertas de variação ≥ 5%</li>
              <li>• Relatório diário por e-mail (ative em /configuracoes)</li>
              <li>• Chat IA com tokens ilimitados</li>
              <li>• Ativos ilimitados na carteira</li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#00B8D9] hover:bg-[#007EA7] text-white font-semibold text-sm transition-colors"
          >
            Ir para o Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
