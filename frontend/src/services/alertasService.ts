import supabase from '@/lib/supabase';
import type { Asset } from './portfolioService';

export type AlertDirection = 'up' | 'down';

export interface Alert {
  id: string;
  user_id: string;
  ticker: string;
  asset_name: string;
  asset_type: string;
  direction: AlertDirection;
  variation_pct: number;
  previous_price: number;
  current_price: number;
  read: boolean;
  created_at: string;
}

export const ALERT_THRESHOLD = 5;
const DEDUP_WINDOW_HOURS = 24;
export const NEW_ALERT_EVENT = 'nuvary:new-alert';

// ── Preferência do usuário ──────────────────────────────────────────────────

export async function getAlertsEnabled(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('alertas_variacao_enabled')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return true;
  return data.alertas_variacao_enabled !== false;
}

export async function setAlertsEnabled(enabled: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('profiles')
    .update({ alertas_variacao_enabled: enabled })
    .eq('id', user.id);
}

// ── CRUD de alertas ─────────────────────────────────────────────────────────

export async function listAlerts(limit = 30): Promise<Alert[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('alertas_variacao')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Alert[];
}

export async function countUnread(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from('alertas_variacao')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);
  return count || 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('alertas_variacao')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', user.id);
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('alertas_variacao')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);
}

export async function deleteAlert(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('alertas_variacao')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
}

// ── Verificação de variação ─────────────────────────────────────────────────

async function hasRecentAlert(
  userId: string,
  ticker: string,
  direction: AlertDirection,
): Promise<boolean> {
  const cutoff = new Date(
    Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const { data } = await supabase
    .from('alertas_variacao')
    .select('id')
    .eq('user_id', userId)
    .eq('ticker', ticker)
    .eq('direction', direction)
    .gte('created_at', cutoff)
    .limit(1);
  return !!data && data.length > 0;
}

// Limite máximo para caber em NUMERIC(8,2) — variações irreais (cadastro com
// preço médio errado) seriam recortadas e ainda assim geram alerta
const MAX_VARIATION_PCT = 999999.99;

export async function checkAlertsForAssets(assets: Asset[]): Promise<Alert[]> {
  const enabled = await getAlertsEnabled();
  if (!enabled) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const created: Alert[] = [];

  for (const asset of assets) {
    if (!asset.averagePrice || !asset.currentPrice) continue;
    const rawVariation =
      ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100;
    if (Math.abs(rawVariation) < ALERT_THRESHOLD) continue;

    // Recorta para caber no NUMERIC(8,2) preservando o sinal
    const variation = Math.sign(rawVariation) *
      Math.min(Math.abs(rawVariation), MAX_VARIATION_PCT);

    const direction: AlertDirection = variation >= 0 ? 'up' : 'down';

    const skip = await hasRecentAlert(user.id, asset.ticker, direction);
    if (skip) continue;

    const { data, error } = await supabase
      .from('alertas_variacao')
      .insert({
        user_id: user.id,
        ticker: asset.ticker,
        asset_name: asset.name,
        asset_type: asset.type,
        direction,
        variation_pct: Number(variation.toFixed(2)),
        previous_price: asset.averagePrice,
        current_price: asset.currentPrice,
      })
      .select()
      .single();

    if (error) {
      console.error('Falha ao inserir alerta de variação:', error, {
        ticker: asset.ticker,
        variation,
      });
    } else if (data) {
      created.push(data as Alert);
    }
  }

  if (created.length > 0 && typeof window !== 'undefined') {
    for (const alert of created) {
      window.dispatchEvent(new CustomEvent(NEW_ALERT_EVENT, { detail: alert }));
    }
  }

  return created;
}
