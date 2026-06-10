import supabase from '@/lib/supabase';

// ============================================================
// Whitelist Premium — emails que tem acesso vitalicio sem pagamento.
// Util para conta do dono, testes internos e contas de demo.
// Comparacao e case-insensitive.
// ============================================================
export const PREMIUM_WHITELIST: readonly string[] = [
  'investnet123@gmail.com',
  'luciano.cruz@atitus.edu.br',
  'vitorbgirardi13@gmail.com',
  'augustofavaretto03@gmail.com',
];

export function isWhitelistedPremium(email: string | null | undefined): boolean {
  if (!email) return false;
  return PREMIUM_WHITELIST.includes(email.toLowerCase());
}

export type SubscriptionStatus =
  | 'free'
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'paused'
  | 'pending';

export type SubscriptionPlan = 'mensal' | 'anual';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export interface SubscriptionState {
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  paymentMethod: PaymentMethod | null;
  expiresAt: string | null;
  startedAt: string | null;
}

// Le o estado atual da assinatura do usuario logado.
// Usuarios na PREMIUM_WHITELIST recebem status 'active' sem expiracao,
// independente do estado real em profiles.
export async function getSubscriptionState(): Promise<SubscriptionState> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { status: 'free', plan: null, paymentMethod: null, expiresAt: null, startedAt: null };
  }

  // Bypass total para emails da whitelist
  if (isWhitelistedPremium(user.email)) {
    return {
      status: 'active',
      plan: 'anual',
      paymentMethod: null,
      expiresAt: null, // sem expiracao = vitalicio
      startedAt: user.created_at ?? null,
    };
  }

  const { data } = await supabase
    .from('profiles')
    .select(
      'subscription_status, subscription_plan, subscription_payment_method, subscription_expires_at, subscription_started_at'
    )
    .eq('id', user.id)
    .maybeSingle();

  return {
    status: (data?.subscription_status as SubscriptionStatus) || 'free',
    plan: (data?.subscription_plan as SubscriptionPlan) || null,
    paymentMethod: (data?.subscription_payment_method as PaymentMethod) || null,
    expiresAt: data?.subscription_expires_at || null,
    startedAt: data?.subscription_started_at || null,
  };
}

// True se o usuario tem acesso Premium ATIVO no momento.
// Assinaturas 'cancelled' mantem o acesso ate a data de expiracao
// (usuario ja pagou pelo periodo vigente; so nao havera renovacao).
export function isPremiumActive(state: SubscriptionState): boolean {
  if (state.status !== 'active' && state.status !== 'cancelled') return false;
  if (!state.expiresAt) return state.status === 'active'; // sem expiracao = vitalicio (whitelist)
  return new Date(state.expiresAt).getTime() > Date.now();
}

// ============================================================
// Chamadas ao backend MP
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CreateSubscriptionResponse {
  init_point: string;
  preapproval_id?: string;
  preference_id?: string;
}

// Cria assinatura recorrente cartao — retorna URL do MP pra concluir
export async function createCreditCardSubscription(
  plan: SubscriptionPlan
): Promise<CreateSubscriptionResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const res = await fetch(`${API_URL}/mercadopago/create-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      plan,
      payerEmail: user.email,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao criar assinatura');
  }
  return res.json();
}

// Cancela a assinatura Premium do usuario logado.
// Interrompe a recorrencia (cartao) no MP e marca o status como 'cancelled'.
// O acesso permanece ate subscription_expires_at.
export async function cancelSubscription(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const res = await fetch(`${API_URL}/mercadopago/cancel-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao cancelar assinatura');
  }
}

// Cria pagamento unico PIX/Boleto — retorna URL do MP pra concluir
export async function createOneTimePayment(
  plan: SubscriptionPlan,
  method: 'pix' | 'boleto'
): Promise<CreateSubscriptionResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const res = await fetch(`${API_URL}/mercadopago/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      plan,
      payerEmail: user.email,
      method,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao criar pagamento');
  }
  return res.json();
}
