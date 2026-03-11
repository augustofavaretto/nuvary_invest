import app from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  console.log(`Nuvary Invest Backend rodando na porta ${config.port}`);
  console.log(`Alpha Vantage Keys: ${config.alphaVantage.apiKeys.length}`);
  console.log(`Finnhub Key: ${config.finnhub.apiKey ? 'Configurada' : 'Nao configurada'}`);
  console.log(`Brapi Token: ${config.brapi.token ? 'Configurado' : 'Nao configurado'}`);
  console.log(`ANBIMA Client: ${config.anbima.clientId ? 'Configurado' : 'Nao configurado'}`);
  console.log(`News API Keys: ${config.newsApi.apiKeys.length}`);
  console.log(`OpenAI Key: ${config.openai.apiKey ? 'Configurada' : 'Nao configurada'}`);
});
