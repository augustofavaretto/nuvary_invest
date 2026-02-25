const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface MarketQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: number;
}

export interface StockProfile {
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  industry: string;
  logo: string;
  weburl: string;
  marketCap: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: { name: string };
  url: string;
  publishedAt: string;
  urlToImage?: string;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo?: string;
}

// Símbolos de mercado - índices e big techs americanas (suportadas pelas APIs)
const MARKET_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

// Ações populares americanas para watchlist (APIs gratuitas não suportam B3)
const WATCHLIST_SYMBOLS = ['META', 'NVDA', 'NFLX', 'JPM', 'V', 'DIS'];

// Nomes das empresas
const STOCK_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet (Google)',
  AMZN: 'Amazon',
  TSLA: 'Tesla',
  META: 'Meta (Facebook)',
  NVDA: 'NVIDIA',
  NFLX: 'Netflix',
  JPM: 'JPMorgan Chase',
  V: 'Visa Inc.',
  DIS: 'Walt Disney',
};

// Helper para delay entre requests (evitar rate limit)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  // Buscar cotações de mercado (índices principais)
  async getMarketOverview(): Promise<MarketQuote[]> {
    const quotes: MarketQuote[] = [];

    for (const symbol of MARKET_SYMBOLS) {
      try {
        const res = await fetch(`${API_URL}/finnhub/stocks/${symbol}/quote`);
        if (res.ok) {
          const data = await res.json();
          quotes.push({
            symbol,
            name: STOCK_NAMES[symbol] || symbol,
            currentPrice: data.currentPrice || data.c || 0,
            change: data.change || data.d || 0,
            changePercent: data.changePercent || data.dp || 0,
            highPrice: data.highPrice || data.h || 0,
            lowPrice: data.lowPrice || data.l || 0,
            openPrice: data.openPrice || data.o || 0,
            previousClose: data.previousClose || data.pc || 0,
            timestamp: data.timestamp || data.t || Date.now(),
          });
        } else {
          quotes.push({
            symbol,
            name: STOCK_NAMES[symbol] || symbol,
            currentPrice: 0,
            change: 0,
            changePercent: 0,
            highPrice: 0,
            lowPrice: 0,
            openPrice: 0,
            previousClose: 0,
            timestamp: Date.now(),
          });
        }
        // Pequeno delay para evitar rate limit
        await delay(100);
      } catch {
        quotes.push({
          symbol,
          name: STOCK_NAMES[symbol] || symbol,
          currentPrice: 0,
          change: 0,
          changePercent: 0,
          highPrice: 0,
          lowPrice: 0,
          openPrice: 0,
          previousClose: 0,
          timestamp: Date.now(),
        });
      }
    }

    return quotes;
  },

  // Buscar lista de ações populares com cotações
  async getWatchlist(): Promise<WatchlistStock[]> {
    const stocks: WatchlistStock[] = [];

    for (const symbol of WATCHLIST_SYMBOLS) {
      try {
        const res = await fetch(`${API_URL}/finnhub/stocks/${symbol}/quote`);
        if (res.ok) {
          const data = await res.json();
          stocks.push({
            symbol,
            name: STOCK_NAMES[symbol] || symbol,
            price: data.currentPrice || data.c || 0,
            change: data.change || data.d || 0,
            changePercent: data.changePercent || data.dp || 0,
          });
        } else {
          stocks.push({
            symbol,
            name: STOCK_NAMES[symbol] || symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          });
        }
        // Pequeno delay para evitar rate limit
        await delay(100);
      } catch {
        stocks.push({
          symbol,
          name: STOCK_NAMES[symbol] || symbol,
          price: 0,
          change: 0,
          changePercent: 0,
        });
      }
    }

    return stocks;
  },

  // Buscar notícias financeiras
  async getFinancialNews(limit = 6): Promise<NewsItem[]> {
    try {
      // Tentar News API primeiro
      const res = await fetch(`${API_URL}/news/business?pageSize=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length > 0) {
          return data.articles;
        }
      }

      // Fallback para Finnhub news
      const finnhubRes = await fetch(`${API_URL}/finnhub/news/market?category=general`);
      if (finnhubRes.ok) {
        const finnhubData = await finnhubRes.json();
        return (finnhubData.slice?.(0, limit) || []).map((item: Record<string, unknown>) => ({
          id: String(item.id || Math.random()),
          title: item.headline || item.title || '',
          description: item.summary || item.description || '',
          source: { name: String(item.source || 'Finnhub') },
          url: String(item.url || ''),
          publishedAt: item.datetime
            ? new Date(Number(item.datetime) * 1000).toISOString()
            : new Date().toISOString(),
          urlToImage: item.image ? String(item.image) : undefined,
        }));
      }

      return [];
    } catch {
      return [];
    }
  },

  // Buscar sugestões da IA baseado no perfil
  async getAISuggestions(perfilRisco: string): Promise<string> {
    try {
      const res = await fetch(`${API_URL}/ai/suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType: perfilRisco,
          message: `Você é um consultor financeiro. Forneça 3 dicas curtas e práticas de investimento para um investidor com perfil ${perfilRisco}. Seja direto e objetivo. Responda em português brasileiro.`,
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data.content || data.response || 'Não foi possível gerar sugestões no momento.';
    } catch {
      return 'Não foi possível gerar sugestões no momento. Tente novamente mais tarde.';
    }
  },

  // Buscar dados de candles para gráficos
  async getStockCandles(symbol: string, resolution = 'D'): Promise<unknown> {
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 dias atrás
      const res = await fetch(
        `${API_URL}/finnhub/stocks/${symbol}/candles?resolution=${resolution}&from=${from}&to=${to}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch {
      return null;
    }
  },
};
