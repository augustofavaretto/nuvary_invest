import {
  createPreapproval,
  createPreference,
  getPaymentById,
  getPreapprovalById,
  cancelPreapproval,
  verifyWebhookSignature,
  PLANS,
} from '../services/mercadopago.js';
import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';

// POST /api/mercadopago/create-subscription — cria assinatura recorrente (preapproval) e retorna a URL de pagamento
export async function createSubscription(req, res, next) {
  try {
    const { userId, plan, payerEmail } = req.body;

    if (!userId || !plan || !payerEmail) {
      return res.status(400).json({
        error: 'Campos obrigatorios: userId, plan, payerEmail',
      });
    }
    if (!PLANS[plan]) {
      return res.status(400).json({ error: `Plano invalido: ${plan}` });
    }

    const preapproval = await createPreapproval({ userId, plan, payerEmail });

    // Marca o profile como pending — webhook autorizado vai mudar para 'active'
    const admin = getSupabaseAdmin();
    await admin
      .from('profiles')
      .update({
        subscription_status: 'pending',
        subscription_plan: plan,
        subscription_payment_method: 'credit_card',
        mp_preapproval_id: preapproval.id,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return res.json({
      init_point: preapproval.init_point,
      preapproval_id: preapproval.id,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/mercadopago/create-payment — pagamento unico via Checkout Pro (PIX ou Boleto)
export async function createPayment(req, res, next) {
  try {
    const { userId, plan, payerEmail, method } = req.body;

    if (!userId || !plan || !method) {
      return res.status(400).json({
        error: 'Campos obrigatorios: userId, plan, method',
      });
    }
    if (!PLANS[plan]) {
      return res.status(400).json({ error: `Plano invalido: ${plan}` });
    }
    if (method !== 'pix' && method !== 'boleto') {
      return res.status(400).json({ error: `Metodo invalido: ${method}` });
    }

    const preference = await createPreference({ userId, plan, payerEmail, method });

    const admin = getSupabaseAdmin();
    await admin
      .from('profiles')
      .update({
        subscription_status: 'pending',
        subscription_plan: plan,
        subscription_payment_method: method,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return res.json({
      init_point: preference.init_point,
      preference_id: preference.id,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/mercadopago/cancel-subscription — cancela a assinatura; acesso permanece ate subscription_expires_at
export async function cancelSubscription(req, res, next) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Campo obrigatorio: userId' });
    }

    const admin = getSupabaseAdmin();

    const { data: profile, error } = await admin
      .from('profiles')
      .select('subscription_status, mp_preapproval_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return res.status(404).json({ error: 'Perfil nao encontrado' });
    }
    if (profile.subscription_status !== 'active') {
      return res.status(400).json({ error: 'Nenhuma assinatura ativa para cancelar' });
    }

    // Cancela a recorrencia no MP (somente assinaturas de cartao tem preapproval)
    if (profile.mp_preapproval_id) {
      try {
        await cancelPreapproval(profile.mp_preapproval_id);
      } catch (mpErr) {
        console.error('[MP cancel] Falha ao cancelar preapproval no MP:', mpErr?.message || mpErr);
        // Segue mesmo assim — marca local como cancelled para refletir a intencao do usuario
      }
    }

    // Marca como cancelado. Acesso continua valido ate subscription_expires_at.
    await admin
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return res.json({ ok: true, status: 'cancelled' });
  } catch (err) {
    next(err);
  }
}

// POST /api/mercadopago/webhook — MP chama este endpoint a cada evento (payment, subscription_preapproval, etc.)
export async function webhook(req, res, next) {
  try {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    const body = req.body || {};
    const dataId = body?.data?.id;
    const type = body?.type || body?.topic; // MP varia entre type/topic

    if (!dataId) {
      return res.status(400).json({ error: 'data.id ausente no payload' });
    }

    // Valida assinatura (somente se secret estiver configurado)
    const valid = verifyWebhookSignature({ xSignature, xRequestId, dataId });
    if (!valid) {
      console.warn('[MP webhook] Assinatura invalida — descartando');
      return res.status(401).json({ error: 'Assinatura invalida' });
    }

    // Responde 200 rapido (MP recomenda < 22s); processa em paralelo
    res.status(200).json({ received: true });

    // Despacha por tipo
    if (type === 'payment') {
      await processPaymentEvent(dataId);
    } else if (
      type === 'subscription_preapproval' ||
      type === 'preapproval' ||
      type === 'subscription_authorized_payment'
    ) {
      await processPreapprovalEvent(dataId);
    } else {
      console.log(`[MP webhook] Tipo nao tratado: ${type}`);
    }
  } catch (err) {
    console.error('[MP webhook] Erro:', err);
    next(err);
  }
}

// Processa evento de pagamento (PIX/Boleto unico ou cobranca recorrente)
async function processPaymentEvent(paymentId) {
  const payment = await getPaymentById(paymentId);
  const admin = getSupabaseAdmin();

  // external_reference vem no formato "userId:plan[:method]"
  const ext = (payment.external_reference || '').split(':');
  const userId = ext[0];
  const plan = ext[1];
  const method = ext[2];

  if (!userId) {
    console.warn('[MP webhook] payment sem userId no external_reference', { paymentId });
    return;
  }

  // Insere no historico (UPSERT por mp_payment_id)
  await admin.from('subscription_payments').upsert(
    {
      user_id: userId,
      mp_payment_id: String(payment.id),
      mp_preapproval_id: payment.metadata?.preapproval_id || null,
      amount: Number(payment.transaction_amount || 0),
      currency: payment.currency_id || 'BRL',
      status: payment.status,
      payment_method: mapPaymentMethod(payment.payment_type_id),
      description: payment.description || null,
      raw_event: payment,
    },
    { onConflict: 'mp_payment_id' }
  );

  // Se aprovado, atualiza profile (libera Premium)
  if (payment.status === 'approved' && plan) {
    const days = plan === 'anual' ? 365 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await admin
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_payment_method: method || mapPaymentMethod(payment.payment_type_id),
        subscription_started_at: new Date().toISOString(),
        subscription_expires_at: expiresAt,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status)) {
    // Pagamento falhou ou foi estornado — nao libera Premium
    await admin
      .from('profiles')
      .update({
        subscription_status: 'free',
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('subscription_status', 'pending'); // so volta para free se ainda estava pending
  }
}

// Processador de evento de preapproval (assinatura recorrente)
async function processPreapprovalEvent(preapprovalId) {
  const preapproval = await getPreapprovalById(preapprovalId);
  const admin = getSupabaseAdmin();

  const ext = (preapproval.external_reference || '').split(':');
  const userId = ext[0];
  const plan = ext[1];

  if (!userId) {
    console.warn('[MP webhook] preapproval sem userId no external_reference', { preapprovalId });
    return;
  }

  // Mapeia status do MP para nosso enum
  let status = 'pending';
  if (preapproval.status === 'authorized') status = 'active';
  else if (preapproval.status === 'paused') status = 'paused';
  else if (preapproval.status === 'cancelled') status = 'cancelled';

  const updates = {
    subscription_status: status,
    mp_preapproval_id: String(preapproval.id),
    subscription_updated_at: new Date().toISOString(),
  };

  if (status === 'active') {
    updates.subscription_plan = plan;
    updates.subscription_payment_method = 'credit_card';
    if (!preapproval.next_payment_date) {
      // fallback: 30 dias a partir de agora
      updates.subscription_expires_at = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else {
      updates.subscription_expires_at = new Date(preapproval.next_payment_date).toISOString();
    }
    if (!updates.subscription_started_at) {
      updates.subscription_started_at = new Date().toISOString();
    }
  }

  await admin.from('profiles').update(updates).eq('id', userId);
}

// Helpers
function mapPaymentMethod(mpType) {
  if (!mpType) return null;
  if (mpType === 'credit_card') return 'credit_card';
  if (mpType === 'debit_card') return 'debit_card';
  if (mpType === 'bank_transfer') return 'pix';
  if (mpType === 'ticket') return 'boleto';
  if (mpType === 'account_money') return 'account_money';
  return null;
}
