'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PremiumPendentePage() {
  return (
    <DashboardLayout>
      <div className="dark min-h-full bg-bg-base text-text-primary flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-[var(--border-subtle)] rounded-2xl shadow-tile p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/15 inline-flex items-center justify-center mb-4">
            <Clock className="w-9 h-9 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pagamento em análise</h1>
          <p className="text-sm text-text-secondary mb-6">
            Seu pagamento foi recebido e está sendo processado pelo Mercado Pago. Assim que for
            confirmado, seu acesso Premium será liberado automaticamente — você não precisa fazer
            nada.
          </p>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 text-left text-sm text-text-secondary">
            <p>
              <strong className="text-text-primary">PIX:</strong> liberação em minutos após a confirmação bancária.
            </p>
            <p className="mt-1">
              <strong className="text-text-primary">Boleto:</strong> liberação em até 3 dias úteis após o pagamento.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#00B8D9] hover:bg-[#007EA7] text-white font-semibold text-sm transition-colors"
          >
            Voltar ao Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
