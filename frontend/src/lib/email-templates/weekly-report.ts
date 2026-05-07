export interface WeeklyReportData {
  nome: string;
  numAtivos: number;
  totalInvestido: number;
  totalAtual: number;
  variacaoPct: number;
  porClasse: { classe: string; total: number }[];
  numAlertasSemana: number;
  appUrl: string;
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

const labelClasse: Record<string, string> = {
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variável',
  fiis: 'Fundos Imobiliários',
  internacional: 'Internacional',
};

export function generateWeeklyReportHtml(d: WeeklyReportData): string {
  const variacaoCor = d.variacaoPct >= 0 ? '#10b981' : '#ef4444';
  const variacaoSinal = d.variacaoPct >= 0 ? '+' : '';
  const linhasClasses = d.porClasse
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 0;color:#475569;font-size:14px;">${labelClasse[c.classe] || c.classe}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:right;font-weight:600;">${fmtBRL(c.total)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo semanal - Nuvary Invest</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <tr>
            <td style="background:linear-gradient(135deg,#0B1F33 0%,#1e3a5f 100%);padding:32px 32px 24px;color:#ffffff;">
              <p style="margin:0 0 4px;font-size:13px;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">Nuvary Invest</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;">Seu resumo semanal</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1;">Olá, ${escapeHtml(d.nome)} 👋</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Patrimônio total</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#0f172a;">${fmtBRL(d.totalAtual)}</p>
                    <p style="margin:8px 0 0;font-size:14px;color:${variacaoCor};font-weight:600;">
                      ${variacaoSinal}${d.variacaoPct.toFixed(2)}% vs aporte total
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Total investido</p>
                      <p style="margin:0;font-size:18px;font-weight:600;color:#0f172a;">${fmtBRL(d.totalInvestido)}</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Ativos na carteira</p>
                      <p style="margin:0;font-size:18px;font-weight:600;color:#0f172a;">${d.numAtivos}</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${
                d.porClasse.length > 0
                  ? `
              <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0f172a;">Distribuição por classe</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;margin-bottom:24px;">
                ${linhasClasses}
              </table>`
                  : ''
              }

              <table width="100%" cellpadding="0" cellspacing="0" style="background:${
                d.numAlertasSemana > 0 ? '#fef3c7' : '#f1f5f9'
              };border-radius:8px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#0f172a;">
                      ${
                        d.numAlertasSemana > 0
                          ? `<strong>${d.numAlertasSemana}</strong> alerta${
                              d.numAlertasSemana > 1 ? 's' : ''
                            } de variação ≥ 5% disparado${
                              d.numAlertasSemana > 1 ? 's' : ''
                            } esta semana.`
                          : 'Nenhum alerta de variação ≥ 5% nesta semana.'
                      }
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${d.appUrl}/dashboard" style="display:inline-block;padding:12px 32px;background:#00B8D9;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                      Abrir Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                Você recebe este e-mail porque ativou os relatórios semanais nas configurações.
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                <a href="${d.appUrl}/configuracoes" style="color:#00B8D9;text-decoration:none;">Gerenciar preferências</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
