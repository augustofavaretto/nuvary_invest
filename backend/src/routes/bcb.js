import { Router } from 'express';
import { bcbController } from '../controllers/bcbController.js';

const router = Router();

// GET /api/bcb/dolar - Cotação USD/BRL (PTAX diária, série SGS 1)
router.get('/dolar', bcbController.getDolar);

// GET /api/bcb/rates - Indicadores consolidados (Selic, CDI, IPCA, IGP-M)
router.get('/rates', bcbController.getAllRates);

export default router;
