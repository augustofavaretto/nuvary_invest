import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import stockRoutes from './routes/stocks.js';
import forexRoutes from './routes/forex.js';
import cryptoRoutes from './routes/crypto.js';
import searchRoutes from './routes/search.js';
import finnhubRoutes from './routes/finnhub.js';
import newsRoutes from './routes/news.js';
import aiRoutes from './routes/ai.js';
import riskProfileRoutes from './routes/riskProfile.js';
import brapiRoutes from './routes/brapi.js';
import anbimaRoutes from './routes/anbima.js';
import tesouroDiretoRoutes from './routes/tesouroDireto.js';
import bcbRoutes from './routes/bcb.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Trust Railway reverse proxy (fix para express-rate-limit com X-Forwarded-For)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes - Alpha Vantage
app.use('/api/stocks', stockRoutes);
app.use('/api/forex', forexRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/search', searchRoutes);

// Routes - Finnhub
app.use('/api/finnhub', finnhubRoutes);

// Routes - News API
app.use('/api/news', newsRoutes);

// Routes - OpenAI
app.use('/api/ai', aiRoutes);

// Routes - Risk Profile
app.use('/api/profile', riskProfileRoutes);

// Routes - Brapi (B3, Crypto, Moedas, Inflação, Selic)
app.use('/api/brapi', brapiRoutes);

// Routes - ANBIMA (Títulos Públicos, Renda Fixa, CRI/CRA)
app.use('/api/anbima', anbimaRoutes);

// Routes - Tesouro Direto (Taxas e PUs dos títulos públicos)
app.use('/api/tesouro', tesouroDiretoRoutes);

// Routes - BCB (SGS: Selic, CDI, IPCA, IGP-M + OLINDA Focus)
app.use('/api/bcb', bcbRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apis: {
      alphaVantage: config.alphaVantage.apiKeys.length > 0,
      finnhub: !!config.finnhub.apiKey,
      brapi: !!config.brapi.token,
      anbima: !!config.anbima.clientId,
      newsApi: config.newsApi.apiKeys.length > 0,
      openai: !!config.openai.apiKey,
    },
    modules: {
      riskProfile: true,
    },
  });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Nuvary Invest Backend rodando na porta ${config.port}`);
  console.log(`📊 Alpha Vantage Keys: ${config.alphaVantage.apiKeys.length}`);
  console.log(`📈 Finnhub Key: ${config.finnhub.apiKey ? 'Configurada' : 'Não configurada'}`);
  console.log(`🇧🇷 Brapi Token: ${config.brapi.token ? 'Configurado' : 'Não configurado'}`);
  console.log(`🏦 ANBIMA Client: ${config.anbima.clientId ? 'Configurado' : 'Não configurado'}`);
  console.log(`📰 News API Keys: ${config.newsApi.apiKeys.length}`);
  console.log(`🤖 OpenAI Key: ${config.openai.apiKey ? 'Configurada' : 'Não configurada'}`);
  console.log(`📋 Questionário de Perfil: Ativo`);
});
