# Nuvary Invest - Documentacao da API

**Versao:** 2.0.0
**Data:** Janeiro 2026

---

## 1. Visao Geral

O **Nuvary Invest Backend** e uma API RESTful desenvolvida em Node.js que integra multiplas APIs financeiras para fornecer dados de mercado, noticias e analises com inteligencia artificial.

### Funcionalidades Principais

- **Acoes Internacionais** - Cotacoes, historicos e informacoes de empresas (Alpha Vantage + Finnhub)
- **Forex** - Taxas de cambio em tempo real
- **Criptomoedas** - Precos de BTC, ETH e outras
- **Noticias** - Agregacao de noticias financeiras (News API)
- **Inteligencia Artificial** - Analise e recomendacoes (OpenAI)
- **Busca** - Pesquisa de simbolos e status dos mercados

---

## 2. Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── index.js              # Configuracoes
│   ├── controllers/
│   │   ├── stockController.js    # Logica de acoes
│   │   ├── forexController.js    # Logica de forex
│   │   ├── cryptoController.js   # Logica de criptomoedas
│   │   ├── searchController.js   # Logica de busca
│   │   ├── finnhubController.js  # Logica Finnhub
│   │   ├── newsController.js     # Logica de noticias
│   │   ├── aiController.js       # Logica de IA
│   │   ├── riskProfileController.js # Perfil de risco
│   │   └── authController.js     # Autenticacao
│   ├── middleware/
│   │   ├── errorHandler.js       # Tratamento de erros
│   │   ├── rateLimiter.js        # Limitacao de requisicoes
│   │   └── auth.js               # Middleware de autenticacao
│   ├── routes/
│   │   ├── stocks.js             # Rotas de acoes
│   │   ├── forex.js              # Rotas de forex
│   │   ├── crypto.js             # Rotas de criptomoedas
│   │   ├── search.js             # Rotas de busca
│   │   ├── finnhub.js            # Rotas Finnhub
│   │   ├── news.js               # Rotas de noticias
│   │   ├── ai.js                 # Rotas de IA
│   │   └── profile.js            # Rotas de perfil
│   ├── services/
│   │   ├── alphaVantage.js       # Integracao Alpha Vantage
│   │   ├── finnhub.js            # Integracao Finnhub
│   │   ├── newsApi.js            # Integracao News API
│   │   ├── openai.js             # Integracao OpenAI
│   │   └── riskProfile.js        # Servico de perfil
│   └── server.js                 # Ponto de entrada
├── .env                          # Variaveis de ambiente
└── package.json
```

---

## 3. APIs Integradas

### 3.1 Alpha Vantage (Dados de Mercado)

| Endpoint | Descricao |
|----------|-----------|
| `/api/stocks/:symbol/quote` | Cotacao atual |
| `/api/stocks/:symbol/daily` | Serie diaria |
| `/api/stocks/:symbol/intraday` | Dados intraday |
| `/api/stocks/:symbol/weekly` | Serie semanal |
| `/api/stocks/:symbol/monthly` | Serie mensal |
| `/api/stocks/:symbol/overview` | Info da empresa |
| `/api/forex/:from/:to/rate` | Taxa de cambio |
| `/api/forex/:from/:to/daily` | Serie diaria forex |
| `/api/crypto/:symbol/rate` | Preco atual cripto |
| `/api/crypto/:symbol/daily` | Serie diaria cripto |
| `/api/search?q=keyword` | Buscar simbolos |

### 3.2 Finnhub (Analise Avancada)

| Endpoint | Descricao |
|----------|-----------|
| `/api/finnhub/stocks/:symbol/quote` | Cotacao real-time |
| `/api/finnhub/stocks/:symbol/candles` | Candlestick data |
| `/api/finnhub/stocks/:symbol/profile` | Perfil da empresa |
| `/api/finnhub/stocks/:symbol/metrics` | Metricas fundamentais |
| `/api/finnhub/stocks/:symbol/recommendation` | Recomendacoes de analistas |
| `/api/finnhub/news/company/:symbol` | Noticias da empresa |
| `/api/finnhub/news/market` | Noticias do mercado |
| `/api/finnhub/technicals/:symbol` | Indicadores tecnicos |
| `/api/finnhub/insiders/:symbol` | Insider trading |

### 3.3 News API (Noticias)

| Endpoint | Descricao |
|----------|-----------|
| `/api/news/top-headlines` | Manchetes principais |
| `/api/news/headlines/:country` | Manchetes por pais |
| `/api/news/headlines/:category` | Manchetes por categoria |
| `/api/news/search?q=termo` | Buscar noticias |
| `/api/news/sources` | Fontes disponiveis |
| `/api/news/business` | Noticias de negocios |
| `/api/news/tech` | Noticias de tecnologia |

### 3.4 OpenAI (Inteligencia Artificial)

| Endpoint | Descricao |
|----------|-----------|
| `/api/ai/chat` | Chat conversacional |
| `/api/ai/ask` | Pergunta unica |
| `/api/ai/stocks/:symbol/analysis` | Analise de acao |
| `/api/ai/news/analysis` | Analise de sentimento |
| `/api/ai/terms/:term` | Explicacao de termo |
| `/api/ai/investment-suggestion` | Sugestao personalizada |
| `/api/ai/compare` | Comparacao de acoes |
| `/api/ai/market-summary` | Resumo do mercado |

---

## 4. Recursos Implementados

| Recurso | Descricao |
|---------|-----------|
| **Rotacao de API Keys** | Alterna entre chaves para maximizar limite |
| **Cache Inteligente** | Armazena respostas por 5 minutos |
| **Rate Limiting** | 30 requisicoes/minuto por IP |
| **Tratamento de Erros** | Respostas padronizadas |
| **CORS Habilitado** | Permite requisicoes do frontend |
| **Autenticacao JWT** | Protecao de rotas sensiveis |
| **Health Check** | `/api/health` verifica status das APIs |

---

## 5. Tecnologias Utilizadas

| Dependencia | Proposito |
|-------------|-----------|
| express | Framework web |
| axios | Cliente HTTP |
| cors | Middleware CORS |
| dotenv | Variaveis de ambiente |
| node-cache | Cache em memoria |
| express-rate-limit | Rate limiting |
| helmet | Seguranca HTTP |
| jsonwebtoken | Autenticacao JWT |
| openai | SDK OpenAI |

---

## 6. Configuracao

### Variaveis de Ambiente

```env
# Servidor
PORT=3001
NODE_ENV=development
CACHE_TTL=300

# Alpha Vantage
ALPHA_VANTAGE_API_KEY_1=sua_chave_1
ALPHA_VANTAGE_API_KEY_2=sua_chave_2

# Finnhub
FINNHUB_API_KEY=sua_chave

# News API
NEWS_API_KEY_1=sua_chave_1
NEWS_API_KEY_2=sua_chave_2

# OpenAI
OPENAI_API_KEY=sua_chave
```

### Iniciar o Servidor

```bash
cd nuvary-invest/backend
npm install
npm run dev
```

Servidor disponivel em: `http://localhost:3001`

---

**Nuvary Invest © 2026**
