import { coingeckoService } from '../services/coingecko.js';

export const cryptoController = {
  // Cotacao de cripto via CoinGecko (gratis, sem chave, BRL nativo)
  async getExchangeRate(req, res, next) {
    try {
      const { symbol } = req.params;
      const { currency = 'BRL' } = req.query;
      const data = await coingeckoService.getCryptoPrice(symbol, currency);

      res.json({
        symbol: data.symbol,
        price: data.price,
        currency: data.currency,
        change24h: data.change24h,
        source: data.source,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },
};
