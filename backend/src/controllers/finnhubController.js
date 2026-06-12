import { finnhubService } from '../services/finnhub.js';

export const finnhubController = {
  async getQuote(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getQuote(symbol);

      if (!data.c) {
        return res.status(404).json({ error: 'Símbolo não encontrado' });
      }

      res.json({
        symbol,
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        highPrice: data.h,
        lowPrice: data.l,
        openPrice: data.o,
        previousClose: data.pc,
        timestamp: data.t,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCandles(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D', from, to } = req.query;
      const data = await finnhubService.getCandles(symbol, resolution, from, to);

      if (data.s === 'no_data') {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const candles = data.t.map((timestamp, i) => ({
        timestamp,
        date: new Date(timestamp * 1000).toISOString(),
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));

      res.json({
        symbol,
        resolution,
        data: candles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMarketNews(req, res, next) {
    try {
      const { category = 'general' } = req.query;
      const data = await finnhubService.getMarketNews(category);

      if (!Array.isArray(data)) {
        return res.status(404).json({ error: 'Notícias não encontradas' });
      }

      const news = data.slice(0, 20).map((article) => ({
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        image: article.image,
        datetime: new Date(article.datetime * 1000).toISOString(),
        category: article.category,
      }));

      res.json({
        category,
        count: news.length,
        news,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
