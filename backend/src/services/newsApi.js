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

  // Rotaciona entre as chaves configuradas para diluir o rate limit
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

  async getBusinessNews(country = 'us', pageSize = 20) {
    return this.request('/top-headlines', { country, category: 'business', pageSize });
  }
}

export const newsApiService = new NewsApiService();
