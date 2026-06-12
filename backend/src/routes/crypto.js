import { Router } from 'express';
import { cryptoController } from '../controllers/cryptoController.js';

const router = Router();

// GET /api/crypto/:symbol/rate - Preço atual da cripto
router.get('/:symbol/rate', cryptoController.getExchangeRate);

export default router;
