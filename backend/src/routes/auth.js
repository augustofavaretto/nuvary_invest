import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rate limiting para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 tentativas por minuto
  message: {
    success: false,
    error: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  },
});

// === ROTAS PÚBLICAS ===

// POST /api/auth/register - Criar conta
router.post('/register', authLimiter, authController.register);

// POST /api/auth/login - Fazer login
router.post('/login', authLimiter, authController.login);

// POST /api/auth/refresh-token - Renovar access token
router.post('/refresh-token', authController.refreshToken);

// POST /api/auth/forgot-password - Solicitar recuperação de senha
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// POST /api/auth/reset-password - Redefinir senha
router.post('/reset-password', authLimiter, authController.resetPassword);

// === ROTAS PROTEGIDAS ===

// POST /api/auth/logout - Fazer logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/profile - Obter perfil do usuário
router.get('/profile', authenticate, authController.getProfile);

// PUT /api/auth/profile - Atualizar perfil
router.put('/profile', authenticate, authController.updateProfile);

// DELETE /api/auth/account - Excluir conta
router.delete('/account', authenticate, authController.deleteAccount);

// === PERFIL DE INVESTIDOR ===

// POST /api/auth/investor-profile - Salvar perfil de investidor
router.post('/investor-profile', authenticate, authController.saveInvestorProfile);

// GET /api/auth/investor-profile - Obter perfil de investidor
router.get('/investor-profile', authenticate, authController.getInvestorProfile);

// === HISTÓRICO DE CHAT ===

// GET /api/auth/chat-history - Obter histórico de chat
router.get('/chat-history', authenticate, authController.getChatHistory);

// DELETE /api/auth/chat-history - Limpar histórico de chat
router.delete('/chat-history', authenticate, authController.clearChatHistory);

export default router;
