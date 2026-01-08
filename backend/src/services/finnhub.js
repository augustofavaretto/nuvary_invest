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

  // === STOCKS - COTAÇÕES ===

  async getQuote(symbol) {
    return this.request('/quote', { symbol });
  }

  async getCandles(symbol, resolution = 'D', from, to) {
    return this.request('/stock/candle', {
      symbol,
      resolution,
      from: from || Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 dias atrás
      to: to || Math.floor(Date.now() / 1000),
    });
  }

  // === PERFIL E DADOS DA EMPRESA ===

  async getCompanyProfile(symbol) {
    return this.request('/stock/profile2', { symbol });
  }

  async getCompanyMetrics(symbol) {
    return this.request('/stock/metric', { symbol, metric: 'all' });
  }

  async getFinancials(symbol, statement = 'bs', freq = 'annual') {
    return this.request('/stock/financials', { symbol, statement, freq });
  }

  // === RECOMENDAÇÕES E ESTIMATIVAS ===

  async getRecommendations(symbol) {
    return this.request('/stock/recommendation', { symbol });
  }

  async getPriceTarget(symbol) {
    return this.request('/stock/price-target', { symbol });
  }

  async getEpsEstimates(symbol) {
    return this.request('/stock/eps-estimate', { symbol });
  }

  async getRevenueEstimates(symbol) {
    return this.request('/stock/revenue-estimate', { symbol });
  }

  // === NOTÍCIAS ===

  async getCompanyNews(symbol, from, to) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.request('/company-news', {
      symbol,
      from: from || thirtyDaysAgo.toISOString().split('T')[0],
      to: to || today.toISOString().split('T')[0],
    });
  }

  async getMarketNews(category = 'general') {
    return this.request('/news', { category });
  }

  async getNewsSentiment(symbol) {
    return this.request('/news-sentiment', { symbol });
  }

  // === INSIDERS E DADOS ALTERNATIVOS ===

  async getInsiderTransactions(symbol) {
    return this.request('/stock/insider-transactions', { symbol });
  }

  async getInsiderSentiment(symbol) {
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    return this.request('/stock/insider-sentiment', {
      symbol,
      from: oneYearAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    });
  }

  async getSocialSentiment(symbol) {
    return this.request('/stock/social-sentiment', { symbol });
  }

  // === FOREX ===

  async getForexRates(base = 'USD') {
    return this.request('/forex/rates', { base });
  }

  async getForexSymbols(exchange = 'oanda') {
    return this.request('/forex/symbol', { exchange });
  }

  async getForexCandles(symbol, resolution = 'D', from, to) {
    return this.request('/forex/candle', {
      symbol,
      resolution,
      from: from || Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      to: to || Math.floor(Date.now() / 1000),
    });
  }

  // === CRYPTO ===

  async getCryptoSymbols(exchange = 'binance') {
    return this.request('/crypto/symbol', { exchange });
  }

  async getCryptoCandles(symbol, resolution = 'D', from, to) {
    return this.request('/crypto/candle', {
      symbol,
      resolution,
      from: from || Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      to: to || Math.floor(Date.now() / 1000),
    });
  }

  // === INDICADORES TÉCNICOS ===

  async getTechnicalIndicator(symbol, resolution = 'D', indicator = 'sma', timeperiod = 14) {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 90 * 24 * 60 * 60; // 90 dias

    return this.request('/indicator', {
      symbol,
      resolution,
      from,
      to,
      indicator,
      timeperiod,
    });
  }

  async getAggregateIndicators(symbol, resolution = 'D') {
    return this.request('/scan/technical-indicator', { symbol, resolution });
  }

  async getSupportResistance(symbol, resolution = 'D') {
    return this.request('/scan/support-resistance', { symbol, resolution });
  }

  // === BUSCA ===

  async searchSymbol(query) {
    return this.request('/search', { q: query });
  }

  async getStockSymbols(exchange = 'US') {
    return this.request('/stock/symbol', { exchange });
  }
}

export const finnhubService = new FinnhubService();
