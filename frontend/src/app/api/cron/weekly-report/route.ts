import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  generateWeeklyReportHtml,
  type WeeklyReportData,
} from '@/lib/email-templates/weekly-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

interface ProfileRow {
  id: string;
  nome: string;
  email: string;
  email_relatorios_ultimo_envio: string | null;
}

interface AssetRow {
  type: string;
  quantity: number;
  average_price: number;
  total_value: number;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY nao configurada' },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sender = process.env.EMAIL_FROM || 'Nuvary Invest <onboarding@resend.dev>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.nuvary.invest';
  const admin = getSupabaseAdmin();

  const { data: users, error: usersErr } = await admin
    .from('profiles')
    .select('id, nome, email, email_relatorios_ultimo_envio')
    .eq('email_relatorios_ativo', true);

  if (usersErr) {
    return NextResponse.json({ error: usersErr.message }, { status: 500 });
  }

  const candidates = (users ?? []) as ProfileRow[];
  const now = Date.now();

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails: { email: string; error: string }[] = [];

  for (const u of candidates) {
    if (!u.email) {
      skipped++;
      continue;
    }

    if (
      u.email_relatorios_ultimo_envio &&
      now - new Date(u.email_relatorios_ultimo_envio).getTime() < SIX_DAYS_MS
    ) {
      skipped++;
      continue;
    }

    try {
      const { data: assets } = await admin
        .from('portfolio_assets')
        .select('type, quantity, average_price, total_value')
        .eq('user_id', u.id);

      const list = (assets ?? []) as AssetRow[];

      let totalInvestido = 0;
      let totalAtual = 0;
      const porClasseMap = new Map<string, number>();

      for (const a of list) {
        const isFixedIncome = a.type === 'renda_fixa';
        const investido = isFixedIncome
          ? Number(a.quantity)
          : Number(a.quantity) * Number(a.average_price);
        const atual = Number(a.total_value) || investido;

        totalInvestido += investido;
        totalAtual += atual;
        porClasseMap.set(a.type, (porClasseMap.get(a.type) ?? 0) + atual);
      }

      const variacaoPct =
        totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0;

      const seteDiasAtras = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: numAlertasSemana } = await admin
        .from('alertas_variacao')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .gte('created_at', seteDiasAtras);

      const reportData: WeeklyReportData = {
        nome: u.nome || 'investidor(a)',
        numAtivos: list.length,
        totalInvestido,
        totalAtual,
        variacaoPct,
        porClasse: Array.from(porClasseMap.entries())
          .map(([classe, total]) => ({ classe, total }))
          .sort((a, b) => b.total - a.total),
        numAlertasSemana: numAlertasSemana ?? 0,
        appUrl,
      };

      const html = generateWeeklyReportHtml(reportData);

      const { error: sendErr } = await resend.emails.send({
        from: sender,
        to: u.email,
        subject: 'Seu resumo semanal — Nuvary Invest',
        html,
      });

      if (sendErr) throw new Error(sendErr.message);

      await admin
        .from('profiles')
        .update({ email_relatorios_ultimo_envio: new Date().toISOString() })
        .eq('id', u.id);

      sent++;
    } catch (err) {
      errors++;
      errorDetails.push({
        email: u.email,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent,
    skipped,
    errors,
    errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
  });
}
