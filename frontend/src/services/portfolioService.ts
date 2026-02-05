// Portfolio Service - Mock data for demonstration
// In production, this would connect to real brokerage APIs

export interface AssetClass {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: 'renda_fixa' | 'renda_variavel' | 'fii' | 'internacional' | 'cripto';
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
  byClass: AssetClass[];
  byProduct: {
    rendaFixa: Asset[];
    rendaVariavel: Asset[];
    fiis: Asset[];
    internacional: Asset[];
  };
  byBroker: Broker[];
}

// Colors for charts
const COLORS = {
  rendaFixa: '#1e3a5f',
  rendaVariavel: '#00B8D9',
  fiis: '#10b981',
  internacional: '#6366f1',
  cripto: '#f59e0b',
};

// Mock portfolio data
const mockPortfolioData: PortfolioData = {
  summary: {
    totalValue: 45892.47,
    totalInvested: 42500.00,
    totalProfit: 3392.47,
    profitPercentage: 7.98,
    lastUpdate: new Date().toISOString(),
  },
  byClass: [
    {
      name: 'Renda Fixa',
      value: 25430.28,
      percentage: 55.4,
      color: COLORS.rendaFixa,
    },
    {
      name: 'Renda Variavel',
      value: 12580.50,
      percentage: 27.4,
      color: COLORS.rendaVariavel,
    },
    {
      name: 'Fundos Imobiliarios',
      value: 5265.81,
      percentage: 11.5,
      color: COLORS.fiis,
    },
    {
      name: 'Internacional',
      value: 2615.88,
      percentage: 5.7,
      color: COLORS.internacional,
    },
  ],
  byProduct: {
    rendaFixa: [
      {
        id: '1',
        name: 'Tesouro Selic 2029',
        ticker: 'SELIC29',
        type: 'renda_fixa',
        quantity: 1,
        averagePrice: 12500.00,
        currentPrice: 13215.45,
        totalValue: 13215.45,
        percentageOfPortfolio: 28.8,
        percentageOfProduct: 52.0,
        variation: 5.72,
        broker: 'Nu Invest',
      },
      {
        id: '2',
        name: 'CDB Banco Inter 120% CDI',
        ticker: 'CDB-INTER',
        type: 'renda_fixa',
        quantity: 1,
        averagePrice: 8000.00,
        currentPrice: 8430.28,
        totalValue: 8430.28,
        percentageOfPortfolio: 18.4,
        percentageOfProduct: 33.2,
        variation: 5.38,
        broker: 'Inter',
      },
      {
        id: '3',
        name: 'LCI Banco do Brasil',
        ticker: 'LCI-BB',
        type: 'renda_fixa',
        quantity: 1,
        averagePrice: 3500.00,
        currentPrice: 3784.55,
        totalValue: 3784.55,
        percentageOfPortfolio: 8.2,
        percentageOfProduct: 14.8,
        variation: 8.13,
        broker: 'BB Investimentos',
      },
    ],
    rendaVariavel: [
      {
        id: '4',
        name: 'Petrobras PN',
        ticker: 'PETR4',
        type: 'renda_variavel',
        quantity: 100,
        averagePrice: 32.50,
        currentPrice: 38.45,
        totalValue: 3845.00,
        percentageOfPortfolio: 8.4,
        percentageOfProduct: 30.6,
        variation: 18.31,
        broker: 'Clear',
      },
      {
        id: '5',
        name: 'Vale ON',
        ticker: 'VALE3',
        type: 'renda_variavel',
        quantity: 50,
        averagePrice: 68.00,
        currentPrice: 62.30,
        totalValue: 3115.00,
        percentageOfPortfolio: 6.8,
        percentageOfProduct: 24.8,
        variation: -8.38,
        broker: 'Clear',
      },
      {
        id: '6',
        name: 'Itau Unibanco PN',
        ticker: 'ITUB4',
        type: 'renda_variavel',
        quantity: 80,
        averagePrice: 28.50,
        currentPrice: 31.25,
        totalValue: 2500.00,
        percentageOfPortfolio: 5.4,
        percentageOfProduct: 19.9,
        variation: 9.65,
        broker: 'Nu Invest',
      },
      {
        id: '7',
        name: 'Banco do Brasil ON',
        ticker: 'BBAS3',
        type: 'renda_variavel',
        quantity: 60,
        averagePrice: 48.00,
        currentPrice: 52.01,
        totalValue: 3120.50,
        percentageOfPortfolio: 6.8,
        percentageOfProduct: 24.8,
        variation: 8.35,
        broker: 'BB Investimentos',
      },
    ],
    fiis: [
      {
        id: '8',
        name: 'CSHG Logistica',
        ticker: 'HGLG11',
        type: 'fii',
        quantity: 15,
        averagePrice: 160.00,
        currentPrice: 168.45,
        totalValue: 2526.75,
        percentageOfPortfolio: 5.5,
        percentageOfProduct: 48.0,
        variation: 5.28,
        broker: 'Clear',
      },
      {
        id: '9',
        name: 'XP Malls',
        ticker: 'XPML11',
        type: 'fii',
        quantity: 25,
        averagePrice: 98.00,
        currentPrice: 109.56,
        totalValue: 2739.06,
        percentageOfPortfolio: 6.0,
        percentageOfProduct: 52.0,
        variation: 11.80,
        broker: 'Nu Invest',
      },
    ],
    internacional: [
      {
        id: '10',
        name: 'Apple Inc BDR',
        ticker: 'AAPL34',
        type: 'internacional',
        quantity: 20,
        averagePrice: 52.00,
        currentPrice: 58.42,
        totalValue: 1168.40,
        percentageOfPortfolio: 2.5,
        percentageOfProduct: 44.7,
        variation: 12.35,
        broker: 'Nu Invest',
      },
      {
        id: '11',
        name: 'Microsoft BDR',
        ticker: 'MSFT34',
        type: 'internacional',
        quantity: 15,
        averagePrice: 78.00,
        currentPrice: 82.45,
        totalValue: 1236.75,
        percentageOfPortfolio: 2.7,
        percentageOfProduct: 47.3,
        variation: 5.71,
        broker: 'Inter',
      },
      {
        id: '12',
        name: 'Amazon BDR',
        ticker: 'AMZO34',
        type: 'internacional',
        quantity: 5,
        averagePrice: 38.00,
        currentPrice: 42.15,
        totalValue: 210.73,
        percentageOfPortfolio: 0.5,
        percentageOfProduct: 8.0,
        variation: 10.92,
        broker: 'Inter',
      },
    ],
  },
  byBroker: [
    {
      name: 'Nu Invest',
      value: 20670.35,
      percentage: 45.0,
    },
    {
      name: 'Clear Corretora',
      value: 12006.75,
      percentage: 26.2,
    },
    {
      name: 'Inter',
      value: 9877.76,
      percentage: 21.5,
    },
    {
      name: 'BB Investimentos',
      value: 3337.61,
      percentage: 7.3,
    },
  ],
};

// Service functions
export async function getPortfolioData(): Promise<PortfolioData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPortfolioData;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPortfolioData.summary;
}

export async function getPortfolioByClass(): Promise<AssetClass[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPortfolioData.byClass;
}

export async function getPortfolioByBroker(): Promise<Broker[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPortfolioData.byBroker;
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
