'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { Alert, NEW_ALERT_EVENT } from '@/services/alertasService';
import { formatCurrency } from '@/services/portfolioService';

const TOAST_TTL = 8000;

export function AlertToastContainer() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Alert[]>([]);

  useEffect(() => {
    const onNew = (e: Event) => {
      const alert = (e as CustomEvent<Alert>).detail;
      if (!alert) return;
      setToasts((prev) => [...prev, alert]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== alert.id));
      }, TOAST_TTL);
    };
    window.addEventListener(NEW_ALERT_EVENT, onNew);
    return () => window.removeEventListener(NEW_ALERT_EVENT, onNew);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((alert) => {
          const isUp = alert.direction === 'up';
          const Icon = isUp ? ArrowUpRight : ArrowDownRight;
          const color = isUp ? 'text-emerald-400' : 'text-red-400';
          const bg = isUp ? 'bg-emerald-500/15' : 'bg-red-500/15';
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-[#0B1F33] border border-white/10 rounded-xl shadow-2xl px-4 py-3 w-[340px] max-w-[calc(100vw-3rem)] cursor-pointer"
              onClick={() => { dismiss(alert.id); router.push('/carteira'); }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {alert.asset_name}{' '}
                    <span className={color}>
                      {isUp ? 'subiu' : 'caiu'} {Math.abs(alert.variation_pct).toFixed(2)}%
                    </span>{' '}
                    {isUp ? '📈' : '📉'}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">
                    Chegou a {formatCurrency(alert.current_price)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                  className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
