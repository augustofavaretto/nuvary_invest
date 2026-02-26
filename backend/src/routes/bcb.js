import { Router } from 'express';
import { bcbController } from '../controllers/bcbController.js';

const router = Router();

// GET /api/bcb/selic  — Selic diária, meta COPOM e anualizada base 252
router.get('/selic', bcbController.getSelic);

// GET /api/bcb/cdi    — CDI diária e anualizada base 252
router.get('/cdi', bcbController.getCDI);

// GET /api/bcb/ipca   — IPCA mensal e acumulado 12 meses
router.get('/ipca', bcbController.getIPCA);

// GET /api/bcb/igpm   — IGP-M mensal
router.get('/igpm', bcbController.getIGPM);

// GET /api/bcb/focus  — Expectativas Focus (BCB OLINDA OData)
router.get('/focus', bcbController.getFocus);

// GET /api/bcb/rates  — Todos os indicadores consolidados (Selic, CDI, IPCA, IGP-M)
router.get('/rates', bcbController.getAllRates);

export default router;
