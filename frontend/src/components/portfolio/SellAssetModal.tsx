'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Asset, formatCurrency } from '@/services/portfolioService';

interface SellAssetModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSell: (assetId: string, quantidadeVendida: number, vendaTotal: boolean) => Promise<void>;
}

const FIXED_INCOME_TYPES = ['renda_fixa'];

export function SellAssetModal({ asset, onClose, onSell }: SellAssetModalProps) {
  const [quantidade, setQuantidade] = useState('');
  const [vendaTotal, setVendaTotal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!asset) return null;

  const isFixedIncome = FIXED_INCOME_TYPES.includes(asset.type);
  const maxQuantidade = isFixedIncome ? asset.totalValue : asset.quantity;
  const quantidadeNum = parseFloat(quantidade.replace(',', '.')) || 0;

  const handleVendaTotal = () => {
    setVendaTotal(true);
    setQuantidade(maxQuantidade.toString());
    setErro('');
  };

  const handleQuantidadeChange = (v: string) => {
    setVendaTotal(false);
    setErro('');
    // permite apenas números e vírgula/ponto
    if (/^[\d.,]*$/.test(v)) setQuantidade(v);
  };

  const handleConfirm = async () => {
    const qtd = vendaTotal ? maxQuantidade : quantidadeNum;
    if (!qtd || qtd <= 0) {
      setErro(isFixedIncome ? 'Informe o valor a resgatar.' : 'Informe a quantidade a vender.');
      return;
    }
    if (qtd > maxQuantidade) {
      setErro(isFixedIncome
        ? `Valor máximo disponível: ${formatCurrency(maxQuantidade)}`
        : `Quantidade máxima disponível: ${maxQuantidade}`
      );
      return;
    }
    setLoading(true);
    setErro('');
    try {
      await onSell(asset.id, qtd, vendaTotal || qtd >= maxQuantidade);
      onClose();
    } catch {
      setErro('Erro ao registrar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const valorResultante = isFixedIncome
    ? asset.totalValue - (vendaTotal ? maxQuantidade : quantidadeNum)
    : (asset.quantity - (vendaTotal ? maxQuantidade : quantidadeNum)) * asset.currentPrice;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-xl shadow-xl w-full max-w-md border border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vender Ativo</h2>
                <p className="text-sm text-muted-foreground">{asset.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Posição atual */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Posição atual</p>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ticker</span>
                <span className="text-sm font-medium text-foreground">{asset.ticker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {isFixedIncome ? 'Valor aplicado' : 'Quantidade'}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {isFixedIncome ? formatCurrency(asset.quantity) : `${asset.quantity} cotas`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor total</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(asset.totalValue)}</span>
              </div>
              {!isFixedIncome && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preço atual</span>
                  <span className="text-sm text-foreground">{formatCurrency(asset.currentPrice)}</span>
                </div>
              )}
            </div>

            {/* Input quantidade */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {isFixedIncome ? 'Valor a resgatar (R$)' : 'Quantidade a vender'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantidade}
                  onChange={e => handleQuantidadeChange(e.target.value)}
                  placeholder={isFixedIncome ? '0,00' : '0'}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVendaTotal}
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10 whitespace-nowrap"
                >
                  Venda total
                </Button>
              </div>
              {quantidadeNum > 0 && !vendaTotal && valorResultante > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Posição restante: <span className="font-medium text-foreground">{formatCurrency(valorResultante)}</span>
                </p>
              )}
              {(vendaTotal || (quantidadeNum > 0 && quantidadeNum >= maxQuantidade)) && (
                <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  O ativo será removido da carteira após a venda total.
                </p>
              )}
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {erro}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || (!quantidade && !vendaTotal)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Venda'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
