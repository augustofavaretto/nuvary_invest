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

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300,
  },
};
