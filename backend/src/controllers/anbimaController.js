import { config } from '../config/index.js';

const ANBIMA_URL = config.anbima.baseUrl;
const CLIENT_ID = config.anbima.clientId;
const CLIENT_SECRET = config.anbima.clientSecret;

// Cache simples em memória
const cache = new Map();
const CACHE_TTL = (config.cache.ttl || 300) * 1000;

// Token OAuth2 em memória
let accessToken = null;
let tokenExpiresAt = 0;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Obter access token via OAuth2 (client_credentials)
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${ANBIMA_URL}/oauth/access-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify({ grant_type: 'client_credentials' }),
  });

  if (!res.ok) {
    throw new Error(`ANBIMA OAuth error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  // Renovar 5 minutos antes de expirar
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

// Requisição autenticada à API ANBIMA
async function anbimaGet(endpoint) {
  const token = await getAccessToken();

  const res = await fetch(`${ANBIMA_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'access_token': token,
      'client_id': CLIENT_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ANBIMA API error: ${res.status} - ${text}`);
  }

  return res.json();
}

export const anbimaController = {
  // GET /api/anbima/titulos-publicos - Preços e taxas de títulos públicos (Tesouro Direto)
  async getTitulosPublicos(req, res, next) {
    try {
      const { data } = req.query;
      const cacheKey = `tp_${data || 'latest'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/titulos-publicos/mercado-secundario-TPF';
      if (data) endpoint += `?data=${data}`;

      const result = await anbimaGet(endpoint);

      const formatted = {
        source: 'ANBIMA',
        type: 'titulos_publicos',
        data: Array.isArray(result) ? result.map(titulo => ({
          tipoTitulo: titulo.tipo_titulo,
          dataVencimento: titulo.data_vencimento,
          taxaCompra: titulo.taxa_compra,
          taxaVenda: titulo.taxa_venda,
          taxaIndicativa: titulo.taxa_indicativa,
          pu: titulo.pu,
          codigoSelic: titulo.codigo_selic,
          dataReferencia: titulo.data_referencia,
        })) : result,
      };

      setCache(cacheKey, formatted);
      res.json(formatted);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/vna - Valor Nominal Atualizado (LFT, NTN-B, NTN-C)
  async getVNA(req, res, next) {
    try {
      const { data } = req.query;
      const cacheKey = `vna_${data || 'latest'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/titulos-publicos/vna';
      if (data) endpoint += `?data=${data}`;

      const result = await anbimaGet(endpoint);
      setCache(cacheKey, { source: 'ANBIMA', type: 'vna', data: result });
      res.json({ source: 'ANBIMA', type: 'vna', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/curvas-juros - Curvas de juros
  async getCurvasJuros(req, res, next) {
    try {
      const { data } = req.query;
      const cacheKey = `curvas_${data || 'latest'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/titulos-publicos/curvas-juros';
      if (data) endpoint += `?data=${data}`;

      const result = await anbimaGet(endpoint);
      setCache(cacheKey, { source: 'ANBIMA', type: 'curvas_juros', data: result });
      res.json({ source: 'ANBIMA', type: 'curvas_juros', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/cri-cra - Preços de CRI/CRA
  async getCriCra(req, res, next) {
    try {
      const { data } = req.query;
      const cacheKey = `cricra_${data || 'latest'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/cri-cra/mercado-secundario';
      if (data) endpoint += `?data=${data}`;

      const result = await anbimaGet(endpoint);
      setCache(cacheKey, { source: 'ANBIMA', type: 'cri_cra', data: result });
      res.json({ source: 'ANBIMA', type: 'cri_cra', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/letras-financeiras - Preços de Letras Financeiras
  async getLetrasFinanceiras(req, res, next) {
    try {
      const { data } = req.query;
      const cacheKey = `lf_${data || 'latest'}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/letras-financeiras/matrizes-vertices-emissor';
      if (data) endpoint += `?data=${data}`;

      const result = await anbimaGet(endpoint);
      setCache(cacheKey, { source: 'ANBIMA', type: 'letras_financeiras', data: result });
      res.json({ source: 'ANBIMA', type: 'letras_financeiras', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/projecoes - Projeções IPCA e IGP-M
  async getProjecoes(req, res, next) {
    try {
      const { mes, ano } = req.query;
      const cacheKey = `proj_${mes || ''}_${ano || ''}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      let endpoint = '/feed/precos-indices/v1/titulos-publicos/projecoes';
      const params = [];
      if (mes) params.push(`mes=${mes}`);
      if (ano) params.push(`ano=${ano}`);
      if (params.length > 0) endpoint += `?${params.join('&')}`;

      const result = await anbimaGet(endpoint);
      setCache(cacheKey, { source: 'ANBIMA', type: 'projecoes', data: result });
      res.json({ source: 'ANBIMA', type: 'projecoes', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/anbima/estimativa-selic - Estimativa da taxa Selic
  async getEstimativaSelic(req, res, next) {
    try {
      const cacheKey = 'estimativa_selic';
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      const result = await anbimaGet('/feed/precos-indices/v1/titulos-publicos/estimativa-selic');
      setCache(cacheKey, { source: 'ANBIMA', type: 'estimativa_selic', data: result });
      res.json({ source: 'ANBIMA', type: 'estimativa_selic', data: result });
    } catch (error) {
      next(error);
    }
  },
};
