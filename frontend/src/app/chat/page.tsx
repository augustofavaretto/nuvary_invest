'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Chatbot } from '@/components/chat';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Loading state
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
      {/* Altura fixa = viewport - topbar (80px). overflow-hidden garante que
          o scroll fique no chat-stream interno, nao na pagina inteira. */}
      <div
        className="overflow-hidden"
        style={{ height: 'calc(100vh - var(--topbar-h, 80px))' }}
      >
        {/* Suspense boundary necessario porque o Chatbot usa useSearchParams
            (para preencher o input quando vem de /dashboard com ?q=...) */}
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
