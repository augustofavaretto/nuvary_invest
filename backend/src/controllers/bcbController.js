// BCB Controller — Banco Central do Brasil
// Fontes: SGS (Sistema Gerenciador de Séries) e OLINDA (OData/Focus)
// Todos os endpoints são públicos e sem autenticação.
// Limite: 10 anos por requisição (vigente desde março/2025)

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos (dados mudam diariamente)
const cache = new Map();

// Séries SGS utilizadas
const SGS_SERIES = {
  selic_diaria:        11,
  selic_meta_copom:    432,
  selic_anual_252:     1178,
  cdi_diaria:          12,
  cdi_anual_252:       4389,
  ipca_mensal:         433,
  ipca_12m:            13522,
  igpm_mensal:         189,
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
  // GET /api/bcb/selic
  // Retorna Selic diária (s11), meta COPOM (s432) e anualizada base 252 (s1178)
  async getSelic(req, res, next) {
    try {
      const result = await withCache('bcb_selic', async () => {
        const [diaria, meta, anual] = await Promise.allSettled([
          fetchSGS(SGS_SERIES.selic_diaria),
          fetchSGS(SGS_SERIES.selic_meta_copom),
          fetchSGS(SGS_SERIES.selic_anual_252),
        ]);
        return {
          diaria:  diaria.status  === 'fulfilled' ? diaria.value  : null,
          meta:    meta.status    === 'fulfilled' ? meta.value    : null,
          anual:   anual.status   === 'fulfilled' ? anual.value   : null,
          // Valor principal = meta COPOM ou anualizada (ambos equivalentes para UI)
          taxa:    meta.status === 'fulfilled'
                     ? meta.value.valor
                     : anual.status === 'fulfilled' ? anual.value.valor : null,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/cdi
  // Retorna CDI diária (s12) e anualizada base 252 (s4389)
  async getCDI(req, res, next) {
    try {
      const result = await withCache('bcb_cdi', async () => {
        const [diaria, anual] = await Promise.allSettled([
          fetchSGS(SGS_SERIES.cdi_diaria),
          fetchSGS(SGS_SERIES.cdi_anual_252),
        ]);
        return {
          diaria: diaria.status === 'fulfilled' ? diaria.value : null,
          anual:  anual.status  === 'fulfilled' ? anual.value  : null,
          // Valor principal = CDI anualizado base 252 (mais relevante para comparação de CDBs)
          taxa:   anual.status === 'fulfilled'
                    ? anual.value.valor
                    : diaria.status === 'fulfilled' ? diaria.value.valor : null,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/ipca
  // Retorna IPCA mensal (s433) e acumulado 12 meses (s13522)
  async getIPCA(req, res, next) {
    try {
      const result = await withCache('bcb_ipca', async () => {
        const [mensal, acum12m] = await Promise.allSettled([
          fetchSGS(SGS_SERIES.ipca_mensal),
          fetchSGS(SGS_SERIES.ipca_12m),
        ]);
        return {
          mensal:  mensal.status  === 'fulfilled' ? mensal.value  : null,
          acum12m: acum12m.status === 'fulfilled' ? acum12m.value : null,
          // Valor principal = acumulado 12m (mais relevante para investidores)
          taxa:    acum12m.status === 'fulfilled'
                     ? acum12m.value.valor
                     : mensal.status === 'fulfilled' ? mensal.value.valor : null,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/igpm
  // Retorna IGP-M mensal (s189)
  async getIGPM(req, res, next) {
    try {
      const result = await withCache('bcb_igpm', async () => {
        const dado = await fetchSGS(SGS_SERIES.igpm_mensal);
        return {
          mensal: dado,
          taxa: dado.valor,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/focus
  // Retorna expectativas de mercado do relatório Focus (BCB OLINDA OData)
  async getFocus(req, res, next) {
    try {
      const result = await withCache('bcb_focus', async () => {
        const indicadores = ['IPCA', 'Selic', 'PIB Total', 'Taxa de câmbio'];
        const filtro = indicadores.map(i => `Indicador eq '${i}'`).join(' or ');
        // Campos: Indicador, Data, DataReferencia, Mediana (sem 'Ano' — campo correto é DataReferencia)
        const url = `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$filter=${encodeURIComponent(filtro)}&$top=60&$orderby=Data desc&$format=json&$select=Indicador,Data,DataReferencia,Mediana`;

        const res2 = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res2.ok) throw new Error(`BCB OLINDA Focus → HTTP ${res2.status}`);
        const json = await res2.json();

        // Agrupa por indicador; mantém apenas a entrada mais recente por DataReferencia
        const byIndicador = {};
        (json.value || []).forEach(item => {
          const ind = item.Indicador;
          if (!byIndicador[ind]) byIndicador[ind] = [];
          // Evita duplicatas de DataReferencia (pega a data de coleta mais recente)
          const existing = byIndicador[ind].find(e => e.dataReferencia === item.DataReferencia);
          if (!existing) {
            byIndicador[ind].push({
              data: item.Data,
              dataReferencia: item.DataReferencia,
              mediana: item.Mediana,
            });
          }
        });

        return {
          expectativas: byIndicador,
          updatedAt: new Date().toISOString(),
        };
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/bcb/rates
  // Endpoint consolidado — retorna todos os indicadores de uma vez
  // Útil para o frontend buscar tudo em uma única chamada
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
