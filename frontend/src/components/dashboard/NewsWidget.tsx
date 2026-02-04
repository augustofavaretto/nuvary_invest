'use client';

import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewsItem } from '@/services/dashboardService';

interface NewsWidgetProps {
  news: NewsItem[];
  onRefresh: () => void;
  loading?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  return `${diffDays}d atras`;
}

export function NewsWidget({ news, onRefresh, loading }: NewsWidgetProps) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#0B1F33] flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#00B8D9]" />
          Noticias Financeiras
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-[#6B7280] hover:text-[#00B8D9]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {news.map((item, index) => (
            <a
              key={item.url || index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex gap-3">
                {item.urlToImage && (
                  <img
                    src={item.urlToImage}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0B1F33] text-sm line-clamp-2 group-hover:text-[#00B8D9] transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#6B7280] truncate">
                      {item.source?.name || 'Fonte desconhecida'}
                    </span>
                    <span className="text-xs text-[#6B7280]">•</span>
                    <span className="text-xs text-[#6B7280]">
                      {formatTimeAgo(item.publishedAt)}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        {news.length === 0 && (
          <p className="text-center text-[#6B7280] py-4">
            Nao foi possivel carregar noticias.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
