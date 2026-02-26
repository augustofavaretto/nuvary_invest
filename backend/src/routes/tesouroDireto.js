import { Router } from 'express';
import { tesouroDiretoController } from '../controllers/tesouroDiretoController.js';

const router = Router();

// GET /api/tesouro/rates — Taxas e PUs de todos os títulos do Tesouro Direto
router.get('/rates', tesouroDiretoController.getRates);

export default router;
