import { Router } from 'express';
import { newsController } from '../controllers/newsController.js';

const router = Router();

// GET /api/news/business - Notícias de negócios/finanças
router.get('/business', newsController.getBusinessNews);

export default router;
