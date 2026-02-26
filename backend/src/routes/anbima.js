import { Router } from 'express';
import { anbimaController } from '../controllers/anbimaController.js';

const router = Router();

// === TÍTULOS PÚBLICOS (TESOURO DIRETO) ===

// GET /api/anbima/titulos-publicos - Preços e taxas do mercado secundário
router.get('/titulos-publicos', anbimaController.getTitulosPublicos);

// GET /api/anbima/vna - Valor Nominal Atualizado (LFT, NTN-B, NTN-C)
router.get('/vna', anbimaController.getVNA);

// GET /api/anbima/curvas-juros - Curvas de juros
router.get('/curvas-juros', anbimaController.getCurvasJuros);

// GET /api/anbima/estimativa-selic - Estimativa da taxa Selic
router.get('/estimativa-selic', anbimaController.getEstimativaSelic);

// GET /api/anbima/projecoes - Projeções IPCA e IGP-M
router.get('/projecoes', anbimaController.getProjecoes);

// === RENDA FIXA PRIVADA ===

// GET /api/anbima/cri-cra - Preços de CRI/CRA
router.get('/cri-cra', anbimaController.getCriCra);

// GET /api/anbima/letras-financeiras - Letras Financeiras
router.get('/letras-financeiras', anbimaController.getLetrasFinanceiras);

export default router;
