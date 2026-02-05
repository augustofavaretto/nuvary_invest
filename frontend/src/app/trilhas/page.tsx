'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap, BookOpen, Video, Award } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function TrilhasPage() {
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
            <GraduationCap className="w-7 h-7 text-[#00B8D9]" />
            Trilhas Educativas
          </h1>
          <p className="text-[#6B7280] mt-1">
            Aprenda sobre investimentos de forma pratica e personalizada
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
            <GraduationCap className="w-10 h-10 text-[#00B8D9]" />
          </div>
          <h2 className="text-xl font-semibold text-[#0B1F33] mb-2">
            Em breve disponivel
          </h2>
          <p className="text-[#6B7280] max-w-md mx-auto mb-6">
            Trilhas de aprendizado personalizadas para seu nivel de conhecimento e perfil de investidor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <BookOpen className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Cursos</p>
              <p className="text-xs text-[#6B7280]">Do basico ao avancado</p>
            </div>
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <Video className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Videos</p>
              <p className="text-xs text-[#6B7280]">Aulas em video</p>
            </div>
            <div className="bg-[#F3F4F6] rounded-lg p-4">
              <Award className="w-6 h-6 text-[#00B8D9] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0B1F33]">Certificados</p>
              <p className="text-xs text-[#6B7280]">Comprove seu conhecimento</p>
            </div>
          </div>

          {/* Preview Trilhas */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-left border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Iniciante</span>
              </div>
              <h3 className="font-semibold text-[#0B1F33]">Primeiros Passos</h3>
              <p className="text-sm text-[#6B7280] mt-1">Conceitos basicos de investimentos</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-left border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Intermediario</span>
              </div>
              <h3 className="font-semibold text-[#0B1F33]">Renda Variavel</h3>
              <p className="text-sm text-[#6B7280] mt-1">Acoes, FIIs e ETFs</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 text-left border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Avancado</span>
              </div>
              <h3 className="font-semibold text-[#0B1F33]">Analise Tecnica</h3>
              <p className="text-sm text-[#6B7280] mt-1">Graficos e indicadores</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-left border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Especial</span>
              </div>
              <h3 className="font-semibold text-[#0B1F33]">Mercado Internacional</h3>
              <p className="text-sm text-[#6B7280] mt-1">Investindo no exterior</p>
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
