import { newsApiService } from '../services/newsApi.js';

export const newsController = {
  // === TOP HEADLINES ===

  async getTopHeadlines(req, res, next) {
    try {
      const { country, category, sources, q, pageSize, page } = req.query;

      const data = await newsApiService.getTopHeadlines({
        country,
        category,
        sources,
        q,
        pageSize: parseInt(pageSize) || 20,
        page: parseInt(page) || 1,
      });

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
      }));

      res.json({
        status: 'ok',
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHeadlinesByCountry(req, res, next) {
    try {
      const { country } = req.params;
      const { pageSize } = req.query;

      const data = await newsApiService.getTopHeadlinesByCountry(
        country,
        parseInt(pageSize) || 20
      );

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
      }));

      res.json({
        status: 'ok',
        country,
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getHeadlinesByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { country, pageSize } = req.query;

      const data = await newsApiService.getTopHeadlinesByCategory(
        category,
        country || 'us',
        parseInt(pageSize) || 20
      );

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
      }));

      res.json({
        status: 'ok',
        category,
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === SEARCH (EVERYTHING) ===

  async searchNews(req, res, next) {
    try {
      const { q, sources, domains, from, to, language, sortBy, pageSize, page } = req.query;

      if (!q && !sources && !domains) {
        return res.status(400).json({
          error: 'É necessário informar pelo menos um parâmetro: q, sources ou domains',
        });
      }

      const data = await newsApiService.searchNews({
        q,
        sources,
        domains,
        from,
        to,
        language,
        sortBy,
        pageSize: parseInt(pageSize) || 20,
        page: parseInt(page) || 1,
      });

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
      }));

      res.json({
        status: 'ok',
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === SOURCES ===

  async getSources(req, res, next) {
    try {
      const { category, language, country } = req.query;

      const data = await newsApiService.getSources({
        category,
        language,
        country,
      });

      const sources = (data.sources || []).map((source) => ({
        id: source.id,
        name: source.name,
        description: source.description,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country,
      }));

      res.json({
        status: 'ok',
        sources,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  // === ATALHOS ===

  async getBusinessNews(req, res, next) {
    try {
      const { country, pageSize } = req.query;

      const data = await newsApiService.getBusinessNews(
        country || 'us',
        parseInt(pageSize) || 20
      );

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
      }));

      res.json({
        status: 'ok',
        category: 'business',
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTechNews(req, res, next) {
    try {
      const { country, pageSize } = req.query;

      const data = await newsApiService.getTechNews(
        country || 'us',
        parseInt(pageSize) || 20
      );

      const articles = (data.articles || []).map((article) => ({
        source: article.source?.name,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
      }));

      res.json({
        status: 'ok',
        category: 'technology',
        totalResults: data.totalResults,
        articles,
        fromCache: data.fromCache || false,
      });
    } catch (error) {
      next(error);
    }
  },
};
