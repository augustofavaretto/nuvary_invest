import { finnhubService } from '../services/finnhub.js';

export const finnhubController = {
  // === COTAÇÕES ===

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

  // === PERFIL DA EMPRESA ===

  async getCompanyProfile(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getCompanyProfile(symbol);

      if (!data.name) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      res.json({
        symbol: data.ticker,
        name: data.name,
        country: data.country,
        currency: data.currency,
        exchange: data.exchange,
        ipo: data.ipo,
        marketCap: data.marketCapitalization,
        industry: data.finnhubIndustry,
        logo: data.logo,
        phone: data.phone,
        weburl: data.weburl,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompanyMetrics(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getCompanyMetrics(symbol);

      if (!data.metric) {
        return res.status(404).json({ error: 'Métricas não encontradas' });
      }

      const m = data.metric;
      res.json({
        symbol: data.symbol,
        metrics: {
          peRatio: m.peBasicExclExtraTTM,
          pbRatio: m.pbAnnual,
          psRatio: m.psTTM,
          dividendYield: m.dividendYieldIndicatedAnnual,
          eps: m.epsBasicExclExtraItemsTTM,
          beta: m.beta,
          marketCap: m.marketCapitalization,
          week52High: m['52WeekHigh'],
          week52Low: m['52WeekLow'],
          week52HighDate: m['52WeekHighDate'],
          week52LowDate: m['52WeekLowDate'],
          avgVolume10Day: m['10DayAverageTradingVolume'],
          avgVolume3Month: m['3MonthAverageTradingVolume'],
          revenuePerShare: m.revenuePerShareTTM,
          roe: m.roeTTM,
          roa: m.roaTTM,
        },
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === RECOMENDAÇÕES ===

  async getRecommendations(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getRecommendations(symbol);

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(404).json({ error: 'Recomendações não encontradas' });
      }

      const recommendations = data.map((rec) => ({
        period: rec.period,
        strongBuy: rec.strongBuy,
        buy: rec.buy,
        hold: rec.hold,
        sell: rec.sell,
        strongSell: rec.strongSell,
      }));

      res.json({
        symbol,
        recommendations,
        latest: recommendations[0],
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPriceTarget(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getPriceTarget(symbol);

      if (!data.targetHigh) {
        return res.status(404).json({ error: 'Preço-alvo não encontrado' });
      }

      res.json({
        symbol: data.symbol,
        targetHigh: data.targetHigh,
        targetLow: data.targetLow,
        targetMean: data.targetMean,
        targetMedian: data.targetMedian,
        lastUpdated: data.lastUpdated,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === NOTÍCIAS ===

  async getCompanyNews(req, res, next) {
    try {
      const { symbol } = req.params;
      const { from, to } = req.query;
      const data = await finnhubService.getCompanyNews(symbol, from, to);

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
        related: article.related,
      }));

      res.json({
        symbol,
        count: news.length,
        news,
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

  async getNewsSentiment(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getNewsSentiment(symbol);

      res.json({
        symbol,
        buzz: data.buzz,
        sentiment: data.sentiment,
        companyNewsScore: data.companyNewsScore,
        sectorAverageBullishPercent: data.sectorAverageBullishPercent,
        sectorAverageNewsScore: data.sectorAverageNewsScore,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === INSIDERS ===

  async getInsiderTransactions(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await finnhubService.getInsiderTransactions(symbol);

      if (!data.data || data.data.length === 0) {
        return res.status(404).json({ error: 'Transações não encontradas' });
      }

      const transactions = data.data.slice(0, 20).map((t) => ({
        name: t.name,
        share: t.share,
        change: t.change,
        transactionDate: t.transactionDate,
        transactionCode: t.transactionCode,
        transactionPrice: t.transactionPrice,
        filingDate: t.filingDate,
      }));

      res.json({
        symbol: data.symbol,
        transactions,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === INDICADORES TÉCNICOS ===

  async getTechnicalIndicator(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D', indicator = 'sma', timeperiod = 14 } = req.query;
      const data = await finnhubService.getTechnicalIndicator(symbol, resolution, indicator, parseInt(timeperiod));

      if (data.s === 'no_data') {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      res.json({
        symbol,
        indicator,
        resolution,
        timeperiod: parseInt(timeperiod),
        data: data,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAggregateIndicators(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D' } = req.query;
      const data = await finnhubService.getAggregateIndicators(symbol, resolution);

      res.json({
        symbol,
        resolution,
        technicalAnalysis: data.technicalAnalysis,
        trend: data.trend,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSupportResistance(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D' } = req.query;
      const data = await finnhubService.getSupportResistance(symbol, resolution);

      res.json({
        symbol,
        resolution,
        levels: data.levels || [],
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === FOREX ===

  async getForexRates(req, res, next) {
    try {
      const { base = 'USD' } = req.query;
      const data = await finnhubService.getForexRates(base);

      res.json({
        base: data.base,
        rates: data.quote,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getForexCandles(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D', from, to } = req.query;
      const data = await finnhubService.getForexCandles(symbol, resolution, from, to);

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

  // === CRYPTO ===

  async getCryptoCandles(req, res, next) {
    try {
      const { symbol } = req.params;
      const { resolution = 'D', from, to } = req.query;
      const data = await finnhubService.getCryptoCandles(symbol, resolution, from, to);

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

  // === BUSCA ===

  async searchSymbol(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.length < 1) {
        return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
      }

      const data = await finnhubService.searchSymbol(q);

      res.json({
        query: q,
        count: data.count,
        results: data.result || [],
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
