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

// Limite maximo de variacao plausivel (defesa contra erros de cadastro de
// averagePrice errado ou preco da API absurdo). Acima disso o snapshot e
// atualizado mas o alerta NAO e disparado — o usuario nao recebe spam de
// "BTC subiu 3474%".
const MAX_PLAUSIBLE_VARIATION_PCT = 50;

interface AssetBaselineRow {
  id: string;
  alert_baseline_price: number | null;
}

export async function checkAlertsForAssets(assets: Asset[]): Promise<Alert[]> {
  const enabled = await getAlertsEnabled();
  if (!enabled) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const elegiveis = assets.filter((a) => a.id && a.currentPrice);
  if (elegiveis.length === 0) return [];

  // Busca os baselines atuais de todos os ativos em uma unica query
  const ids = elegiveis.map((a) => a.id);
  const { data: rows } = await supabase
    .from('portfolio_assets')
    .select('id, alert_baseline_price')
    .in('id', ids)
    .eq('user_id', user.id);

  const baselines = new Map<string, number | null>();
  ((rows ?? []) as AssetBaselineRow[]).forEach((r) => {
    baselines.set(r.id, r.alert_baseline_price);
  });

  const created: Alert[] = [];

  for (const asset of elegiveis) {
    const baseline = baselines.get(asset.id);
    const current = Number(asset.currentPrice);

    // Primeira leitura para esse ativo: grava baseline silenciosamente
    if (baseline === null || baseline === undefined || baseline === 0) {
      await supabase
        .from('portfolio_assets')
        .update({ alert_baseline_price: current })
        .eq('id', asset.id)
        .eq('user_id', user.id);
      continue;
    }

    const variation = ((current - baseline) / baseline) * 100;
    if (Math.abs(variation) < ALERT_THRESHOLD) continue;

    // Sanity check: variacao irreal entre duas verificacoes = bug de dado.
    // Atualiza baseline para nao ficar travado nesse cenario, mas nao alerta.
    if (Math.abs(variation) > MAX_PLAUSIBLE_VARIATION_PCT) {
      await supabase
        .from('portfolio_assets')
        .update({ alert_baseline_price: current })
        .eq('id', asset.id)
        .eq('user_id', user.id);
      continue;
    }

    const direction: AlertDirection = variation >= 0 ? 'up' : 'down';

    const skip = await hasRecentAlert(user.id, asset.ticker, direction);
    if (skip) {
      // Mesmo pulando por dedup, atualiza o baseline para nao ficar comparando
      // contra valor muito antigo na proxima verificacao
      await supabase
        .from('portfolio_assets')
        .update({ alert_baseline_price: current })
        .eq('id', asset.id)
        .eq('user_id', user.id);
      continue;
    }

    const { data, error } = await supabase
      .from('alertas_variacao')
      .insert({
        user_id: user.id,
        ticker: asset.ticker,
        asset_name: asset.name,
        asset_type: asset.type,
        direction,
        variation_pct: Number(variation.toFixed(2)),
        previous_price: baseline,
        current_price: current,
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
      // Atualiza baseline para a proxima verificacao comparar a partir daqui
      await supabase
        .from('portfolio_assets')
        .update({ alert_baseline_price: current })
        .eq('id', asset.id)
        .eq('user_id', user.id);
    }
  }

  if (created.length > 0 && typeof window !== 'undefined') {
    for (const alert of created) {
      window.dispatchEvent(new CustomEvent(NEW_ALERT_EVENT, { detail: alert }));
    }
  }

  return created;
}
