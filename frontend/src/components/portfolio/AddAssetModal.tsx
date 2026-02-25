'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, DollarSign, Hash, Building2, ChevronLeft,
  Landmark, TrendingUp, Building, Globe, Coins, PiggyBank,
  Search, Loader2, AlertCircle, CheckCircle, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetClass, CategoryId, fetchAssetPrice, PriceResult } from '@/services/portfolioService';
import { STRINGS } from '@/constants/strings';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: NewAssetData) => void;
  initialCategory?: string | null;
}

export interface NewAssetData {
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  class: AssetClass;
  broker: string;
}

// Categorias de investimento
const CATEGORIES = [
  {
    id: 'renda_fixa',
    name: 'Renda Fixa',
    description: 'CDBs, LCIs, LCAs e Debêntures',
    icon: PiggyBank,
    color: '#1e3a5f',
  },
  {
    id: 'tesouro',
    name: 'Tesouro Direto',
    description: 'Títulos públicos federais',
    icon: Landmark,
    color: '#047857',
  },
  {
    id: 'renda_variavel',
    name: 'Renda Variável',
    description: 'Ações, ETFs e BDRs',
    icon: TrendingUp,
    color: '#6366f1',
  },
  {
    id: 'fiis',
    name: 'Fundos Imobiliários',
    description: 'FIIs listados na B3',
    icon: Building,
    color: '#10b981',
  },
  {
    id: 'internacional',
    name: 'Internacional',
    description: 'BDRs e ETFs globais',
    icon: Globe,
    color: '#00B8D9',
  },
  {
    id: 'cripto',
    name: 'Criptomoedas',
    description: 'Bitcoin, Ethereum e altcoins',
    icon: Coins,
    color: '#f59e0b',
  },
];

