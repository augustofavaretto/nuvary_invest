import { Router } from 'express';
import { cryptoController } from '../controllers/cryptoController.js';

const router = Router();

// GET /api/crypto/:symbol/rate - Preço atual da cripto
router.get('/:symbol/rate', cryptoController.getExchangeRate);

// GET /api/crypto/:symbol/daily - Dados diários
router.get('/:symbol/daily', cryptoController.getDaily);

// GET /api/crypto/:symbol/weekly - Dados semanais
router.get('/:symbol/weekly', cryptoController.getWeekly);

export default router;
