# APIs de Renda Fixa — Nuvary Invest

> Referência de endpoints para integração no back-end (Node.js / Python)

---

## 🏦 Banco Central do Brasil (BCB) — API SGS

| Dado | Endpoint |
|------|----------|
| Selic diária (série 11) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/10?formato=json` |
| Meta Selic COPOM (série 432) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/10?formato=json` |
| Selic anualizada base 252 (série 1178) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/10?formato=json` |
| CDI diária (série 12) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/10?formato=json` |
| CDI anualizada base 252 (série 4389) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/10?formato=json` |
| IPCA mensal (série 433) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/10?formato=json` |
| IPCA acumulado 12 meses (série 13522) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/10?formato=json` |
| IGP-M mensal (série 189) | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados/ultimos/10?formato=json` |

---

## 📊 BCB — OLINDA (OData / Focus)

| Dado | Endpoint |
|------|----------|
| Expectativas de mercado (Focus) | `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$format=json` |
| Swagger OLINDA | `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/swagger-ui3` |

---

## 🏛️ Tesouro Direto — STN / Tesouro Transparente

| Dado | Endpoint |
|------|----------|
| CSV oficial (preços e taxas) | `https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv` |
| Metadados CKAN (JSON) | `https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=taxas-dos-titulos-ofertados-pelo-tesouro-direto` |

---

## 💼 APIs Comerciais (JSON estruturado)

| Dado | Endpoint |
|------|----------|
| Fintz API *(requer API key)* | `https://api.fintz.com.br` |
| Dados de Mercado API *(requer API key)* | `https://api.dadosdemercado.com.br/v1` |

---

> 💡 **Dica:** todos os endpoints do BCB são públicos e **sem autenticação**.
> As APIs comerciais (Fintz e Dados de Mercado) exigem API key.
> Respeite o limite de **10 anos por requisição** no SGS (vigente desde março de 2025)
> e implemente cache no back-end para evitar chamadas repetidas.

---

*Nuvary Invest · Fevereiro de 2026*