// Ativos pré-definidos por categoria
const ASSETS_BY_CATEGORY: Record<string, { ticker: string; name: string }[]> = {
  renda_fixa: [
    { ticker: 'CDB-INTER', name: 'CDB Banco Inter 120% CDI' },
    { ticker: 'CDB-NUBANK', name: 'CDB Nubank 100% CDI' },
    { ticker: 'CDB-XP', name: 'CDB XP 110% CDI' },
    { ticker: 'LCI-BB', name: 'LCI Banco do Brasil' },
    { ticker: 'LCI-ITAU', name: 'LCI Itau' },
    { ticker: 'LCA-BRADESCO', name: 'LCA Bradesco' },
    { ticker: 'LCA-SANTANDER', name: 'LCA Santander' },
    { ticker: 'DEB-VALE', name: 'Debenture Vale' },
    { ticker: 'CRI-CSHG', name: 'CRI CSHG' },
    { ticker: 'CRA-RAIZEN', name: 'CRA Raizen' },
  ],
  tesouro: [
    // Tesouro Selic
    { ticker: 'SELIC-2026', name: 'Tesouro Selic 2026' },
    { ticker: 'SELIC-2027', name: 'Tesouro Selic 2027' },
    { ticker: 'SELIC-2029', name: 'Tesouro Selic 2029' },
    { ticker: 'SELIC-2031', name: 'Tesouro Selic 2031' },
    // Tesouro IPCA+
    { ticker: 'IPCA-2029', name: 'Tesouro IPCA+ 2029' },
    { ticker: 'IPCA-2035', name: 'Tesouro IPCA+ 2035' },
    { ticker: 'IPCA-2045', name: 'Tesouro IPCA+ 2045' },
    // Tesouro Prefixado
    { ticker: 'PREFIXADO-2026', name: 'Tesouro Prefixado 2026' },
    { ticker: 'PREFIXADO-2027', name: 'Tesouro Prefixado 2027' },
    { ticker: 'PREFIXADO-2029', name: 'Tesouro Prefixado 2029' },
    { ticker: 'PREFIXADO-2031', name: 'Tesouro Prefixado 2031' },
    // Tesouro Educa+ e RendA+
    { ticker: 'EDUCA-2031', name: 'Tesouro Educa+ 2031' },
    { ticker: 'EDUCA-2035', name: 'Tesouro Educa+ 2035' },
    { ticker: 'RENDA-2030', name: 'Tesouro RendA+ 2030' },
  ],
  renda_variavel: [
    { ticker: 'PETR4', name: 'Petrobras PN' },
    { ticker: 'VALE3', name: 'Vale ON' },
    { ticker: 'ITUB4', name: 'Itau Unibanco PN' },
    { ticker: 'BBDC4', name: 'Bradesco PN' },
    { ticker: 'BBAS3', name: 'Banco do Brasil ON' },
    { ticker: 'ABEV3', name: 'Ambev ON' },
    { ticker: 'WEGE3', name: 'WEG ON' },
    { ticker: 'RENT3', name: 'Localiza ON' },
    { ticker: 'MGLU3', name: 'Magazine Luiza ON' },
    { ticker: 'SUZB3', name: 'Suzano ON' },
    { ticker: 'JBSS3', name: 'JBS ON' },
    { ticker: 'GGBR4', name: 'Gerdau PN' },
    { ticker: 'CSNA3', name: 'CSN ON' },
    { ticker: 'USIM5', name: 'Usiminas PNA' },
    { ticker: 'CPLE6', name: 'Copel PNB' },
    { ticker: 'ELET3', name: 'Eletrobras ON' },
    { ticker: 'SBSP3', name: 'Sabesp ON' },
    { ticker: 'VIVT3', name: 'Telefonica Brasil ON' },
    { ticker: 'BOVA11', name: 'iShares Ibovespa ETF' },
    { ticker: 'IVVB11', name: 'iShares S&P 500 ETF' },
    { ticker: 'SMAL11', name: 'iShares Small Cap ETF' },
    { ticker: 'HASH11', name: 'Hashdex Crypto ETF' },
  ],
  fiis: [
    { ticker: 'HGLG11', name: 'CSHG Logística' },
    { ticker: 'XPML11', name: 'XP Malls' },
    { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária' },
    { ticker: 'MXRF11', name: 'Maxi Renda' },
    { ticker: 'VISC11', name: 'Vinci Shopping Centers' },
    { ticker: 'BTLG11', name: 'BTG Pactual Logística' },
    { ticker: 'HGBS11', name: 'Hedge Brasil Shopping' },
    { ticker: 'HSML11', name: 'HSI Malls' },
    { ticker: 'VILG11', name: 'Vinci Logística' },
    { ticker: 'PVBI11', name: 'VBI Prime Properties' },
    { ticker: 'RECT11', name: 'REC Recebíveis' },
    { ticker: 'KNCR11', name: 'Kinea Rendimentos' },
    { ticker: 'HGCR11', name: 'CSHG Recebíveis' },
    { ticker: 'IRDM11', name: 'Iridium Recebíveis' },
  ],
  internacional: [
    { ticker: 'AAPL34', name: 'Apple Inc BDR' },
    { ticker: 'MSFT34', name: 'Microsoft BDR' },
    { ticker: 'AMZO34', name: 'Amazon BDR' },
    { ticker: 'GOGL34', name: 'Alphabet (Google) BDR' },
    { ticker: 'FBOK34', name: 'Meta (Facebook) BDR' },
    { ticker: 'TSLA34', name: 'Tesla BDR' },
    { ticker: 'NVDC34', name: 'Nvidia BDR' },
    { ticker: 'NFLX34', name: 'Netflix BDR' },
    { ticker: 'DISB34', name: 'Disney BDR' },
    { ticker: 'COCA34', name: 'Coca-Cola BDR' },
    { ticker: 'JPMC34', name: 'JP Morgan BDR' },
    { ticker: 'BOAC34', name: 'Bank of America BDR' },
    { ticker: 'IVVB11', name: 'iShares S&P 500 ETF' },
    { ticker: 'SPXI11', name: 'It Now S&P 500 ETF' },
  ],
  cripto: [
    { ticker: 'BTC', name: 'Bitcoin' },
    { ticker: 'ETH', name: 'Ethereum' },
    { ticker: 'BNB', name: 'BNB (Binance Coin)' },
    { ticker: 'SOL', name: 'Solana' },
    { ticker: 'ADA', name: 'Cardano' },
    { ticker: 'XRP', name: 'Ripple' },
    { ticker: 'DOT', name: 'Polkadot' },
    { ticker: 'LINK', name: 'Chainlink' },
    { ticker: 'MATIC', name: 'Polygon' },
    { ticker: 'AVAX', name: 'Avalanche' },
  ],
};

// Mapeamento de categoria para AssetClass
const CATEGORY_TO_CLASS: Record<string, AssetClass> = {
  renda_fixa: 'renda_fixa',
  tesouro: 'renda_fixa',
  renda_variavel: 'renda_variavel',
  fiis: 'fiis',
  internacional: 'internacional',
  cripto: 'renda_variavel', // ou criar uma classe específica
};

const brokers = [
  'XP Investimentos',
  'Clear',
  'Rico',
  'Inter',
  'Nubank',
  'BTG Pactual',
  'Itau',
  'Bradesco',
  'Binance',
  'Mercado Bitcoin',
  'Outro',
];

type Step = 'category' | 'asset' | 'details';

export function AddAssetModal({ isOpen, onClose, onAdd, initialCategory = null }: AddAssetModalProps) {
  const [step, setStep] = useState<Step>(initialCategory ? 'asset' : 'category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedAsset, setSelectedAsset] = useState<{ ticker: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    quantity: 0,
    averagePrice: 0,
    broker: 'XP Investimentos',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para busca de preço automática
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState<PriceResult | null>(null);

  useEffect(() => {
    if (isOpen && initialCategory) {
      setSelectedCategory(initialCategory);
      setStep('asset');
    }
  }, [isOpen, initialCategory]);

  const resetModal = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedAsset(null);
    setSearchTerm('');
    setIsCustom(false);
    setFormData({
      ticker: '',
      name: '',
      quantity: 0,
      averagePrice: 0,
      broker: 'XP Investimentos',
    });
    setErrors({});
    setPriceLoading(false);
    setPriceInfo(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('asset');
  };

  const handleAssetSelect = async (asset: { ticker: string; name: string }) => {
    setSelectedAsset(asset);
    setFormData(prev => ({
      ...prev,
      ticker: asset.ticker,
      name: asset.name,
    }));
    setStep('details');

    // Buscar preço automaticamente
    if (selectedCategory) {
      setPriceLoading(true);
      setPriceInfo(null);
      try {
        const result = await fetchAssetPrice(asset.ticker, selectedCategory as CategoryId, asset.name);
        setPriceInfo(result);
        if (result.price) {
          setFormData(prev => ({
            ...prev,
            averagePrice: parseFloat(result.price!.toFixed(2)),
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar preço:', error);
        setPriceInfo({
          price: null,
          currency: 'BRL',
          source: 'API',
          error: 'Erro ao buscar preço. Informe manualmente.',
        });
      } finally {
        setPriceLoading(false);
      }
    }
  };

  const handleCustomAsset = () => {
    setIsCustom(true);
    setPriceInfo(null);
    setPriceLoading(false);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('asset');
      setSelectedAsset(null);
      setIsCustom(false);
      setFormData(prev => ({ ...prev, ticker: '', name: '', averagePrice: 0 }));
      setPriceLoading(false);
      setPriceInfo(null);
    } else if (step === 'asset') {
      setStep('category');
      setSelectedCategory(null);
      setSearchTerm('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = STRINGS.carteira.tickerObrigatorio;
    }
    if (!formData.name.trim()) {
      newErrors.name = STRINGS.carteira.nomeObrigatorio;
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    if (formData.averagePrice <= 0) {
      newErrors.averagePrice = isFixedIncome
        ? STRINGS.carteira.taxaDeveSerMaior
        : STRINGS.carteira.precoDeveSerMaior;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && selectedCategory) {
      onAdd({
        ticker: formData.ticker.toUpperCase(),
        name: formData.name,
        quantity: formData.quantity,
        averagePrice: formData.averagePrice,
        class: CATEGORY_TO_CLASS[selectedCategory],
        broker: formData.broker,
      });

      handleClose();
    }
  };

  // Renda Fixa e Tesouro usam % (taxa) no lugar de R$ (preço médio)
  const isFixedIncome =
    selectedCategory === 'renda_fixa' || selectedCategory === 'tesouro';

  // Filtrar ativos pela busca
  const filteredAssets = selectedCategory
    ? (ASSETS_BY_CATEGORY[selectedCategory] || []).filter(
        asset =>
          asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  {step !== 'category' && (
                    <button
                      onClick={handleBack}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    {currentCategory ? (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: currentCategory.color }}
                      >
                        <currentCategory.icon className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#00B8D9]/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-[#00B8D9]" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-[#0B1F33]">
                        {step === 'category' && 'Adicionar Ativo'}
                        {step === 'asset' && currentCategory?.name}
                        {step === 'details' && (selectedAsset?.name || 'Ativo Personalizado')}
                      </h2>
                      {step === 'category' && (
                        <p className="text-sm text-[#6B7280]">Selecione a categoria</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 1: Category Selection */}
                  {step === 'category' && (
                    <motion.div
                      key="category"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-5 grid grid-cols-2 gap-3"
                    >
                      {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: category.color }}
                          >
                            <Icon className="w-6 h-6 text-white/80 mb-3" />
                            <h3 className="font-semibold text-white mb-1">
                              {category.name}
                            </h3>
                            <p className="text-sm text-white/70">
                              {category.description}
                            </p>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Step 2: Asset Selection */}
                  {step === 'asset' && (
                    <motion.div
                      key="asset"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-5"
                    >
                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar ativo..."
                          className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9]"
                        />
                      </div>

                      {/* Asset List */}
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {filteredAssets.map((asset) => (
                          <button
                            key={asset.ticker}
                            onClick={() => handleAssetSelect(asset)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#F3F4F6] transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-[#0B1F33]">{asset.name}</p>
                              <p className="text-sm text-[#6B7280]">{asset.ticker}</p>
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${currentCategory?.color}20` }}
                            >
                              <Plus className="w-4 h-4" style={{ color: currentCategory?.color }} />
                            </div>
                          </button>
                        ))}

                        {filteredAssets.length === 0 && searchTerm && (
                          <div className="text-center py-8 text-[#6B7280]">
                            Nenhum ativo encontrado
                          </div>
                        )}
                      </div>

                      {/* Custom Asset Button */}
                      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                        <button
                          onClick={handleCustomAsset}
                          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-[#E5E7EB] hover:border-[#00B8D9] hover:bg-[#00B8D9]/5 transition-colors text-[#6B7280] hover:text-[#00B8D9]"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar ativo personalizado
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Details Form */}
                  {step === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {/* Ticker e Nome (editáveis se custom) */}
                        {isCustom && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-[#0B1F33] mb-1">
                                {STRINGS.carteira.tickerCodigo}
                              </label>
                              <input
                                type="text"
                                value={formData.ticker}
                                onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                                placeholder="Ex: PETR4"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] ${
                                  errors.ticker ? 'border-red-500' : 'border-[#E5E7EB]'
                                }`}
                              />
                              {errors.ticker && (
                                <p className="text-red-500 text-sm mt-1">{errors.ticker}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#0B1F33] mb-1">
                                Nome do Ativo
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Petrobras PN"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] ${
                                  errors.name ? 'border-red-500' : 'border-[#E5E7EB]'
                                }`}
                              />
                              {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                              )}
                            </div>
                          </>
                        )}

                        {/* Info do ativo selecionado */}
                        {!isCustom && selectedAsset && (
                          <div className="bg-[#F3F4F6] rounded-lg p-4 flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: currentCategory?.color }}
                            >
                              {currentCategory && <currentCategory.icon className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0B1F33]">{selectedAsset.name}</p>
                              <p className="text-sm text-[#6B7280]">{selectedAsset.ticker}</p>
                            </div>
                          </div>
                        )}

                        {/* Quantidade / Valor Investido e Preço / Taxa */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#0B1F33] mb-1">
                              {isFixedIncome ? STRINGS.carteira.valorInvestido : 'Quantidade'}
                            </label>
                            <div className="relative">
                              {isFixedIncome ? (
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                              ) : (
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                              )}
                              <input
                                type="number"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                                placeholder={isFixedIncome ? '0.00' : '0'}
                                min="0"
                                step="0.01"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] ${
                                  errors.quantity ? 'border-red-500' : 'border-[#E5E7EB]'
                                }`}
                              />
                            </div>
                            {errors.quantity && (
                              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#0B1F33] mb-1">
                              {isFixedIncome ? STRINGS.carteira.taxaContratada : STRINGS.carteira.precoMedio}
                            </label>
                            <div className="relative">
                              {priceLoading ? (
                                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00B8D9] animate-spin" />
                              ) : isFixedIncome ? (
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                              ) : (
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                              )}
                              <input
                                type="number"
                                value={formData.averagePrice || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, averagePrice: parseFloat(e.target.value) || 0 }))}
                                placeholder={priceLoading ? 'Buscando...' : isFixedIncome ? 'Ex: 120' : '0.00'}
                                min="0"
                                step="0.01"
                                disabled={priceLoading}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] ${
                                  errors.averagePrice ? 'border-red-500' : 'border-[#E5E7EB]'
                                } ${priceLoading ? 'bg-gray-50' : ''}`}
                              />
                            </div>
                            {errors.averagePrice && (
                              <p className="text-red-500 text-sm mt-1">{errors.averagePrice}</p>
                            )}
                          </div>
                        </div>

                        {/* Status de busca do preço / taxa */}
                        {!isCustom && priceInfo && (
                          <div className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
                            priceInfo.price
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {priceInfo.price ? (
                              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            )}
                            <span>
                              {priceInfo.price
                                ? isFixedIncome
                                  ? `Taxa obtida via ${priceInfo.source}: ${priceInfo.price.toFixed(2)}% a.a. — você pode ajustar conforme contrato.`
                                  : `${STRINGS.carteira.precoObtidoVia} ${priceInfo.source}`
                                : priceInfo.error || (isFixedIncome
                                    ? STRINGS.carteira.taxaNaoDisponivel
                                    : STRINGS.carteira.precoNaoDisponivel)}
                            </span>
                          </div>
                        )}

                        {/* Corretora */}
                        <div>
                          <label className="block text-sm font-medium text-[#0B1F33] mb-1">
                            Corretora
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                            <select
                              value={formData.broker}
                              onChange={(e) => setFormData(prev => ({ ...prev, broker: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] bg-white"
                            >
                              {brokers.map((broker) => (
                                <option key={broker} value={broker}>
                                  {broker}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Valor Total Preview */}
                        {formData.quantity > 0 && formData.averagePrice > 0 && (
                          <div className="bg-gradient-to-r from-[#0B1F33] to-[#1e3a5f] rounded-lg p-4 text-white">
                            {isFixedIncome ? (
                              <>
                                <p className="text-sm text-white/70">{STRINGS.carteira.valorTotalAplicado}</p>
                                <p className="text-2xl font-bold">
                                  R$ {formData.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-white/60 mt-1">
                                  Taxa contratada: {formData.averagePrice.toFixed(2)}% a.a.
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-white/70">Valor Total Investido</p>
                                <p className="text-2xl font-bold">
                                  R$ {(formData.quantity * formData.averagePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </>
                            )}
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-[#00B8D9] hover:bg-[#007EA7]"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
