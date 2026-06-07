import { alphaVantageService } from '../services/alphaVantage.js';
import { coingeckoService } from '../services/coingecko.js';

export const cryptoController = {
  // Cotacao de cripto via CoinGecko (gratis, sem chave, BRL nativo).
  // Default em BRL — o Alpha Vantage CURRENCY_EXCHANGE_RATE virou premium.
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

  async getDaily(req, res, next) {
    try {
      const { symbol } = req.params;
      const { market = 'USD' } = req.query;
      const data = await alphaVantageService.getCryptoDaily(symbol, market);

      const timeSeries = data['Time Series (Digital Currency Daily)'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values[`1a. open (${market})`] || values['1. open']),
        high: parseFloat(values[`2a. high (${market})`] || values['2. high']),
        low: parseFloat(values[`3a. low (${market})`] || values['3. low']),
        close: parseFloat(values[`4a. close (${market})`] || values['4. close']),
        volume: parseFloat(values['5. volume']) || 0,
        marketCap: parseFloat(values['6. market cap (USD)']) || null,
      }));

      res.json({
        symbol,
        market,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getWeekly(req, res, next) {
    try {
      const { symbol } = req.params;
      const { market = 'USD' } = req.query;
      const data = await alphaVantageService.getCryptoWeekly(symbol, market);

      const timeSeries = data['Time Series (Digital Currency Weekly)'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values[`1a. open (${market})`] || values['1. open']),
        high: parseFloat(values[`2a. high (${market})`] || values['2. high']),
        low: parseFloat(values[`3a. low (${market})`] || values['3. low']),
        close: parseFloat(values[`4a. close (${market})`] || values['4. close']),
        volume: parseFloat(values['5. volume']) || 0,
        marketCap: parseFloat(values['6. market cap (USD)']) || null,
      }));

      res.json({
        symbol,
        market,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
