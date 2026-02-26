import { Router } from 'express';
import { brapiController } from '../controllers/brapiController.js';

const router = Router();

// === AÇÕES E FIIs DA B3 ===

// GET /api/brapi/quote/list - Lista de ações disponíveis na B3 (deve vir antes de :tickers)
router.get('/quote/list', brapiController.listStocks);

// GET /api/brapi/quote/:tickers - Cotação de ações/FIIs (ex: PETR4,VALE3)
router.get('/quote/:tickers', brapiController.getQuote);

// === CRIPTOMOEDAS ===

// GET /api/brapi/crypto - Cotação de criptomoedas
router.get('/crypto', brapiController.getCrypto);

// === MOEDAS ===

// GET /api/brapi/currency - Cotações de câmbio (USD-BRL, EUR-BRL)
router.get('/currency', brapiController.getCurrency);

// === INDICADORES ECONÔMICOS ===

// GET /api/brapi/inflation - Dados de inflação (IPCA)
router.get('/inflation', brapiController.getInflation);

// GET /api/brapi/selic - Taxa Selic atual
router.get('/selic', brapiController.getSelic);

export default router;
