import { Router } from 'express';
import { newsController } from '../controllers/newsController.js';

const router = Router();

// === TOP HEADLINES ===

// GET /api/news/headlines - Manchetes principais
router.get('/headlines', newsController.getTopHeadlines);

// GET /api/news/headlines/country/:country - Manchetes por país
router.get('/headlines/country/:country', newsController.getHeadlinesByCountry);

// GET /api/news/headlines/category/:category - Manchetes por categoria
router.get('/headlines/category/:category', newsController.getHeadlinesByCategory);

// === SEARCH ===

// GET /api/news/search - Buscar notícias
router.get('/search', newsController.searchNews);

// === SOURCES ===

// GET /api/news/sources - Listar fontes de notícias
router.get('/sources', newsController.getSources);

// === ATALHOS ===

// GET /api/news/business - Notícias de negócios/finanças
router.get('/business', newsController.getBusinessNews);

// GET /api/news/tech - Notícias de tecnologia
router.get('/tech', newsController.getTechNews);

export default router;
