// Mapeia o domínio do e-mail para a URL do webmail correspondente,
// para o botão "Abrir meu e-mail" levar o usuário direto à caixa de entrada.

interface Webmail {
  name: string;
  url: string;
}

const WEBMAIL_BY_DOMAIN: Record<string, Webmail> = {
  // Google (inclui domínios institucionais com Google Workspace)
  'gmail.com': { name: 'Gmail', url: 'https://mail.google.com/mail/' },
  'googlemail.com': { name: 'Gmail', url: 'https://mail.google.com/mail/' },
  'atitus.edu.br': { name: 'Gmail', url: 'https://mail.google.com/mail/' },
  // Microsoft
  'outlook.com': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  'outlook.com.br': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  'hotmail.com': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  'hotmail.com.br': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  'live.com': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  'msn.com': { name: 'Outlook', url: 'https://outlook.live.com/mail/' },
  // Yahoo
  'yahoo.com': { name: 'Yahoo', url: 'https://mail.yahoo.com/' },
  'yahoo.com.br': { name: 'Yahoo', url: 'https://mail.yahoo.com/' },
  'ymail.com': { name: 'Yahoo', url: 'https://mail.yahoo.com/' },
  // Apple
  'icloud.com': { name: 'iCloud', url: 'https://www.icloud.com/mail' },
  'me.com': { name: 'iCloud', url: 'https://www.icloud.com/mail' },
  'mac.com': { name: 'iCloud', url: 'https://www.icloud.com/mail' },
  // Proton
  'proton.me': { name: 'Proton Mail', url: 'https://mail.proton.me/' },
  'protonmail.com': { name: 'Proton Mail', url: 'https://mail.proton.me/' },
  // Provedores brasileiros
  'uol.com.br': { name: 'UOL', url: 'https://email.uol.com.br/' },
  'bol.com.br': { name: 'BOL', url: 'https://email.bol.uol.com.br/' },
  'terra.com.br': { name: 'Terra', url: 'https://mail.terra.com.br/' },
  // Outros
  'zoho.com': { name: 'Zoho Mail', url: 'https://mail.zoho.com/' },
  'gmx.com': { name: 'GMX', url: 'https://www.gmx.com/' },
  'aol.com': { name: 'AOL', url: 'https://mail.aol.com/' },
};

export interface WebmailResult {
  /** Nome do provedor (ex.: "Gmail") ou null se desconhecido. */
  name: string | null;
  /** URL para abrir a caixa de entrada. */
  url: string;
  domain: string;
}

// Retorna o webmail do e-mail informado. Para domínios conhecidos, devolve a
// URL exata + o nome do provedor. Para desconhecidos, faz um best-effort
// abrindo o domínio (name = null).
export function getWebmail(email: string | null | undefined): WebmailResult | null {
  const domain = email?.split('@')[1]?.toLowerCase().trim();
  if (!domain) return null;
  const known = WEBMAIL_BY_DOMAIN[domain];
  if (known) return { name: known.name, url: known.url, domain };
  return { name: null, url: `https://${domain}`, domain };
}
