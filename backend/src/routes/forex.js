import { Router } from 'express';
import { forexController } from '../controllers/forexController.js';

const router = Router();

// GET /api/forex/:from/:to/rate - Taxa de câmbio atual
router.get('/:from/:to/rate', forexController.getExchangeRate);

// GET /api/forex/:from/:to/daily - Dados diários do par
router.get('/:from/:to/daily', forexController.getDaily);

// GET /api/forex/:from/:to/intraday - Dados intraday do par
router.get('/:from/:to/intraday', forexController.getIntraday);

export default router;
