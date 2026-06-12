import nodemailer from 'nodemailer';

// Envio de e-mail via Gmail SMTP (nodemailer) — requer GMAIL_USER e GMAIL_APP_PASSWORD no ambiente

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      'GMAIL_USER / GMAIL_APP_PASSWORD não configurados no Vercel (Settings → Environment Variables).',
    );
  }
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

// Envia um e-mail e retorna o e-mail "from" usado. Lança erro em caso de falha.
export async function sendMail({ to, subject, html }: SendMailParams): Promise<{ from: string }> {
  const user = process.env.GMAIL_USER as string;
  // No Gmail SMTP o remetente precisa ser a própria conta autenticada.
  const from = `Nuvary Invest <${user}>`;
  await getTransporter().sendMail({ from, to, subject, html });
  return { from };
}
