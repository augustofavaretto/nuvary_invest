'use client';

import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import type { Alert } from '@/services/alertasService';
import { formatCurrency } from '@/services/portfolioService';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function AlertItem({
  alert,
  onClick,
  onDelete,
}: {
  alert: Alert;
  onClick?: (alert: Alert) => void;
  onDelete?: (id: string) => void;
}) {
  const isUp = alert.direction === 'up';
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const color = isUp ? 'text-emerald-400' : 'text-red-400';
  const bg = isUp ? 'bg-emerald-500/15' : 'bg-red-500/15';

  return (
    <button
      onClick={() => onClick?.(alert)}
      className={`group w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
        alert.read ? 'opacity-70' : ''
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {alert.asset_name}
          </p>
          {!alert.read && (
            <span className="w-2 h-2 rounded-full bg-[#00B8D9] flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className={`font-semibold ${color}`}>
            {isUp ? 'subiu' : 'caiu'} {Math.abs(alert.variation_pct).toFixed(2)}%
          </span>{' '}
          {isUp ? '📈' : '📉'} — Chegou a {formatCurrency(alert.current_price)}
        </p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
          {timeAgo(alert.created_at)}
        </p>
      </div>
      {onDelete && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(alert.id);
          }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center transition-opacity flex-shrink-0"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}
