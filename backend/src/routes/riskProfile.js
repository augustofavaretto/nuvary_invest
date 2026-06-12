import { Router } from 'express';
import { riskProfileController } from '../controllers/riskProfileController.js';

const router = Router();

// GET /api/profile/questionnaire - Obter questionário
router.get('/questionnaire', riskProfileController.getQuestionnaire);

// POST /api/profile/submit - Enviar respostas e obter perfil
router.post('/submit', riskProfileController.submitAnswers);

export default router;
