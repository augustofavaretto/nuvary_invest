// Portfolio Service - Persistência via Supabase

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
import supabase from '@/lib/supabase';

export type AssetClass = 'renda_fixa' | 'renda_variavel' | 'fiis' | 'internacional';
export type CategoryId = 'renda_fixa' | 'renda_variavel' | 'fiis' | 'internacional' | 'cripto';

export interface AssetClassData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetClass;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  percentageOfPortfolio: number;
  percentageOfProduct: number;
  variation: number;
  broker: string;
  createdAt?: string;
}

export interface Broker {
  name: string;
  value: number;
  percentage: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  profitPercentage: number;
  lastUpdate: string;
}

export interface PortfolioData {
  summary: PortfolioSummary;
  byClass: AssetClassData[];
  byProduct: {
    rendaFixa: Asset[];
    rendaVariavel: Asset[];
    fiis: Asset[];
    internacional: Asset[];
  };
  byBroker: Broker[];
}

// Storage key
const STORAGE_KEY = 'nuvary_portfolio_assets';

// Mapeamento de BDRs para símbolos americanos
const BDR_TO_US_SYMBOL: Record<string, string> = {
  'AAPL34': 'AAPL',
  'MSFT34': 'MSFT',
  'AMZO34': 'AMZN',
  'GOGL34': 'GOOGL',
  'FBOK34': 'META',
  'TSLA34': 'TSLA',
  'NVDC34': 'NVDA',
  'NFLX34': 'NFLX',
  'DISB34': 'DIS',
  'COCA34': 'KO',
  'JPMC34': 'JPM',
  'BOAC34': 'BAC',
  'IVVB11': 'SPY', // ETF S&P 500
  'SPXI11': 'SPY',
};

// Cotação do dólar — fallback caso a API do BCB não responda
const USD_TO_BRL = 5.0;

// Busca a cotação USD/BRL real (PTAX) no backend BCB, com cache de 1h.
// Cai no fallback USD_TO_BRL se a API falhar.
let usdBrlCache: { value: number; ts: number } | null = null;
const USD_BRL_TTL = 60 * 60 * 1000; // 1h

async function fetchUsdToBrl(): Promise<number> {
  const now = Date.now();
  if (usdBrlCache && now - usdBrlCache.ts < USD_BRL_TTL) return usdBrlCache.value;
  try {
    const res = await fetch(`${API_URL}/bcb/dolar`);
    if (res.ok) {
      const data = await res.json();
      const taxa = Number(data?.taxa);
      if (taxa > 0) {
        usdBrlCache = { value: taxa, ts: now };
        return taxa;
      }
    }
  } catch {
    // silencioso — usa fallback
  }
  return USD_TO_BRL;
}

export interface PriceResult {
  price: number | null;
  currency: 'BRL' | 'USD';
  source: string;
  error?: string;
}

// Indicadores BCB em cache local (evita múltiplas chamadas na mesma sessão)
let bcbRatesCache: { selic: number | null; cdi: number | null; ipca: number | null; ts: number } | null = null;
const BCB_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

// Busca todos os indicadores BCB de uma vez (/api/bcb/rates)
async function fetchBCBRates(): Promise<{ selic: number | null; cdi: number | null; ipca: number | null }> {
  if (bcbRatesCache && Date.now() - bcbRatesCache.ts < BCB_CACHE_TTL) {
    return { selic: bcbRatesCache.selic, cdi: bcbRatesCache.cdi, ipca: bcbRatesCache.ipca };
  }
  try {
    const res = await fetch(`${API_URL}/bcb/rates`);
    if (res.ok) {
      const data = await res.json();
      const rates = {
        selic: data.selic?.taxa ?? null,
        cdi:   data.cdi?.taxa   ?? null,
        ipca:  data.ipca?.taxa  ?? null,
        ts:    Date.now(),
      };
      bcbRatesCache = rates;
      return rates;
    }
  } catch {
    // silencioso — fallback Brapi
  }

  // Fallback: Brapi prime-rate para Selic
  try {
    const res = await fetch(`${API_URL}/brapi/selic`);
    if (res.ok) {
      const data = await res.json();
      const selic = data.prime_rate?.[0]?.value ? parseFloat(data.prime_rate[0].value) : null;
      return { selic, cdi: selic, ipca: null };
    }
  } catch {
    // silencioso
  }
  return { selic: null, cdi: null, ipca: null };
}

