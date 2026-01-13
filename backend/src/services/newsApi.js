import axios from 'axios';
import NodeCache from 'node-cache';
import { config } from '../config/index.js';

const cache = new NodeCache({ stdTTL: config.cache.ttl });

class NewsApiService {
  constructor() {
    this.baseUrl = config.newsApi.baseUrl;
    this.apiKeys = config.newsApi.apiKeys;
    this.currentKeyIndex = 0;
  }

  getApiKey() {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  getCacheKey(endpoint, params) {
    return `newsapi:${endpoint}:${JSON.stringify(params)}`;
  }

  async request(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = cache.get(cacheKey);

    if (cached) {
      return { ...cached, fromCache: true };
    }

    const apiKey = this.getApiKey();
    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      params: { ...params, apiKey },
      timeout: 10000,
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Erro na News API');
    }

    cache.set(cacheKey, response.data);
    return response.data;
  }

  // === TOP HEADLINES ===

  async getTopHeadlines(options = {}) {
    const {
      country = 'us',
      category,
      sources,
      q,
      pageSize = 20,
      page = 1,
    } = options;

    const params = { pageSize, page };

    if (sources) {
      params.sources = sources;
    } else {
      if (country) params.country = country;
      if (category) params.category = category;
    }

    if (q) params.q = q;

    return this.request('/top-headlines', params);
  }

  async getTopHeadlinesByCountry(country = 'us', pageSize = 20) {
    return this.getTopHeadlines({ country, pageSize });
  }

  async getTopHeadlinesByCategory(category, country = 'us', pageSize = 20) {
    return this.getTopHeadlines({ category, country, pageSize });
  }

  async getTopHeadlinesBySource(sources, pageSize = 20) {
    return this.getTopHeadlines({ sources, pageSize });
  }

  // === EVERYTHING ===

  async searchNews(options = {}) {
    const {
      q,
      sources,
      domains,
      from,
      to,
      language = 'en',
      sortBy = 'publishedAt',
      pageSize = 20,
      page = 1,
    } = options;

    const params = { pageSize, page, sortBy };

    if (q) params.q = q;
    if (sources) params.sources = sources;
    if (domains) params.domains = domains;
    if (from) params.from = from;
    if (to) params.to = to;
    if (language) params.language = language;

    return this.request('/everything', params);
  }

  async searchByKeyword(keyword, options = {}) {
    return this.searchNews({ q: keyword, ...options });
  }

  async searchByDomain(domains, options = {}) {
    return this.searchNews({ domains, ...options });
  }

  // === SOURCES ===

  async getSources(options = {}) {
    const { category, language, country } = options;
    const params = {};

    if (category) params.category = category;
    if (language) params.language = language;
    if (country) params.country = country;

    return this.request('/top-headlines/sources', params);
  }

  // === BUSINESS NEWS (Atalho para notícias financeiras) ===

  async getBusinessNews(country = 'us', pageSize = 20) {
    return this.getTopHeadlinesByCategory('business', country, pageSize);
  }

  async getTechNews(country = 'us', pageSize = 20) {
    return this.getTopHeadlinesByCategory('technology', country, pageSize);
  }
}

export const newsApiService = new NewsApiService();
