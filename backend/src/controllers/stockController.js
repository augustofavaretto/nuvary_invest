import { alphaVantageService } from '../services/alphaVantage.js';

export const stockController = {
  async getQuote(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await alphaVantageService.getQuote(symbol);

      const quote = data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        return res.status(404).json({ error: 'Símbolo não encontrado' });
      }

      res.json({
        symbol: quote['01. symbol'],
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        price: parseFloat(quote['05. price']),
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getIntraday(req, res, next) {
    try {
      const { symbol } = req.params;
      const { interval = '5min' } = req.query;
      const data = await alphaVantageService.getIntraday(symbol, interval);

      const timeSeries = data[`Time Series (${interval})`];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([time, values]) => ({
        time,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      res.json({
        symbol,
        interval,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDaily(req, res, next) {
    try {
      const { symbol } = req.params;
      const { outputsize = 'compact' } = req.query;
      const data = await alphaVantageService.getDaily(symbol, outputsize);

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      res.json({
        symbol,
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
      const data = await alphaVantageService.getWeekly(symbol);

      const timeSeries = data['Weekly Time Series'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      res.json({
        symbol,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await alphaVantageService.getMonthly(symbol);

      const timeSeries = data['Monthly Time Series'];
      if (!timeSeries) {
        return res.status(404).json({ error: 'Dados não encontrados' });
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      res.json({
        symbol,
        data: formattedData,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOverview(req, res, next) {
    try {
      const { symbol } = req.params;
      const data = await alphaVantageService.getCompanyOverview(symbol);

      if (!data.Symbol) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      res.json({
        symbol: data.Symbol,
        name: data.Name,
        description: data.Description,
        exchange: data.Exchange,
        currency: data.Currency,
        country: data.Country,
        sector: data.Sector,
        industry: data.Industry,
        marketCap: parseInt(data.MarketCapitalization) || null,
        peRatio: parseFloat(data.PERatio) || null,
        pegRatio: parseFloat(data.PEGRatio) || null,
        bookValue: parseFloat(data.BookValue) || null,
        dividendPerShare: parseFloat(data.DividendPerShare) || null,
        dividendYield: parseFloat(data.DividendYield) || null,
        eps: parseFloat(data.EPS) || null,
        revenuePerShareTTM: parseFloat(data.RevenuePerShareTTM) || null,
        profitMargin: parseFloat(data.ProfitMargin) || null,
        week52High: parseFloat(data['52WeekHigh']) || null,
        week52Low: parseFloat(data['52WeekLow']) || null,
        movingAverage50: parseFloat(data['50DayMovingAverage']) || null,
        movingAverage200: parseFloat(data['200DayMovingAverage']) || null,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
