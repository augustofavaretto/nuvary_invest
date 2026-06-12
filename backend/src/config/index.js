import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

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
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  brapi: {
    baseUrl: process.env.BRAPI_BASE_URL || 'https://brapi.dev/api',
    // Aceita os dois nomes de env (BRAPI_API_TOKEN canonico; BRAPI_TOKEN legado)
    token: process.env.BRAPI_API_TOKEN || process.env.BRAPI_TOKEN,
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300,
  },

  // Mercado Pago (plano Premium)
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    // URLs para redirect apos pagamento (frontend)
    successUrl: process.env.MERCADOPAGO_SUCCESS_URL || 'https://nuvary-invest.vercel.app/premium/sucesso',
    failureUrl: process.env.MERCADOPAGO_FAILURE_URL || 'https://nuvary-invest.vercel.app/premium/erro',
    pendingUrl: process.env.MERCADOPAGO_PENDING_URL || 'https://nuvary-invest.vercel.app/premium/pendente',
  },

  // Supabase (service-role) — usado pelo webhook do MP para atualizar profiles
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
};
