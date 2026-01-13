import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

const router = Router();

// === CHAT / ASSISTENTE ===

// POST /api/ai/chat - Chat com o assistente
router.post('/chat', aiController.chat);

// POST /api/ai/ask - Pergunta simples
router.post('/ask', aiController.ask);

// === ANÁLISE FINANCEIRA ===

// POST /api/ai/analyze/stock/:symbol - Analisar uma ação
router.post('/analyze/stock/:symbol', aiController.analyzeStock);

// POST /api/ai/analyze/news - Analisar notícias
router.post('/analyze/news', aiController.analyzeNews);

// POST /api/ai/compare - Comparar duas ações
router.post('/compare', aiController.compareStocks);

// POST /api/ai/market-summary - Resumo do mercado
router.post('/market-summary', aiController.summarizeMarket);

// === EDUCAÇÃO FINANCEIRA ===

// GET /api/ai/explain/:term - Explicar termo financeiro
router.get('/explain/:term', aiController.explainTerm);

// === SUGESTÕES ===

// POST /api/ai/suggestion - Sugestão de investimento baseada no perfil
router.post('/suggestion', aiController.investmentSuggestion);

export default router;
