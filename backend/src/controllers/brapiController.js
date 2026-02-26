import { config } from '../config/index.js';

const BRAPI_URL = config.brapi.baseUrl;
const BRAPI_TOKEN = config.brapi.token;

// Cache simples em memória
const cache = new Map();
const CACHE_TTL = (config.cache.ttl || 300) * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function brapiGet(endpoint) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BRAPI_URL}${endpoint}${separator}token=${BRAPI_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Brapi error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const brapiController = {
  // GET /api/brapi/quote/:tickers - Cotação de ações/FIIs da B3
  async getQuote(req, res, next) {
    try {
      const { tickers } = req.params;
      const cacheKey = `quote_${tickers}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      const data = await brapiGet(`/quote/${tickers}`);

      if (data.results && data.results.length > 0) {
        const result = {
          results: data.results.map(stock => ({
            symbol: stock.symbol,
            shortName: stock.shortName,
            longName: stock.longName,
            currency: stock.currency,
            currentPrice: stock.regularMarketPrice,
            change: stock.regularMarketChange,
            changePercent: stock.regularMarketChangePercent,
            dayHigh: stock.regularMarketDayHigh,
            dayLow: stock.regularMarketDayLow,
            open: stock.regularMarketOpen,
            previousClose: stock.regularMarketPreviousClose,
            volume: stock.regularMarketVolume,
            marketCap: stock.marketCap,
            fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
            priceEarnings: stock.priceEarnings,
            earningsPerShare: stock.earningsPerShare,
            logoUrl: stock.logourl,
            updatedAt: stock.regularMarketTime,
          })),
        };

        setCache(cacheKey, result);
        return res.json(result);
      }

      res.status(404).json({ error: 'Ativo não encontrado' });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/brapi/quote/list - Lista de todas as ações disponíveis
  async listStocks(req, res, next) {
    try {
      const { search, sortBy, sortOrder, limit } = req.query;
      const cacheKey = `list_${search || ''}_${sortBy || ''}_${sortOrder || ''}_${limit || ''}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/quote/list?';
      if (search) endpoint += `search=${search}&`;
      if (sortBy) endpoint += `sortBy=${sortBy}&`;
      if (sortOrder) endpoint += `sortOrder=${sortOrder}&`;
      if (limit) endpoint += `limit=${limit}&`;

      const data = await brapiGet(endpoint);
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/brapi/crypto - Cotação de criptomoedas
  async getCrypto(req, res, next) {
    try {
      const { coin, currency } = req.query;
      const cacheKey = `crypto_${coin || 'all'}_${currency || 'BRL'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/v2/crypto?';
      if (coin) endpoint += `coin=${coin}&`;
      if (currency) endpoint += `currency=${currency}&`;

      const data = await brapiGet(endpoint);
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/brapi/currency - Cotações de moedas
  async getCurrency(req, res, next) {
    try {
      const { currencies } = req.query;
      const cacheKey = `currency_${currencies || 'USD-BRL'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/v2/currency?';
      if (currencies) endpoint += `currency=${currencies}&`;

      const data = await brapiGet(endpoint);
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/brapi/inflation - Dados de inflação
  async getInflation(req, res, next) {
    try {
      const cacheKey = 'inflation';
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      const data = await brapiGet('/v2/inflation');
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/brapi/selic - Taxa Selic
  async getSelic(req, res, next) {
    try {
      const cacheKey = 'selic';
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      const data = await brapiGet('/v2/prime-rate');
      setCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
