import { newsApiService } from '../services/newsApi.js';

export const newsController = {
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
};
