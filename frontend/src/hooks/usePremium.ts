'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSubscriptionState,
  isPremiumActive,
  type SubscriptionState,
} from '@/services/premiumService';

export interface UsePremiumResult {
  isPremium: boolean;
  state: SubscriptionState;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_STATE: SubscriptionState = {
  status: 'free',
  plan: null,
  paymentMethod: null,
  expiresAt: null,
  startedAt: null,
};

// Hook central para gates de feature Premium.
// Use em qualquer componente para decidir mostrar/esconder/desabilitar
// algo conforme o status da assinatura.
//
// Exemplo:
//   const { isPremium, loading } = usePremium();
//   if (loading) return <Skeleton />;
//   if (!isPremium) return <PremiumGate feature="alertas" />;
//   return <Alertas />;
export function usePremium(): UsePremiumResult {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!isAuthenticated) {
      setState(DEFAULT_STATE);
      setLoading(false);
      return;
    }
    try {
      const next = await getSubscriptionState();
      setState(next);
    } catch (err) {
      console.error('[usePremium] erro:', err);
      setState(DEFAULT_STATE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    isPremium: isPremiumActive(state),
    state,
    loading,
    refresh,
  };
}
