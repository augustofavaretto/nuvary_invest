import { Router } from 'express';
import { brapiController } from '../controllers/brapiController.js';

const router = Router();

// GET /api/brapi/quote/:tickers - Cotação de ações/FIIs (ex: PETR4,VALE3)
router.get('/quote/:tickers', brapiController.getQuote);

// GET /api/brapi/selic - Taxa Selic atual
router.get('/selic', brapiController.getSelic);

export default router;
