import { Router } from 'express';
import { stockController } from '../controllers/stockController.js';

const router = Router();

// GET /api/stocks/:symbol/quote - Cotação atual
router.get('/:symbol/quote', stockController.getQuote);

// GET /api/stocks/:symbol/intraday - Dados intraday
router.get('/:symbol/intraday', stockController.getIntraday);

// GET /api/stocks/:symbol/daily - Dados diários
router.get('/:symbol/daily', stockController.getDaily);

// GET /api/stocks/:symbol/weekly - Dados semanais
router.get('/:symbol/weekly', stockController.getWeekly);

// GET /api/stocks/:symbol/monthly - Dados mensais
router.get('/:symbol/monthly', stockController.getMonthly);

// GET /api/stocks/:symbol/overview - Visão geral da empresa
router.get('/:symbol/overview', stockController.getOverview);

export default router;
