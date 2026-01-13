import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import stockRoutes from './routes/stocks.js';
import forexRoutes from './routes/forex.js';
import cryptoRoutes from './routes/crypto.js';
import searchRoutes from './routes/search.js';
import finnhubRoutes from './routes/finnhub.js';
import newsRoutes from './routes/news.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Middleware
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apis: {
      alphaVantage: config.alphaVantage.apiKeys.length > 0,
      finnhub: !!config.finnhub.apiKey,
      newsApi: config.newsApi.apiKeys.length > 0,
      openai: !!config.openai.apiKey,
    },
  });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Nuvary Invest Backend rodando na porta ${config.port}`);
  console.log(`📊 Alpha Vantage Keys: ${config.alphaVantage.apiKeys.length}`);
  console.log(`📈 Finnhub Key: ${config.finnhub.apiKey ? 'Configurada' : 'Não configurada'}`);
  console.log(`📰 News API Keys: ${config.newsApi.apiKeys.length}`);
  console.log(`🤖 OpenAI Key: ${config.openai.apiKey ? 'Configurada' : 'Não configurada'}`);
});
