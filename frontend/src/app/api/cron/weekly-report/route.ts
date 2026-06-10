import { NextRequest, NextResponse } from 'next/server';
import { sendMail, isEmailConfigured } from '@/lib/email-sender';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  generateWeeklyReportHtml,
  type WeeklyReportData,
} from '@/lib/email-templates/weekly-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Janela de idempotencia para envio diario: 20h. Se o cron disparar duas
// vezes no mesmo dia (manualmente via "Run" + agendamento), o segundo
// envio e pulado.
const IDEMPOTENCY_WINDOW_MS = 20 * 60 * 60 * 1000;

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
  data_aplicacao: string | null;
  created_at: string | null;
}

// Conta dias úteis (seg–sex) entre duas datas. Ignora feriados (aproximação).
function businessDaysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  const totalDays = Math.floor(ms / 86_400_000);
  const fullWeeks = Math.floor(totalDays / 7);
  let businessDays = fullWeeks * 5;
  let dow = start.getDay();
  for (let i = 0; i < totalDays - fullWeeks * 7; i++) {
    dow = (dow + 1) % 7;
    if (dow !== 0 && dow !== 6) businessDays++;
  }
  return businessDays;
}

// Rendimento acumulado da renda fixa: juros compostos da taxa (% a.a.) em
// base 252 dias úteis desde a data de aplicação (fallback: created_at).
function rendaFixaAtual(a: AssetRow): number {
  const invested = Number(a.quantity);
  const rate = Number(a.average_price);
  const startStr = a.data_aplicacao || a.created_at;
  if (!startStr || rate <= 0 || invested <= 0) return invested;
  const du = businessDaysBetween(new Date(startStr), new Date());
  return invested * Math.pow(1 + rate / 100, du / 252);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'GMAIL_USER / GMAIL_APP_PASSWORD nao configurados' },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvary-invest.vercel.app';
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
      now - new Date(u.email_relatorios_ultimo_envio).getTime() < IDEMPOTENCY_WINDOW_MS
    ) {
      skipped++;
      continue;
    }

    try {
      const { data: assets } = await admin
        .from('portfolio_assets')
        .select('type, quantity, average_price, total_value, data_aplicacao, created_at')
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
        // Renda fixa: rendimento acumulado pela taxa × dias úteis. Demais: total_value.
        const atual = isFixedIncome
          ? rendaFixaAtual(a)
          : Number(a.total_value) || investido;

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

      await sendMail({
        to: u.email,
        subject: 'Seu resumo diário — Nuvary Invest',
        html,
      });

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
