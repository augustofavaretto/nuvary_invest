import axios from 'axios';
import NodeCache from 'node-cache';
import { config } from '../config/index.js';

const cache = new NodeCache({ stdTTL: config.cache.ttl });

class FinnhubService {
  constructor() {
    this.baseUrl = config.finnhub.baseUrl;
    this.apiKey = config.finnhub.apiKey;
  }

  getCacheKey(endpoint, params) {
    return `finnhub:${endpoint}:${JSON.stringify(params)}`;
  }

  async request(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = cache.get(cacheKey);

    if (cached) {
      return { ...cached, fromCache: true };
    }

    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      params: { ...params, token: this.apiKey },
      timeout: 10000,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    cache.set(cacheKey, response.data);
    return response.data;
  }

  async getQuote(symbol) {
    return this.request('/quote', { symbol });
  }

  async getCandles(symbol, resolution = 'D', from, to) {
    return this.request('/stock/candle', {
      symbol,
      resolution,
      from: from || Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      to: to || Math.floor(Date.now() / 1000),
    });
  }

  async getMarketNews(category = 'general') {
    return this.request('/news', { category });
  }
}

export const finnhubService = new FinnhubService();
