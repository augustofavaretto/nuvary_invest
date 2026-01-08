import { Router } from 'express';
import { finnhubController } from '../controllers/finnhubController.js';

const router = Router();

// === STOCKS ===

// GET /api/finnhub/stocks/:symbol/quote - Cotação em tempo real
router.get('/stocks/:symbol/quote', finnhubController.getQuote);

// GET /api/finnhub/stocks/:symbol/candles - Dados OHLCV (candlestick)
router.get('/stocks/:symbol/candles', finnhubController.getCandles);

// GET /api/finnhub/stocks/:symbol/profile - Perfil da empresa
router.get('/stocks/:symbol/profile', finnhubController.getCompanyProfile);

// GET /api/finnhub/stocks/:symbol/metrics - Métricas financeiras
router.get('/stocks/:symbol/metrics', finnhubController.getCompanyMetrics);

// GET /api/finnhub/stocks/:symbol/recommendations - Recomendações de analistas
router.get('/stocks/:symbol/recommendations', finnhubController.getRecommendations);

// GET /api/finnhub/stocks/:symbol/price-target - Preço-alvo
router.get('/stocks/:symbol/price-target', finnhubController.getPriceTarget);

// === NOTÍCIAS ===

// GET /api/finnhub/news/company/:symbol - Notícias da empresa
router.get('/news/company/:symbol', finnhubController.getCompanyNews);

// GET /api/finnhub/news/market - Notícias do mercado
router.get('/news/market', finnhubController.getMarketNews);

// GET /api/finnhub/news/sentiment/:symbol - Sentimento de notícias
router.get('/news/sentiment/:symbol', finnhubController.getNewsSentiment);

// === INSIDERS ===

// GET /api/finnhub/insiders/:symbol/transactions - Transações de insiders
router.get('/insiders/:symbol/transactions', finnhubController.getInsiderTransactions);

// === INDICADORES TÉCNICOS ===

// GET /api/finnhub/technicals/:symbol/indicator - Indicador técnico específico
router.get('/technicals/:symbol/indicator', finnhubController.getTechnicalIndicator);

// GET /api/finnhub/technicals/:symbol/aggregate - Indicadores agregados
router.get('/technicals/:symbol/aggregate', finnhubController.getAggregateIndicators);

// GET /api/finnhub/technicals/:symbol/support-resistance - Suporte e resistência
router.get('/technicals/:symbol/support-resistance', finnhubController.getSupportResistance);

// === FOREX ===

// GET /api/finnhub/forex/rates - Taxas de câmbio
router.get('/forex/rates', finnhubController.getForexRates);

// GET /api/finnhub/forex/:symbol/candles - Candles de forex
router.get('/forex/:symbol/candles', finnhubController.getForexCandles);

// === CRYPTO ===

// GET /api/finnhub/crypto/:symbol/candles - Candles de crypto
router.get('/crypto/:symbol/candles', finnhubController.getCryptoCandles);

// === BUSCA ===

// GET /api/finnhub/search?q=keyword - Buscar símbolos
router.get('/search', finnhubController.searchSymbol);

export default router;
