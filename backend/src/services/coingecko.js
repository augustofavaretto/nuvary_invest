import axios from 'axios';
import NodeCache from 'node-cache';

// CoinGecko — API publica e gratuita, sem chave, cotacao em BRL nativa. Substitui o Alpha Vantage CURRENCY_EXCHANGE_RATE (virou endpoint premium).
const BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache curto para nao estourar o rate limit do CoinGecko (~30 req/min no free).
const cache = new NodeCache({ stdTTL: 60 });

// Ticker interno → id do CoinGecko
const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  XRP: 'ripple',
  DOT: 'polkadot',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
};

export const coingeckoService = {
  isSupported(symbol) {
    return Boolean(COINGECKO_IDS[String(symbol).toUpperCase()]);
  },

  // Retorna { price, currency, change24h } na moeda pedida (BRL por padrao).
  async getCryptoPrice(symbol, currency = 'BRL') {
    const id = COINGECKO_IDS[String(symbol).toUpperCase()];
    if (!id) {
      const err = new Error(`Criptomoeda não suportada: ${symbol}`);
      err.statusCode = 404;
      throw err;
    }
    const vs = String(currency).toLowerCase();
    const cacheKey = `${id}:${vs}`;
    const cached = cache.get(cacheKey);
    if (cached) return { ...cached, fromCache: true };

    const { data } = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids: id,
        vs_currencies: vs,
        include_24hr_change: true,
      },
      timeout: 10000,
    });

    const entry = data?.[id];
    if (!entry || entry[vs] == null) {
      const err = new Error('Cotação não encontrada');
      err.statusCode = 404;
      throw err;
    }

    const result = {
      symbol: String(symbol).toUpperCase(),
      price: entry[vs],
      currency: String(currency).toUpperCase(),
      change24h: entry[`${vs}_24h_change`] ?? null,
      source: 'CoinGecko',
    };
    cache.set(cacheKey, result);
    return result;
  },
};
