// Portfolio Service - With localStorage persistence
// In production, this would connect to real brokerage APIs

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type AssetClass = 'renda_fixa' | 'renda_variavel' | 'fiis' | 'internacional';
export type CategoryId = 'renda_fixa' | 'tesouro' | 'renda_variavel' | 'fiis' | 'internacional' | 'cripto';

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

// Mapeamento de BDRs para simbolos americanos
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

// Cotacao do dolar (aproximada, em producao buscar de API forex)
const USD_TO_BRL = 5.0;

export interface PriceResult {
  price: number | null;
  currency: 'BRL' | 'USD';
  source: string;
  error?: string;
}

// Buscar preco de acao americana via Finnhub
async function fetchUSStockPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/finnhub/stocks/${symbol}/quote`);
    if (res.ok) {
      const data = await res.json();
      return data.currentPrice || data.c || null;
    }
  } catch (error) {
    console.error(`Erro ao buscar preco de ${symbol}:`, error);
  }
  return null;
}

// Buscar preco de criptomoeda via Alpha Vantage
async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_URL}/crypto/${symbol}/rate?currency=USD`);
    if (res.ok) {
      const data = await res.json();
      return data.price || null;
    }
  } catch (error) {
    console.error(`Erro ao buscar preco de ${symbol}:`, error);
  }
  return null;
}

// Funcao principal para buscar preco de qualquer ativo
export async function fetchAssetPrice(
  ticker: string,
  category: CategoryId
): Promise<PriceResult> {
  // Categoria cripto - buscar preco em USD e converter para BRL
  if (category === 'cripto') {
    const price = await fetchCryptoPrice(ticker);
    if (price) {
      return {
        price: price * USD_TO_BRL, // Converter USD para BRL
        currency: 'BRL',
        source: 'Alpha Vantage (Crypto)',
      };
    }
    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Preco nao disponivel para esta criptomoeda',
    };
  }

  // Categoria internacional (BDRs) - buscar preco do ativo americano correspondente
  if (category === 'internacional') {
    const usSymbol = BDR_TO_US_SYMBOL[ticker] || ticker;
    const price = await fetchUSStockPrice(usSymbol);
    if (price) {
      // BDRs tem proporcao diferente, mas para simplificar usamos conversao direta
      // Em producao, verificar a proporcao especifica de cada BDR
      return {
        price: price * USD_TO_BRL,
        currency: 'BRL',
        source: `Finnhub (${usSymbol})`,
      };
    }
    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Preco nao disponivel. As APIs gratuitas suportam apenas acoes americanas.',
    };
  }

  // Para renda variavel, tentar buscar se for ETF internacional
  if (category === 'renda_variavel') {
    // ETFs internacionais listados na B3
    if (['IVVB11', 'SPXI11', 'BOVA11', 'SMAL11', 'HASH11'].includes(ticker)) {
      const usSymbol = BDR_TO_US_SYMBOL[ticker];
      if (usSymbol) {
        const price = await fetchUSStockPrice(usSymbol);
        if (price) {
          return {
            price: price * USD_TO_BRL,
            currency: 'BRL',
            source: `Finnhub (${usSymbol})`,
          };
        }
      }
    }
    // Acoes brasileiras nao sao suportadas pelas APIs gratuitas
    return {
      price: null,
      currency: 'BRL',
      source: 'API',
      error: 'Acoes da B3 nao suportadas. Informe o preco manualmente.',
    };
  }

  // Renda fixa, tesouro e FIIs - nao tem cotacao em APIs de mercado
  return {
    price: null,
    currency: 'BRL',
    source: 'Manual',
    error: category === 'fiis'
      ? 'FIIs da B3 nao suportados. Informe o preco manualmente.'
      : 'Informe o preco manualmente.',
  };
}

// Colors for charts
const COLORS = {
  renda_fixa: '#1e3a5f',
  renda_variavel: '#00B8D9',
  fiis: '#10b981',
  internacional: '#6366f1',
};

const CLASS_NAMES: Record<AssetClass, string> = {
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variavel',
  fiis: 'Fundos Imobiliarios',
  internacional: 'Internacional',
};

// Generate unique ID
function generateId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Load assets from localStorage
export function loadSavedAssets(): Asset[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao carregar ativos:', error);
  }
  return [];
}

// Save assets to localStorage
export function saveAssets(assets: Asset[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (error) {
    console.error('Erro ao salvar ativos:', error);
  }
}

// Add new asset
export function addAsset(assetData: {
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  class: AssetClass;
  broker: string;
}): Asset {
  const assets = loadSavedAssets();

  // Simulate current price (in production, fetch from API)
  const variationPercent = (Math.random() * 20) - 5; // -5% to +15%
  const currentPrice = assetData.averagePrice * (1 + variationPercent / 100);

  const newAsset: Asset = {
    id: generateId(),
    ticker: assetData.ticker,
    name: assetData.name,
    type: assetData.class,
    quantity: assetData.quantity,
    averagePrice: assetData.averagePrice,
    currentPrice: currentPrice,
    totalValue: assetData.quantity * currentPrice,
    percentageOfPortfolio: 0, // Will be calculated
    percentageOfProduct: 0, // Will be calculated
    variation: variationPercent,
    broker: assetData.broker,
  };

  assets.push(newAsset);
  saveAssets(assets);

  return newAsset;
}

// Remove asset
export function removeAsset(assetId: string): void {
  const assets = loadSavedAssets();
  const filtered = assets.filter(a => a.id !== assetId);
  saveAssets(filtered);
}

// Update asset
export function updateAsset(assetId: string, updates: Partial<Asset>): void {
  const assets = loadSavedAssets();
  const index = assets.findIndex(a => a.id === assetId);

  if (index !== -1) {
    assets[index] = { ...assets[index], ...updates };
    // Recalculate total value if quantity or price changed
    if (updates.quantity !== undefined || updates.currentPrice !== undefined) {
      assets[index].totalValue = assets[index].quantity * assets[index].currentPrice;
    }
    saveAssets(assets);
  }
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
  const totalInvested = assets.reduce((sum, a) => sum + (a.quantity * a.averagePrice), 0);
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const savedAssets = loadSavedAssets();
  return calculatePortfolioData(savedAssets);
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const savedAssets = loadSavedAssets();
  const data = calculatePortfolioData(savedAssets);
  return data.summary;
}

export async function getPortfolioByClass(): Promise<AssetClassData[]> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const savedAssets = loadSavedAssets();
  const data = calculatePortfolioData(savedAssets);
  return data.byClass;
}

export async function getPortfolioByBroker(): Promise<Broker[]> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const savedAssets = loadSavedAssets();
  const data = calculatePortfolioData(savedAssets);
  return data.byBroker;
}

// Get all saved assets
export async function getAllAssets(): Promise<Asset[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return loadSavedAssets();
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Clear all portfolio data
export function clearPortfolio(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
