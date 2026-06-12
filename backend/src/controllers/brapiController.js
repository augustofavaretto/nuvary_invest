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
  // Só anexa o token se ele existir — evita mandar "token=undefined", que o Brapi rejeita com INVALID_TOKEN (afeta FIIs, que exigem token válido).
  let url = `${BRAPI_URL}${endpoint}`;
  if (BRAPI_TOKEN) {
    url += `${endpoint.includes('?') ? '&' : '?'}token=${BRAPI_TOKEN}`;
  }
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