// Buscar preço de ação/FII da B3 via Brapi
async function fetchB3StockPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/brapi/quote/${ticker}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].currentPrice || null;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar preço de ${ticker} via Brapi:`, error);
  }
  return null;
}

// Buscar preço de ação americana via Finnhub
async function fetchUSStockPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/finnhub/stocks/${symbol}/quote`);
    if (res.ok) {
      const data = await res.json();
      return data.currentPrice || data.c || null;
    }
  } catch (error) {
    console.error(`Erro ao buscar preço de ${symbol}:`, error);
  }
  return null;
}

// Buscar preço de criptomoeda via CoinGecko (BRL nativo)
async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/crypto/${symbol}/rate?currency=BRL`);
    if (res.ok) {
      const data = await res.json();
      return data.price || null;
    }
  } catch (error) {
    console.error(`Erro ao buscar preço de ${symbol}:`, error);
  }
  return null;
}


// Função principal para buscar preço de qualquer ativo
// name: nome do ativo (opcional) — usado para calcular taxa CDI de renda fixa
export async function fetchAssetPrice(
  ticker: string,
  category: CategoryId,
  name?: string
): Promise<PriceResult> {
  // Categoria cripto - buscar via CoinGecko (já em BRL)
  if (category === 'cripto') {
    const brlPrice = await fetchCryptoPrice(ticker);
    if (brlPrice) {
      return {
        price: brlPrice,
        currency: 'BRL',
        source: 'CoinGecko',
      };
    }

    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Não conseguimos buscar a cotação dessa cripto agora. Informe o preço manualmente conferindo o valor atual na sua corretora.',
    };
  }

  // Categoria internacional (BDRs) - buscar via Brapi (são listados na B3), fallback Finnhub
  if (category === 'internacional') {
    // Tentar via Brapi (BDRs são negociados na B3)
    const brapiPrice = await fetchB3StockPrice(ticker);
    if (brapiPrice) {
      return {
        price: brapiPrice,
        currency: 'BRL',
        source: `Brapi (${ticker})`,
      };
    }

    // Fallback: buscar ação americana correspondente via Finnhub
    const usSymbol = BDR_TO_US_SYMBOL[ticker] || ticker;
    const usPrice = await fetchUSStockPrice(usSymbol);
    if (usPrice) {
      const usdBrl = await fetchUsdToBrl();
      return {
        price: usPrice * usdBrl,
        currency: 'BRL',
        source: `Finnhub (${usSymbol})`,
      };
    }

    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Não conseguimos buscar a cotação desse BDR agora. Informe o preço manualmente conferindo o valor atual na sua corretora.',
    };
  }

  // Renda variável - ações e ETFs da B3 via Brapi
  if (category === 'renda_variavel') {
    const brapiPrice = await fetchB3StockPrice(ticker);
    if (brapiPrice) {
      return {
        price: brapiPrice,
        currency: 'BRL',
        source: `Brapi (${ticker})`,
      };
    }

    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Não conseguimos buscar a cotação agora. Verifique o ticker e informe o preço manualmente conferindo o valor atual na sua corretora.',
    };
  }

  // FIIs - Fundos Imobiliários via Brapi
  if (category === 'fiis') {
    const brapiPrice = await fetchB3StockPrice(ticker);
    if (brapiPrice) {
      return {
        price: brapiPrice,
        currency: 'BRL',
        source: `Brapi (${ticker})`,
      };
    }

    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Não conseguimos buscar a cotação desse FII agora. Informe o preço manualmente conferindo o valor atual na sua corretora.',
    };
  }

  // Renda Fixa (CDB, LCI, LCA, Debêntures)
  // Se o nome contiver "XXX% CDI" (ex: "120% CDI"), calcula CDI × multiplicador automaticamente
  const { cdi, selic } = await fetchBCBRates();
  const taxaBase = cdi ?? selic;

  // Regex: captura "120% CDI", "100 % do CDI", "110%CDI", etc.
  const cdiMatch = name?.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:do\s+)?CDI/i);
  if (cdiMatch && taxaBase !== null) {
    const percentualCDI = parseFloat(cdiMatch[1].replace(',', '.'));
    const taxaCalculada = parseFloat((taxaBase * percentualCDI / 100).toFixed(2));
    return {
      price: taxaCalculada,
      currency: 'BRL',
      source: `BCB SGS (CDI ${taxaBase.toFixed(2)}% × ${percentualCDI.toFixed(0)}%)`,
    };
  }

  return {
    price: null,
    currency: 'BRL',
    source: 'Manual',
    error: taxaBase !== null
      ? `Informe a taxa contratada. CDI atual (BCB): ${taxaBase.toFixed(2)}% a.a.`
      : 'Informe a taxa contratada manualmente.',
  };
}

// Cores para gráficos
const COLORS = {
  renda_fixa: '#1e3a5f',
  renda_variavel: '#00B8D9',
  fiis: '#10b981',
  internacional: '#6366f1',
};

const CLASS_NAMES: Record<AssetClass, string> = {
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variável',
  fiis: 'Fundos Imobiliários',
  internacional: 'Internacional',
};

// Gerar ID único
function generateId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Mapeia linha do Supabase (snake_case) → Asset (camelCase)
function dbRowToAsset(row: Record<string, unknown>): Asset {
  return {
    id: row.id as string,
    name: row.name as string,
    ticker: row.ticker as string,
    type: row.type as AssetClass,
    quantity: Number(row.quantity),
    averagePrice: Number(row.average_price),
    currentPrice: Number(row.current_price),
    totalValue: Number(row.total_value),
    variation: Number(row.variation),
    broker: row.broker as string,
    percentageOfPortfolio: 0,
    percentageOfProduct: 0,
    createdAt: row.created_at as string | undefined,
  };
}

// Mapeia Asset → payload de insert/update (snake_case para o Supabase)
function assetToDbRow(asset: Asset, userId: string) {
  return {
    id: asset.id,
    user_id: userId,
    name: asset.name,
    ticker: asset.ticker,
    type: asset.type,
    quantity: asset.quantity,
    average_price: asset.averagePrice,
    current_price: asset.currentPrice,
    total_value: asset.totalValue,
    variation: asset.variation,
    broker: asset.broker,
  };
}

// Busca todos os ativos do usuário no Supabase (uso interno)
async function getAllAssetsFromDB(): Promise<Asset[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('portfolio_assets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) { console.error('Erro ao carregar ativos:', error); return []; }
  return (data ?? []).map(dbRowToAsset);
}

// Adicionar novo ativo
export async function addAsset(assetData: {
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  class: AssetClass;
  broker: string;
}): Promise<Asset> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Renda Fixa e Tesouro: quantity = R$ investido, averagePrice = taxa (%).
  // currentPrice nasce igual ao averagePrice; a primeira execucao de
  // refreshAllPrices() vai puxar o preco real e atualizar.
  const isFixedIncome = assetData.class === 'renda_fixa';
  const currentPrice = assetData.averagePrice;
  const totalValue = isFixedIncome ? assetData.quantity : assetData.quantity * currentPrice;
  const variationPercent = 0;

  const newAsset: Asset = {
    id: generateId(),
    ticker: assetData.ticker,
    name: assetData.name,
    type: assetData.class,
    quantity: assetData.quantity,
    averagePrice: assetData.averagePrice,
    currentPrice,
    totalValue,
    percentageOfPortfolio: 0,
    percentageOfProduct: 0,
    variation: variationPercent,
    broker: assetData.broker,
  };

  const { error } = await supabase.from('portfolio_assets').insert(assetToDbRow(newAsset, user.id));
  if (error) { console.error('Erro ao adicionar ativo:', error); throw error; }
  return newAsset;
}

// Remove asset
export async function removeAsset(assetId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('portfolio_assets').delete().eq('id', assetId).eq('user_id', user.id);
  if (error) console.error('Erro ao remover ativo:', error);
}

// Update asset
export async function updateAsset(assetId: string, updates: Partial<Asset>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name          !== undefined) dbUpdates.name          = updates.name;
  if (updates.ticker        !== undefined) dbUpdates.ticker        = updates.ticker;
  if (updates.type          !== undefined) dbUpdates.type          = updates.type;
  if (updates.quantity      !== undefined) dbUpdates.quantity      = updates.quantity;
  if (updates.averagePrice  !== undefined) dbUpdates.average_price = updates.averagePrice;
  if (updates.currentPrice  !== undefined) dbUpdates.current_price = updates.currentPrice;
  if (updates.totalValue    !== undefined) dbUpdates.total_value   = updates.totalValue;
  if (updates.variation     !== undefined) dbUpdates.variation     = updates.variation;
  if (updates.broker        !== undefined) dbUpdates.broker        = updates.broker;
  const { error } = await supabase
    .from('portfolio_assets').update(dbUpdates).eq('id', assetId).eq('user_id', user.id);
  if (error) console.error('Erro ao atualizar ativo:', error);
}

// Calculate portfolio data from saved assets
export function calculatePortfolioData(assets: Asset[]): PortfolioData {
  if (assets.length === 0) {
    return {
      summary: {
        totalValue: 0,
        totalInvested: 0,
        totalProfit: 0,
        profitPercentage: 0,
        lastUpdate: new Date().toISOString(),
      },
      byClass: [],
      byProduct: {
        rendaFixa: [],
        rendaVariavel: [],
        fiis: [],
        internacional: [],
      },
      byBroker: [],
    };
  }

  // Calculate totals
  const totalValue = assets.reduce((sum, a) => sum + a.totalValue, 0);
  // Renda fixa: quantity = R$ investido, averagePrice = taxa (%) — não multiplicar
  const totalInvested = assets.reduce((sum, a) =>
    sum + (a.type === 'renda_fixa' ? a.quantity : a.quantity * a.averagePrice), 0);
  const totalProfit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Group by class
  const byClassMap: Record<AssetClass, number> = {
    renda_fixa: 0,
    renda_variavel: 0,
    fiis: 0,
    internacional: 0,
  };

  // Group by broker
  const byBrokerMap: Record<string, number> = {};

  // Organize by product
  const byProduct: PortfolioData['byProduct'] = {
    rendaFixa: [],
    rendaVariavel: [],
    fiis: [],
    internacional: [],
  };

  assets.forEach(asset => {
    // Update class totals
    byClassMap[asset.type] += asset.totalValue;

    // Update broker totals
    byBrokerMap[asset.broker] = (byBrokerMap[asset.broker] || 0) + asset.totalValue;

    // Update percentages
    asset.percentageOfPortfolio = totalValue > 0 ? (asset.totalValue / totalValue) * 100 : 0;

    // Add to product category
    switch (asset.type) {
      case 'renda_fixa':
        byProduct.rendaFixa.push(asset);
        break;
      case 'renda_variavel':
        byProduct.rendaVariavel.push(asset);
        break;
      case 'fiis':
        byProduct.fiis.push(asset);
        break;
      case 'internacional':
        byProduct.internacional.push(asset);
        break;
    }
  });

  // Calculate product percentages
  Object.values(byProduct).forEach(productAssets => {
    const productTotal = productAssets.reduce((sum, a) => sum + a.totalValue, 0);
    productAssets.forEach(asset => {
      asset.percentageOfProduct = productTotal > 0 ? (asset.totalValue / productTotal) * 100 : 0;
    });
  });

  // Convert class map to array
  const byClass: AssetClassData[] = (Object.keys(byClassMap) as AssetClass[])
    .filter(key => byClassMap[key] > 0)
    .map(key => ({
      name: CLASS_NAMES[key],
      value: byClassMap[key],
      percentage: totalValue > 0 ? (byClassMap[key] / totalValue) * 100 : 0,
      color: COLORS[key],
    }));

  // Convert broker map to array
  const byBroker: Broker[] = Object.entries(byBrokerMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    summary: {
      totalValue,
      totalInvested,
      totalProfit,
      profitPercentage,
      lastUpdate: new Date().toISOString(),
    },
    byClass,
    byProduct,
    byBroker,
  };
}

// Service functions
export async function getPortfolioData(): Promise<PortfolioData> {
  const savedAssets = await getAllAssetsFromDB();
  return calculatePortfolioData(savedAssets);
}

// Get all assets
export async function getAllAssets(): Promise<Asset[]> {
  return getAllAssetsFromDB();
}

// ── Refresh de preços com cache ───────────────────────────────────────────────
const PRICE_CACHE_KEY = 'nuvary_price_cache_ts';
const PRICE_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

// Tipos que têm preço de mercado (renda fixa usa taxa fixa, não precisa refresh)
const MARKET_PRICE_TYPES: CategoryId[] = ['renda_variavel', 'fiis', 'internacional', 'cripto'];

export async function refreshAllPrices(force = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Verifica cache
  const lastUpdate = localStorage.getItem(PRICE_CACHE_KEY);
  const now = Date.now();
  if (!force && lastUpdate && now - parseInt(lastUpdate) < PRICE_CACHE_TTL) {
    return false; // cache ainda válido
  }

  const assets = await getAllAssetsFromDB();
  const toRefresh = assets.filter(a => MARKET_PRICE_TYPES.includes(a.type));

  if (toRefresh.length === 0) {
    localStorage.setItem(PRICE_CACHE_KEY, now.toString());
    return true;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Busca todos os preços em paralelo (antes era em série, somando latências).
  // Portfolios típicos têm poucos ativos de mercado, dentro dos limites das APIs.
  await Promise.all(
    toRefresh.map(async (asset) => {
      try {
        const result = await fetchAssetPrice(asset.ticker, asset.type as CategoryId, asset.name);
        if (!result.price || result.price <= 0) return;

        // Sanity check: rejeita preco que diverge da ordem de grandeza do
        // averagePrice (provavel erro de API ou conversao de moeda errada).
        // Ex: BTC averagePrice R$ 500k e API retorna R$ 30 — preserva o valor
        // anterior em vez de poluir a carteira e disparar alerta falso.
        if (asset.averagePrice > 0) {
          const ratio = result.price / asset.averagePrice;
          if (ratio < 0.05 || ratio > 20) {
            console.warn(
              `[refreshAllPrices] preco suspeito para ${asset.ticker}: ${result.price} vs averagePrice ${asset.averagePrice} (ratio ${ratio.toFixed(3)}). Update ignorado.`,
            );
            return;
          }
        }

        const variation = asset.averagePrice > 0
          ? ((result.price - asset.averagePrice) / asset.averagePrice) * 100
          : 0;
        const totalValue = asset.quantity * result.price;
        const { error } = await supabase
          .from('portfolio_assets')
          .update({ current_price: result.price, total_value: totalValue, variation })
          .eq('id', asset.id)
          .eq('user_id', user.id);
        if (error) console.error(`Erro ao atualizar preço de ${asset.ticker}:`, error);
      } catch {
        // silencioso — mantém preço anterior
      }
    }),
  );

  localStorage.setItem(PRICE_CACHE_KEY, now.toString());

  // Verifica alertas de variação após atualizar preços
  try {
    const { checkAlertsForAssets } = await import('./alertasService');
    const fresh = await getAllAssetsFromDB();
    await checkAlertsForAssets(fresh);
  } catch (e) {
    console.error('Erro ao verificar alertas de variação:', e);
  }

  return true;
}

// ── Transactions ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  tipo: 'compra' | 'venda';
  ticker: string;
  name: string;
  asset_type: string;
  quantity: number;
  price: number;
  total_value: number;
  cost_basis?: number;
  created_at: string;
}

export async function saveTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('portfolio_transactions').insert({ ...data, user_id: user.id });
  if (error) console.error('Erro ao salvar transação:', error);
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('portfolio_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) console.error('Erro ao buscar transações:', error);
  return data ?? [];
}

// Format currency — sempre 2 casas decimais (R$ 1.234,56)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Clear all portfolio data
export async function clearPortfolio(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('portfolio_assets').delete().eq('user_id', user.id);
  if (error) console.error('Erro ao limpar carteira:', error);
}

// Migração única: move dados do localStorage para o Supabase
export async function migrateLocalStorageToSupabase(): Promise<void> {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Evita duplicação se o usuário já tem ativos no Supabase
  const { count } = await supabase
    .from('portfolio_assets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (count && count > 0) { localStorage.removeItem(STORAGE_KEY); return; }

  let localAssets: Asset[] = [];
  try { localAssets = JSON.parse(raw); } catch { localStorage.removeItem(STORAGE_KEY); return; }
  if (localAssets.length === 0) { localStorage.removeItem(STORAGE_KEY); return; }

  const { error } = await supabase
    .from('portfolio_assets')
    .insert(localAssets.map(a => assetToDbRow(a, user.id)));

  if (!error) {
    localStorage.removeItem(STORAGE_KEY);
    console.info(`Migração concluída: ${localAssets.length} ativo(s) → Supabase`);
  }
}
