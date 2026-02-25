'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, FileText, Download, Calendar, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function ExtratosPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
          <p className="text-[#6B7280]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[#0B1F33] flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#00B8D9]" />
            Extratos
          </h1>
          <p className="text-[#6B7280] mt-1">
            Visualize e exporte seus extratos de movimentações
          </p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center"
        >
          <div className="w-20 h-20 bg-[#00B8D9]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-[#00B8D9]" />
          </div>
          <h2 className="text-xl font-semibold text-[#0B1F33] mb-2">
            Em breve disponível
          </h2>
          <p className="text-[#6B7280] max-w-md mx-auto mb-6">
            Acompanhe todas as suas movimentações financeiras em um só lugar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <Calendar className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Por Período</p>
              <p className="text-xs text-[#6B7280]">Filtre por datas</p>
            </div>
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <Filter className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Por Tipo</p>
              <p className="text-xs text-[#6B7280]">Compras, vendas, dividendos</p>
            </div>
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <Download className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Exportar</p>
              <p className="text-xs text-[#6B7280]">PDF e Excel</p>
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-[#00B8D9] hover:bg-[#007EA7]"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
