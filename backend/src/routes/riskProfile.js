import { Router } from 'express';
import { riskProfileController } from '../controllers/riskProfileController.js';

const router = Router();

// === QUESTIONÁRIO ===

// GET /api/profile/questionnaire - Obter questionário
router.get('/questionnaire', riskProfileController.getQuestionnaire);

// POST /api/profile/submit - Enviar respostas e obter perfil
router.post('/submit', riskProfileController.submitAnswers);

// POST /api/profile/calculate - Preview do perfil (sem salvar)
router.post('/calculate', riskProfileController.calculatePreview);

// === PERFIL DO USUÁRIO ===

// GET /api/profile/user/:userId - Obter perfil do usuário
router.get('/user/:userId', riskProfileController.getUserProfile);

// GET /api/profile/user/:userId/history - Histórico de perfis
router.get('/user/:userId/history', riskProfileController.getUserHistory);

// DELETE /api/profile/user/:userId - Remover perfil do usuário
router.delete('/user/:userId', riskProfileController.deleteUserProfile);

// === TIPOS DE PERFIL ===

// GET /api/profile/types - Listar tipos de perfil
router.get('/types', riskProfileController.getProfileTypes);

// GET /api/profile/types/:type - Detalhes de um tipo de perfil
router.get('/types/:type', riskProfileController.getProfileTypeDetails);

// === ESTATÍSTICAS ===

// GET /api/profile/statistics - Estatísticas gerais
router.get('/statistics', riskProfileController.getStatistics);

export default router;
