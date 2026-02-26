// Tesouro Direto Controller
// Fonte primária:  Portal oficial Tesouro Direto (JSON público, sem autenticação)
// Fonte fallback:  Tesouro Transparente — CSV oficial STN/CKAN

const TESOURO_JSON_URL =
  'https://www.tesourodireto.com.br/json/br/com/b3/tesouronacional/pricing/download/PortfolioTesouroDireto.json';

// CSV com preços e taxas históricos do Tesouro Transparente (STN)
const TESOURO_CSV_URL =
  'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Faz parse do CSV do Tesouro Transparente e retorna mapa NomeTitulo → { taxaCompra, taxaVenda, ... }
// Formato do CSV: "Tipo Titulo";"Vencimento do Titulo";"Data Base";"Taxa Compra Manha";"Taxa Venda Manha";"PU Compra Manha";"PU Venda Manha";"PU Base Manha"
async function fetchFromCSV() {
  const res = await fetch(TESOURO_CSV_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Tesouro CSV → HTTP ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV Tesouro vazio');

  // O separador pode ser ';' com valores entre aspas
  const parseCSVLine = (line) =>
    line.split(';').map(v => v.replace(/^"|"$/g, '').trim());

  const header = parseCSVLine(lines[0]);
  const idxTipo    = header.findIndex(h => h.includes('Tipo'));
  const idxVenc    = header.findIndex(h => h.includes('Vencimento'));
  const idxDataBase= header.findIndex(h => h.includes('Data Base'));
  const idxTaxaCom = header.findIndex(h => h.includes('Taxa Compra'));
  const idxTaxaVen = header.findIndex(h => h.includes('Taxa Venda'));
  const idxPUCom   = header.findIndex(h => h.includes('PU Compra'));
  const idxPUVen   = header.findIndex(h => h.includes('PU Venda'));

  // CSV está em ordem cronológica; queremos o dado mais recente por título
  // Lemos de trás para frente para pegar o último registro de cada título
  const rates = {};
  for (let i = lines.length - 1; i >= 1; i--) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 4) continue;
    const tipo = cols[idxTipo];
    if (!tipo) continue;

    // Monta nome similar ao portal JSON: "Tesouro IPCA+ 2029", "Tesouro Selic 2027", etc.
    const venc = cols[idxVenc] || '';
    const ano = venc.split('/')[2] || venc; // extrai ano do "DD/MM/YYYY"
    const nome = `${tipo} ${ano}`.trim();

    if (!rates[nome]) {
      rates[nome] = {
        taxaCompra: parseFloat((cols[idxTaxaCom] || '0').replace(',', '.')) || 0,
        taxaVenda:  parseFloat((cols[idxTaxaVen] || '0').replace(',', '.')) || 0,
        puCompra:   parseFloat((cols[idxPUCom]   || '0').replace(',', '.')) || 0,
        puVenda:    parseFloat((cols[idxPUVen]   || '0').replace(',', '.')) || 0,
        vencimento: venc,
        tipo,
        fonte: 'Tesouro Transparente CSV',
      };
    }
  }

  return rates;
}

// Busca as taxas via portal JSON principal
async function fetchFromPortalJSON() {
  const response = await fetch(TESOURO_JSON_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Tesouro JSON → HTTP ${response.status}`);

  const json = await response.json();
  const titulos = json?.response?.TesouroDireto?.taxa || [];

  const rates = {};
  titulos.forEach((item) => {
    const nome = item?.Titulo?.NomeTitulo;
    if (!nome) return;
    rates[nome] = {
      taxaCompra: parseFloat(item.TaxaCompra) || 0,
      taxaVenda:  parseFloat(item.TaxaVenda)  || 0,
      puCompra:   parseFloat(item.PUCompra)   || 0,
      puVenda:    parseFloat(item.PUVenda)    || 0,
      vencimento: item?.Titulo?.DataVencimento,
      tipo:       item?.Titulo?.TipoTitulo,
      fonte: 'Portal Tesouro Direto',
    };
  });

  return rates;
}

export const tesouroDiretoController = {
  // GET /api/tesouro/rates
  // Retorna taxas atuais de todos os títulos do Tesouro Direto
  // Tenta portal JSON primeiro; se falhar, usa CSV do Tesouro Transparente
  async getRates(req, res, next) {
    try {
      const cached = cache.get('tesouro_rates');
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({ ...cached.data, fromCache: true });
      }

      let rates = {};
      let fonte = '';
      let error = null;

      // Tentativa 1: portal JSON (taxa do dia atual)
      try {
        rates = await fetchFromPortalJSON();
        fonte = 'Portal Tesouro Direto (JSON)';
      } catch (err) {
        error = err.message;
        console.warn('[Tesouro] Falha no portal JSON, tentando CSV Tesouro Transparente...', err.message);

        // Tentativa 2: CSV Tesouro Transparente (dados históricos)
        try {
          rates = await fetchFromCSV();
          fonte = 'Tesouro Transparente (CSV)';
        } catch (err2) {
          console.error('[Tesouro] Fallback CSV também falhou:', err2.message);
          throw new Error(`Portal: ${error} | CSV: ${err2.message}`);
        }
      }

      const result = { rates, fonte, updatedAt: new Date().toISOString() };
      cache.set('tesouro_rates', { data: result, timestamp: Date.now() });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
