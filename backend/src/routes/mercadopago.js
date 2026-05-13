import express from 'express';
import {
  createSubscription,
  createPayment,
  webhook,
} from '../controllers/mercadopagoController.js';

const router = express.Router();

// POST /api/mercadopago/create-subscription — cartao recorrente
router.post('/create-subscription', createSubscription);

// POST /api/mercadopago/create-payment — PIX ou Boleto unico
router.post('/create-payment', createPayment);

// POST /api/mercadopago/webhook — notificacoes do MP
router.post('/webhook', webhook);

export default router;
