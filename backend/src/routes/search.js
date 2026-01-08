import { Router } from 'express';
import { searchController } from '../controllers/searchController.js';

const router = Router();

// GET /api/search?q=keyword - Buscar símbolos
router.get('/', searchController.searchSymbol);

// GET /api/search/market-status - Status dos mercados globais
router.get('/market-status', searchController.getMarketStatus);

export default router;
