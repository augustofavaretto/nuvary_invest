'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PremiumErroPage() {
  return (
    <DashboardLayout>
      <div className="dark min-h-full bg-bg-base text-text-primary flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-[var(--border-subtle)] rounded-2xl shadow-tile p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/15 inline-flex items-center justify-center mb-4">
            <XCircle className="w-9 h-9 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pagamento não concluído</h1>
          <p className="text-sm text-text-secondary mb-6">
            O Mercado Pago não conseguiu processar seu pagamento. Pode ter sido um cartão recusado,
            uma operação cancelada ou um problema temporário. Nenhum valor foi cobrado.
          </p>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--border-default)] text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/premium"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00B8D9] hover:bg-[#007EA7] text-white font-semibold text-sm transition-colors"
            >
              Tentar de novo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
