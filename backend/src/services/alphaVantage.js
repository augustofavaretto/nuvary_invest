import axios from 'axios';
import NodeCache from 'node-cache';
import { config } from '../config/index.js';

const cache = new NodeCache({ stdTTL: config.cache.ttl });

class AlphaVantageService {
  constructor() {
    this.baseUrl = config.alphaVantage.baseUrl;
    this.apiKeys = config.alphaVantage.apiKeys;
    this.currentKeyIndex = 0;
  }

  getApiKey() {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  getCacheKey(params) {
    return JSON.stringify(params);
  }

  async request(params) {
    const cacheKey = this.getCacheKey(params);
    const cached = cache.get(cacheKey);

    if (cached) {
      return { ...cached, fromCache: true };
    }

    const apiKey = this.getApiKey();
    const response = await axios.get(this.baseUrl, {
      params: { ...params, apikey: apiKey },
      timeout: 10000,
    });

    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }

    if (response.data['Note']) {
      throw new Error('Limite de API atingido. Tente novamente mais tarde.');
    }

    cache.set(cacheKey, response.data);
    return response.data;
  }

  // === STOCKS ===

  async getQuote(symbol) {
    return this.request({
      function: 'GLOBAL_QUOTE',
      symbol,
    });
  }

  async getIntraday(symbol, interval = '5min') {
    return this.request({
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      outputsize: 'compact',
    });
  }

  async getDaily(symbol, outputsize = 'compact') {
    return this.request({
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
    });
  }

  async getDailyAdjusted(symbol, outputsize = 'compact') {
    return this.request({
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize,
    });
  }

  async getWeekly(symbol) {
    return this.request({
      function: 'TIME_SERIES_WEEKLY',
      symbol,
    });
  }

  async getMonthly(symbol) {
    return this.request({
      function: 'TIME_SERIES_MONTHLY',
      symbol,
    });
  }

  // === FOREX ===

  async getExchangeRate(fromCurrency, toCurrency) {
    return this.request({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: fromCurrency,
      to_currency: toCurrency,
    });
  }

  async getForexDaily(fromSymbol, toSymbol, outputsize = 'compact') {
    return this.request({
      function: 'FX_DAILY',
      from_symbol: fromSymbol,
      to_symbol: toSymbol,
      outputsize,
    });
  }

  async getForexIntraday(fromSymbol, toSymbol, interval = '5min') {
    return this.request({
      function: 'FX_INTRADAY',
      from_symbol: fromSymbol,
      to_symbol: toSymbol,
      interval,
      outputsize: 'compact',
    });
  }

  // === CRYPTO ===

  async getCryptoExchangeRate(fromCurrency, toCurrency = 'USD') {
    return this.request({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: fromCurrency,
      to_currency: toCurrency,
    });
  }

  async getCryptoDaily(symbol, market = 'USD') {
    return this.request({
      function: 'DIGITAL_CURRENCY_DAILY',
      symbol,
      market,
    });
  }

  async getCryptoWeekly(symbol, market = 'USD') {
    return this.request({
      function: 'DIGITAL_CURRENCY_WEEKLY',
      symbol,
      market,
    });
  }

  // === SEARCH ===

  async searchSymbol(keywords) {
    return this.request({
      function: 'SYMBOL_SEARCH',
      keywords,
    });
  }

  async getMarketStatus() {
    return this.request({
      function: 'MARKET_STATUS',
    });
  }

  // === OVERVIEW ===

  async getCompanyOverview(symbol) {
    return this.request({
      function: 'OVERVIEW',
      symbol,
    });
  }
}

export const alphaVantageService = new AlphaVantageService();
