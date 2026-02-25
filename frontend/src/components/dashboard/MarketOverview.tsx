'use client';

import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketQuote } from '@/services/dashboardService';
import { STRINGS } from '@/constants/strings';

interface MarketOverviewProps {
  data: MarketQuote[];
  onRefresh: () => void;
  loading?: boolean;
}

const symbolNames: Record<string, string> = {
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  GOOGL: 'Google',
  AMZN: 'Amazon',
  TSLA: 'Tesla',
  '^GSPC': 'S&P 500',
  '^DJI': 'Dow Jones',
  '^IXIC': 'Nasdaq',
};

export function MarketOverview({ data, onRefresh, loading }: MarketOverviewProps) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#0B1F33] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00B8D9]" />
          Mercado em Tempo Real
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {data.map((quote) => {
            const isPositive = quote.change >= 0;
            return (
              <div
                key={quote.symbol}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-xs text-[#6B7280] truncate">
                  {symbolNames[quote.symbol] || quote.symbol}
                </p>
                <p className="text-lg font-bold text-[#0B1F33]">
                  ${quote.currentPrice?.toFixed(2) || '—'}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {quote.changePercent?.toFixed(2) || 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {data.length === 0 && (
          <p className="text-center text-[#6B7280] py-4">
            {STRINGS.dashboard.naoFoiPossivelCarregarDados}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
