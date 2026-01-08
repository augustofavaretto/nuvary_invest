import { alphaVantageService } from '../services/alphaVantage.js';

export const searchController = {
  async searchSymbol(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.length < 1) {
        return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
      }

      const data = await alphaVantageService.searchSymbol(q);

      const matches = data.bestMatches || [];

      const formattedResults = matches.map((match) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
        matchScore: parseFloat(match['9. matchScore']),
      }));

      res.json({
        query: q,
        results: formattedResults,
        count: formattedResults.length,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMarketStatus(req, res, next) {
    try {
      const data = await alphaVantageService.getMarketStatus();

      const markets = data.markets || [];

      const formattedMarkets = markets.map((market) => ({
        type: market.market_type,
        region: market.region,
        exchange: market.primary_exchanges,
        localOpen: market.local_open,
        localClose: market.local_close,
        status: market.current_status,
        notes: market.notes || null,
      }));

      res.json({
        endpoint: data.endpoint,
        markets: formattedMarkets,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
