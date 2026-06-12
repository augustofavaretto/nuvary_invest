// BCB — Banco Central do Brasil, séries SGS públicas (sem autenticação)

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos (dados mudam diariamente)
const cache = new Map();

// Séries SGS utilizadas
const SGS_SERIES = {
  selic_meta_copom: 432,
  cdi_anual_252: 4389,
  ipca_12m: 13522,
  igpm_mensal: 189,
  usd_ptax: 1,
};

// Busca os N últimos valores de uma série SGS
async function fetchSGS(serie, ultimos = 5) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/${ultimos}?formato=json`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`BCB SGS serie ${serie} → HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(`BCB SGS serie ${serie} sem dados`);
  // Último item é o mais recente
  return {
    valor: parseFloat(data[data.length - 1].valor),
    data: data[data.length - 1].data,
    historico: data.map(d => ({ data: d.data, valor: parseFloat(d.valor) })),
  };
}

// Cache helper
async function withCache(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return { ...hit.data, fromCache: true };
  const data = await fn();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export const bcbController = {
  // GET /api/bcb/dolar — cotação USD/BRL (PTAX diária, série SGS 1)
  async getDolar(req, res, next) {
    try {
      const result = await withCache('bcb_dolar', async () => {
        const ptax = await fetchSGS(SGS_SERIES.usd_ptax);
        return {
          taxa: ptax.valor,
          data: ptax.data,
          fonte: 'BCB SGS (PTAX)',
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/rates — todos os indicadores em uma única chamada
  async getAllRates(req, res, next) {
    try {
      const result = await withCache('bcb_all_rates', async () => {
        const [selic, cdi, ipca, igpm] = await Promise.allSettled([
          fetchSGS(SGS_SERIES.selic_meta_copom),
          fetchSGS(SGS_SERIES.cdi_anual_252),
          fetchSGS(SGS_SERIES.ipca_12m),
          fetchSGS(SGS_SERIES.igpm_mensal),
        ]);

        return {
          selic: selic.status === 'fulfilled' ? { taxa: selic.value.valor, data: selic.value.data } : null,
          cdi:   cdi.status   === 'fulfilled' ? { taxa: cdi.value.valor,   data: cdi.value.data }   : null,
          ipca:  ipca.status  === 'fulfilled' ? { taxa: ipca.value.valor,  data: ipca.value.data }  : null,
          igpm:  igpm.status  === 'fulfilled' ? { taxa: igpm.value.valor,  data: igpm.value.data }  : null,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
