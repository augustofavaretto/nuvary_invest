import { alphaVantageService } from '../services/alphaVantage.js';

export const cryptoController = {
  async getExchangeRate(req, res, next) {
    try {
      const { symbol } = req.params;
      const { currency = 'USD' } = req.query;
      const data = await alphaVantageService.getCryptoExchangeRate(symbol, currency);

      const rate = data['Realtime Currency Exchange Rate'];
      if (!rate) {
        return res.status(404).json({ error: 'Criptomoeda não encontrada' });
      }

      res.json({
        symbol: rate['1. From_Currency Code'],
        name: rate['2. From_Currency Name'],
        currency: rate['3. To_Currency Code'],
        currencyName: rate['4. To_Currency Name'],
        price: parseFloat(rate['5. Exchange Rate']),
        lastRefreshed: rate['6. Last Refreshed'],
        timezone: rate['7. Time Zone'],
        bidPrice: parseFloat(rate['8. Bid Price']) || null,
        askPrice: parseFloat(rate['9. Ask Price']) || null,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
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
