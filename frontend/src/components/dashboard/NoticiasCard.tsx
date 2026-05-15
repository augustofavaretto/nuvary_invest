'use client';

import { Newspaper, RefreshCw, TrendingUp } from 'lucide-react';

interface NewsItemData {
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
}

interface NoticiasCardProps {
  news: NewsItemData[];
  onRefresh?: () => void;
  loading?: boolean;
  max?: number;
}

// Formata "ha Xh" / "ha Xd" a partir de uma data ISO
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'agora';
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

// Noticias Financeiras — top N noticias com thumbnail cyan, titulo e meta.
// Fiel ao mockup (.news-card + .news-item).
export function NoticiasCard({
  news,
  onRefresh,
  loading = false,
  max = 3,
}: NoticiasCardProps) {
  const items = news.slice(0, max);

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--t1)]">
          <Newspaper className="w-5 h-5 text-[var(--cyan)]" />
          Notícias Financeiras
        </h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="w-9 h-9 grid place-items-center rounded-[var(--r-pill)] text-[var(--t2)] hover:text-[var(--cyan)] hover:bg-[rgba(0,184,217,0.08)] transition-colors disabled:opacity-50"
            aria-label="Atualizar notícias"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Lista */}
      <ul className="space-y-4 flex-1">
        {items.length > 0 ? (
          items.map((n, i) => (
            <li key={`${n.title}-${i}`} className="flex items-start gap-3">
              <span
                className="w-10 h-10 rounded-[var(--r-md)] inline-flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(0,184,217,0.12)', color: 'var(--cyan)' }}
              >
                <TrendingUp className="w-4 h-4" />
              </span>
              <a
                href={n.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 group"
              >
                <div className="text-[13.5px] text-[var(--t1)] group-hover:text-[var(--cyan)] transition-colors line-clamp-2 leading-snug">
                  {n.title}
                </div>
                {(n.source || n.publishedAt) && (
                  <div className="text-[11.5px] text-[var(--t3)] mt-1 flex items-center gap-1.5">
                    {n.source && <span>{n.source}</span>}
                    {n.source && n.publishedAt && <span>•</span>}
                    {n.publishedAt && <span>{timeAgo(n.publishedAt)}</span>}
                  </div>
                )}
              </a>
            </li>
          ))
        ) : (
          <li className="text-sm text-[var(--t2)]">Sem notícias no momento.</li>
        )}
      </ul>
    </div>
  );
}
