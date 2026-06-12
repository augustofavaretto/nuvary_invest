import { Router } from 'express';
import { finnhubController } from '../controllers/finnhubController.js';

const router = Router();

// GET /api/finnhub/stocks/:symbol/quote - Cotação em tempo real
router.get('/stocks/:symbol/quote', finnhubController.getQuote);

// GET /api/finnhub/stocks/:symbol/candles - Dados OHLCV (candlestick)
router.get('/stocks/:symbol/candles', finnhubController.getCandles);

// GET /api/finnhub/news/market - Notícias do mercado
router.get('/news/market', finnhubController.getMarketNews);

export default router;
