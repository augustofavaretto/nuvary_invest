import crypto from 'crypto';
import {
  MercadoPagoConfig,
  PreApproval,
  Preference,
  Payment,
} from 'mercadopago';
import { config } from '../config/index.js';

// Lazy init dos clientes MP — evita quebrar boot do app sem env
let mpClient = null;
function getClient() {
  if (mpClient) return mpClient;
  if (!config.mercadopago.accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN nao configurado.');
  }
  mpClient = new MercadoPagoConfig({
    accessToken: config.mercadopago.accessToken,
    options: { timeout: 10000 },
  });
  return mpClient;
}

// ============================================================
// Planos Nuvary Premium
// ============================================================
export const PLANS = {
  mensal: {
    id: 'mensal',
    name: 'Nuvary Premium Mensal',
    amount: 79.99,
    frequency: 1,
    frequency_type: 'months', // cobra a cada 1 mes
    days: 30, // para PIX/Boleto: validade de acesso apos pagamento
  },
  anual: {
    id: 'anual',
    name: 'Nuvary Premium Anual',
    amount: 849.99,
    frequency: 12,
    frequency_type: 'months', // cobra a cada 12 meses (anual)
    days: 365,
  },
};

// ============================================================
// 1) Cartao recorrente — cria preapproval (assinatura)
// ============================================================
export async function createPreapproval({ userId, plan, payerEmail }) {
  const planData = PLANS[plan];
  if (!planData) throw new Error(`Plano invalido: ${plan}`);

  const preapproval = new PreApproval(getClient());

  const body = {
    reason: planData.name,
    auto_recurring: {
      frequency: planData.frequency,
      frequency_type: planData.frequency_type,
      transaction_amount: planData.amount,
      currency_id: 'BRL',
    },
    back_url: config.mercadopago.successUrl,
    external_reference: `${userId}:${plan}`, // usa pra identificar no webhook
    payer_email: payerEmail,
    status: 'pending', // usuario precisa autorizar via init_point
  };

  const response = await preapproval.create({ body });
  return {
    id: response.id,
    init_point: response.init_point, // URL para o usuario concluir
    status: response.status,
  };
}

// ============================================================
// 2) PIX / Boleto — cria preference (pagamento unico)
// ============================================================
export async function createPreference({ userId, plan, payerEmail, method }) {
  const planData = PLANS[plan];
  if (!planData) throw new Error(`Plano invalido: ${plan}`);

  const preference = new Preference(getClient());

  // Restringe metodos de pagamento conforme escolha do usuario
  const excludedPaymentTypes = [];
  if (method === 'pix') {
    excludedPaymentTypes.push({ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' });
  } else if (method === 'boleto') {
    excludedPaymentTypes.push({ id: 'credit_card' }, { id: 'debit_card' }, { id: 'atm' });
  }

  const body = {
    items: [
      {
        id: plan,
        title: planData.name,
        description: 'Acesso Premium Nuvary Invest',
        quantity: 1,
        unit_price: planData.amount,
        currency_id: 'BRL',
      },
    ],
    payer: payerEmail ? { email: payerEmail } : undefined,
    external_reference: `${userId}:${plan}:${method}`,
    back_urls: {
      success: config.mercadopago.successUrl,
      failure: config.mercadopago.failureUrl,
      pending: config.mercadopago.pendingUrl,
    },
    auto_return: 'approved',
    payment_methods: {
      excluded_payment_types: excludedPaymentTypes,
      installments: 1,
    },
    notification_url: undefined, // usamos webhook global configurado no painel MP
  };

  const response = await preference.create({ body });
  return {
    id: response.id,
    init_point: response.init_point,
  };
}

// ============================================================
// 3) Buscar pagamento por ID (usado no webhook)
// ============================================================
export async function getPaymentById(paymentId) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

// ============================================================
// 4) Buscar preapproval por ID
// ============================================================
export async function getPreapprovalById(preapprovalId) {
  const preapproval = new PreApproval(getClient());
  return preapproval.get({ id: preapprovalId });
}

// ============================================================
// 5) Validacao da assinatura do webhook
//
// MP envia headers:
//   x-signature: ts=1234567890,v1=hexsignature
//   x-request-id: <uuid>
//
// Calculo: HMAC SHA256 do template
//   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
// com a chave MERCADOPAGO_WEBHOOK_SECRET
// ============================================================
export function verifyWebhookSignature({ xSignature, xRequestId, dataId }) {
  const secret = config.mercadopago.webhookSecret;
  if (!secret) {
    console.warn('[MP webhook] MERCADOPAGO_WEBHOOK_SECRET nao configurado — pulando validacao');
    return true; // em dev/teste, deixar passar
  }
  if (!xSignature) return false;

  const parts = xSignature.split(',').reduce((acc, p) => {
    const [k, v] = p.split('=');
    acc[k?.trim()] = v?.trim();
    return acc;
  }, {});

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // timing-safe compare
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
