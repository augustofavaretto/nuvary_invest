import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  alphaVantage: {
    baseUrl: process.env.ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query',
    apiKeys: [
      process.env.ALPHA_VANTAGE_API_KEY_1,
      process.env.ALPHA_VANTAGE_API_KEY_2,
    ].filter(Boolean),
  },

  finnhub: {
    baseUrl: process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
    apiKey: process.env.FINNHUB_API_KEY,
  },

  newsApi: {
    baseUrl: process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2',
    apiKeys: [
      process.env.NEWS_API_KEY_1,
      process.env.NEWS_API_KEY_2,
    ].filter(Boolean),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300,
  },

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'nuvary-invest-jwt-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'nuvary-invest-refresh-secret-change-in-production',
};
