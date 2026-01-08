# Nuvary Invest - Documentação da API

**Versão:** 1.0.0
**Data:** Janeiro 2024

---

## 1. Visão Geral

O **Nuvary Invest Backend** é uma API RESTful desenvolvida em Node.js para integração com a **Alpha Vantage API**, fornecendo dados financeiros internacionais em tempo real.

### Funcionalidades Principais

- **📈 Ações Internacionais** - Cotações, históricos e informações de empresas
- **💱 Forex** - Taxas de câmbio em tempo real
- **🪙 Criptomoedas** - Preços de BTC, ETH e outras
- **🔍 Busca** - Pesquisa de símbolos e status dos mercados

---

## 2. Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── index.js           # Configurações
│   ├── controllers/
│   │   ├── stockController.js  # Lógica de ações
│   │   ├── forexController.js  # Lógica de forex
│   │   ├── cryptoController.js # Lógica de criptomoedas
│   │   └── searchController.js # Lógica de busca
│   ├── middleware/
│   │   ├── errorHandler.js     # Tratamento de erros
│   │   └── rateLimiter.js      # Limitação de requisições
│   ├── routes/
│   │   ├── stocks.js           # Rotas de ações
│   │   ├── forex.js            # Rotas de forex
│   │   ├── crypto.js           # Rotas de criptomoedas
│   │   └── search.js           # Rotas de busca
│   ├── services/
│   │   └── alphaVantage.js     # Integração com Alpha Vantage
│   └── server.js               # Ponto de entrada
├── .env                        # Variáveis de ambiente
├── .env.example                # Template
├── .gitignore
└── package.json
```

---

## 3. Instalação e Configuração

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

### Passo 1: Instalar dependências

```bash
cd nuvary-invest/backend
npm install
```

### Passo 2: Configurar variáveis de ambiente

O arquivo `.env` já está configurado:

```env
ALPHA_VANTAGE_API_KEY_1=703SBQ7MEI3JECGB
ALPHA_VANTAGE_API_KEY_2=MLEC4W1D8AT28JE4
PORT=3001
NODE_ENV=development
CACHE_TTL=300
```

### Passo 3: Iniciar o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

Servidor disponível em: `http://localhost:3001`

---

## 4. Endpoints da API

### 📈 Ações (Stocks)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stocks/:symbol/quote` | Cotação atual |
| GET | `/api/stocks/:symbol/daily` | Série diária |
| GET | `/api/stocks/:symbol/intraday` | Dados intraday |
| GET | `/api/stocks/:symbol/weekly` | Série semanal |
| GET | `/api/stocks/:symbol/monthly` | Série mensal |
| GET | `/api/stocks/:symbol/overview` | Info da empresa |

### 💱 Forex

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/forex/:from/:to/rate` | Taxa de câmbio |
| GET | `/api/forex/:from/:to/daily` | Série diária |
| GET | `/api/forex/:from/:to/intraday` | Dados intraday |

### 🪙 Criptomoedas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/crypto/:symbol/rate` | Preço atual |
| GET | `/api/crypto/:symbol/daily` | Série diária |
| GET | `/api/crypto/:symbol/weekly` | Série semanal |

### 🔍 Busca

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/search?q=keyword` | Buscar símbolos |
| GET | `/api/search/market-status` | Status dos mercados |

### 🏥 Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Verificar servidor |

---

## 5. Exemplos de Uso

### Cotação da Apple

```bash
GET http://localhost:3001/api/stocks/AAPL/quote
```

Resposta:
```json
{
  "symbol": "AAPL",
  "price": 186.75,
  "change": 1.45,
  "changePercent": "0.78%",
  "volume": 52341200
}
```

### Taxa USD/BRL

```bash
GET http://localhost:3001/api/forex/USD/BRL/rate
```

Resposta:
```json
{
  "fromCurrency": "USD",
  "toCurrency": "BRL",
  "exchangeRate": 4.9125
}
```

### Preço do Bitcoin

```bash
GET http://localhost:3001/api/crypto/BTC/rate
```

Resposta:
```json
{
  "symbol": "BTC",
  "price": 43250.50,
  "currency": "USD"
}
```

---

## 6. Recursos Implementados

| Recurso | Descrição |
|---------|-----------|
| **Rotação de API Keys** | Alterna entre 2 chaves para maximizar limite |
| **Cache Inteligente** | Armazena respostas por 5 minutos |
| **Rate Limiting** | 30 requisições/minuto por IP |
| **Tratamento de Erros** | Respostas padronizadas |
| **CORS Habilitado** | Permite requisições do frontend |

---

## 7. Tecnologias Utilizadas

| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| express | ^4.18.2 | Framework web |
| axios | ^1.6.0 | Cliente HTTP |
| cors | ^2.8.5 | Middleware CORS |
| dotenv | ^16.3.1 | Variáveis de ambiente |
| node-cache | ^5.1.2 | Cache em memória |
| express-rate-limit | ^7.1.5 | Rate limiting |

---

## 8. Limitações

A versão gratuita da Alpha Vantage possui:

- **5 chamadas por minuto** por API key
- **500 chamadas por dia** por API key
- Com 2 API keys: ~10 chamadas/min e ~1000 chamadas/dia

O sistema de cache mitiga essas limitações.

---

**Nuvary Invest © 2024**
