'use client';

import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WatchlistStock } from '@/services/dashboardService';
import { STRINGS } from '@/constants/strings';

interface StockListProps {
  stocks: WatchlistStock[];
}

export function StockList({ stocks }: StockListProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00B8D9]" />
          {STRINGS.dashboard.acoesPopulares}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B8D9] to-[#007EA7] flex items-center justify-center text-white font-bold text-sm">
                    {stock.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{stock.symbol.replace('.SA', '')}</p>
                    <p className="text-xs text-[#6B7280]">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    $ {stock.price?.toFixed(2) || '—'}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 text-sm ${
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
                      {stock.changePercent?.toFixed(2) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {stocks.length === 0 && (
          <p className="text-center text-[#6B7280] py-4">
            {STRINGS.dashboard.naoFoiPossivelCarregarAcoes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
