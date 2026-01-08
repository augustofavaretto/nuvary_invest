import { alphaVantageService } from '../services/alphaVantage.js';

export const forexController = {
  async getExchangeRate(req, res, next) {
    try {
      const { from, to } = req.params;
      const data = await alphaVantageService.getExchangeRate(from, to);

      const rate = data['Realtime Currency Exchange Rate'];
      if (!rate) {
        return res.status(404).json({ error: 'Par de moedas não encontrado' });
      }

      res.json({
        fromCurrency: rate['1. From_Currency Code'],
        fromName: rate['2. From_Currency Name'],
        toCurrency: rate['3. To_Currency Code'],
        toName: rate['4. To_Currency Name'],
        exchangeRate: parseFloat(rate['5. Exchange Rate']),
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
      const { from, to } = req.params;
      const { outputsize = 'compact' } = req.query;
      const data = await alphaVantageService.getForexDaily(from, to, outputsize);

      const timeSeries = data['Time Series FX (Daily)'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
      }));

      res.json({
        fromSymbol: from,
        toSymbol: to,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getIntraday(req, res, next) {
    try {
      const { from, to } = req.params;
      const { interval = '5min' } = req.query;
      const data = await alphaVantageService.getForexIntraday(from, to, interval);

      const timeSeries = data[`Time Series FX (${interval})`];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([time, values]) => ({
        time,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
      }));

      res.json({
        fromSymbol: from,
        toSymbol: to,
        interval,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
