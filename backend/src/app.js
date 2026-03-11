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

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api/stocks', stockRoutes);
app.use('/api/forex', forexRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/finnhub', finnhubRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', riskProfileRoutes);
app.use('/api/brapi', brapiRoutes);
app.use('/api/anbima', anbimaRoutes);
app.use('/api/tesouro', tesouroDiretoRoutes);
app.use('/api/bcb', bcbRoutes);

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
    modules: { riskProfile: true },
  });
});

app.use(errorHandler);

export default app;
