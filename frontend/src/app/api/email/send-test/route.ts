import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMail, isEmailConfigured } from '@/lib/email-sender';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  generateWeeklyReportHtml,
  type WeeklyReportData,
} from '@/lib/email-templates/weekly-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

// Endpoint de teste — usuario autenticado dispara envio do relatorio
// imediatamente para o proprio e-mail, ignorando a janela de idempotencia.
// Retorna detalhes do que aconteceu para facilitar diagnostico.
export async function POST(req: NextRequest) {
  // 1. Autentica o usuario via Bearer token (session do Supabase)
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, error: 'Token de autenticacao ausente' },
      { status: 401 },
    );
  }

  // 2. Valida o token e descobre o user_id
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase nao configurado no servidor' },
      { status: 500 },
    );
  }

  const sessionClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: sessionData, error: sessionErr } = await sessionClient.auth.getUser();
  if (sessionErr || !sessionData.user) {
    return NextResponse.json(
      { ok: false, error: 'Sessao invalida ou expirada' },
      { status: 401 },
    );
  }

  const userId = sessionData.user.id;

  // 3. Confere variaveis de ambiente
  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'GMAIL_USER / GMAIL_APP_PASSWORD ausentes no Vercel. Adicione em Settings → Environment Variables.',
      },
      { status: 500 },
    );
  }

  // 4. Carrega o profile via service role (driblando RLS, mas filtrando por userId)
  const admin = getSupabaseAdmin();
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('id, nome, email, email_relatorios_ativo')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json(
      { ok: false, error: 'Profile do usuario nao encontrado' },
      { status: 404 },
    );
  }

  if (!profile.email) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'O campo email do seu profile esta vazio no banco. Atualize em /perfil ou diretamente no Supabase (profiles.email).',
        diagnostic: { profile },
      },
      { status: 400 },
    );
  }

  // 5. Monta o relatorio
  const { data: assets } = await admin
    .from('portfolio_assets')
    .select('type, quantity, average_price, total_value, data_aplicacao, created_at')
    .eq('user_id', userId);

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

  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: numAlertasSemana } = await admin
    .from('alertas_variacao')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', seteDiasAtras);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvary-invest.vercel.app';
  const reportData: WeeklyReportData = {
    nome: profile.nome || 'investidor(a)',
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

  // 6. Envia o e-mail via Gmail SMTP
  try {
    const { from: sender } = await sendMail({
      to: profile.email,
      subject: '[TESTE] Seu resumo diario — Nuvary Invest',
      html: generateWeeklyReportHtml(reportData),
    });

    // Atualiza ultimo envio para ficar coerente com o cron (idempotencia)
    await admin
      .from('profiles')
      .update({ email_relatorios_ultimo_envio: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({
      ok: true,
      sentTo: profile.email,
      sender,
      relatorioAtivo: profile.email_relatorios_ativo,
      observacao: profile.email_relatorios_ativo
        ? 'Toggle de relatorios diarios ativo — voce recebera todos os dias as 8h BRT.'
        : 'Atencao: toggle de relatorios diarios esta DESLIGADO em /configuracoes. O cron diario nao enviara, apenas testes manuais.',
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Falha desconhecida no envio',
      },
      { status: 500 },
    );
  }
}
