import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

const router = Router();

// POST /api/ai/chat - Chat com o assistente
router.post('/chat', aiController.chat);

// POST /api/ai/suggestion - Sugestão de investimento baseada no perfil
router.post('/suggestion', aiController.investmentSuggestion);

export default router;
