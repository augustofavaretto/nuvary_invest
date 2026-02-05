'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Chatbot } from '@/components/chat';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  // Verificar autenticacao
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
      <div className="h-[calc(100vh-73px)]">
        <Chatbot />
      </div>
    </DashboardLayout>
  );
}
