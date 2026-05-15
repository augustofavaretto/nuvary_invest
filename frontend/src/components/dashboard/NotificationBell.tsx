'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '@/lib/supabase';
import {
  Alert,
  NEW_ALERT_EVENT,
  countUnread,
  deleteAlert,
  listAlerts,
  markAllAsRead,
  markAsRead,
} from '@/services/alertasService';
import { refreshAllPrices } from '@/services/portfolioService';
import { AlertItem } from './AlertItem';

// Periodicidade do check global de variacao (5 min). O refreshAllPrices ja
// tem cache interno de 15min, mas chamamos com force=true neste fluxo para
// garantir que a verificacao acontece independente da pagina aberta.
const GLOBAL_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    const [list, count] = await Promise.all([listAlerts(20), countUnread()]);
    setAlerts(list);
    setUnread(count);
  }, []);

  // Dispara refreshAllPrices que internamente chama checkAlertsForAssets.
  // Cache de 15min ja protege contra chamadas demais. Roda em paralelo
  // com a UI; falhas sao toleradas em silencio.
  const verificarVariacoes = useCallback(async (force = false) => {
    try {
      await refreshAllPrices(force);
      // Apos refresh, recarrega a lista local (o realtime tambem dispara,
      // mas garantimos atualizacao mesmo se o Realtime estiver desligado)
      await refresh();
    } catch (e) {
      console.error('[NotificationBell] falha ao verificar variacoes:', e);
    }
  }, [refresh]);

  const handleManualCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await verificarVariacoes(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    refresh();
    // Verificacao global na montagem (respeita cache de 15min)
    verificarVariacoes(false);

    // Atualiza ao receber evento custom (alertas criados via refreshAllPrices)
    const onNew = () => { refresh(); };
    window.addEventListener(NEW_ALERT_EVENT, onNew);

    // Subscricao Realtime do Supabase
    const channel = supabase
      .channel('alertas-variacao-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alertas_variacao',
        },
        () => { refresh(); },
      )
      .subscribe();

    // Polling de alertas (cheap, so consulta o banco)
    const pollAlerts = setInterval(() => { refresh(); }, 30_000);

    // Check global de variacoes — 5 min, respeitando cache interno de 15min
    const pollCheck = setInterval(() => {
      verificarVariacoes(false);
    }, GLOBAL_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener(NEW_ALERT_EVENT, onNew);
      supabase.removeChannel(channel);
      clearInterval(pollAlerts);
      clearInterval(pollCheck);
    };
  }, [refresh, verificarVariacoes]);

  // Refresh ao abrir o dropdown (caso outro tab tenha marcado como lido)
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleItemClick = async (alert: Alert) => {
    if (!alert.read) {
      await markAsRead(alert.id);
      setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, read: true } : a));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    router.push('/carteira');
  };

  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    refresh();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-card rounded-xl shadow-xl border border-border z-40 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Alertas de variação</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {unread > 0 ? `${unread} não lido${unread > 1 ? 's' : ''}` : 'Tudo em dia'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleManualCheck}
                    disabled={checking}
                    className="flex items-center gap-1 text-xs text-[#00B8D9] hover:text-[#007EA7] font-medium px-2 py-1 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                    title="Verificar variações agora"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Verificando' : 'Verificar'}
                  </button>
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAll}
                      className="flex items-center gap-1 text-xs text-[#00B8D9] hover:text-[#007EA7] font-medium px-2 py-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Marcar todas
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum alerta por enquanto
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Você será avisado quando um ativo variar mais de 5%
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {alerts.map((a) => (
                      <AlertItem
                        key={a.id}
                        alert={a}
                        onClick={handleItemClick}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {alerts.length > 0 && (
                <div className="border-t border-border">
                  <button
                    onClick={() => { setOpen(false); router.push('/carteira'); }}
                    className="w-full px-4 py-2.5 text-xs font-medium text-[#00B8D9] hover:bg-muted transition-colors"
                  >
                    Ver carteira
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
