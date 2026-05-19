'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  ChartPie,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Bell,
  TrendingUp,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Dúvidas', href: '#faq' },
];

const BENEFITS = [
  {
    icon: Brain,
    title: 'Inteligência Artificial',
    text: 'Recomendações personalizadas baseadas no seu perfil de risco, horizonte e objetivos — explicadas em linguagem simples.',
  },
  {
    icon: ChartPie,
    title: 'Análise de Perfil',
    text: 'Questionário objetivo de 10 perguntas que define em 2 minutos seu perfil entre conservador, moderado, arrojado ou agressivo.',
  },
  {
    icon: GraduationCap,
    title: 'Educação Financeira',
    text: 'Trilhas progressivas com aulas, glossários e webinars para você decidir com autonomia — não no escuro.',
  },
  {
    icon: MessageSquare,
    title: 'Chatbot Inteligente',
    text: 'Assistente virtual 24/7 para tirar dúvidas sobre investimentos, conceitos e análises de mercado em tempo real.',
  },
  {
    icon: TrendingUp,
    title: 'Rebalanceamento Automático',
    text: 'Robo-advisor que mantém sua carteira alinhada ao alvo conforme oscilações do mercado e mudanças no seu perfil.',
  },
  {
    icon: Bell,
    title: 'Monitoramento em Tempo Real',
    text: 'Alertas de variação, eventos e risco direto no painel — sem precisar acompanhar manualmente toda hora.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Crie sua conta grátis',
    text: 'Cadastro rápido com seus dados básicos. Sem cartão de crédito, sem letra miúda.',
  },
  {
    n: '02',
    title: 'Descubra seu perfil',
    text: 'Responda 10 perguntas objetivas em 2 minutos. A IA classifica seu perfil de investidor e horizonte.',
  },
  {
    n: '03',
    title: 'Receba sua carteira',
    text: 'Alocação recomendada, rebalanceamento automático e trilhas educacionais sob medida.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Mariana Castro',
    role: 'Designer, 27 anos · Porto Alegre',
    text:
      'Eu sabia que precisava investir, mas travava com tanto jargão. O chatbot da Nuvary me explicou cada recomendação como se fosse um amigo. Em um mês já tinha reserva de emergência montada.',
    rating: 5,
    initials: 'MC',
  },
  {
    name: 'Rafael Bonato',
    role: 'Engenheiro de Software, 34 anos · São Paulo',
    text:
      'Migrei da XP para acompanhar tudo num lugar só. O rebalanceamento automático sozinho já paga o Premium — economizo umas 4h por mês que gastava planilhando carteira.',
    rating: 5,
    initials: 'RB',
  },
  {
    name: 'Júlia Mendes',
    role: 'Estudante de Administração, 21 anos · Curitiba',
    text:
      'As trilhas de educação financeira são absurdamente didáticas. Aprendi mais aqui em 3 semanas do que em meses tentando ler conteúdo solto no YouTube.',
    rating: 5,
    initials: 'JM',
  },
  {
    name: 'Carlos Henrique Lima',
    role: 'Médico, 41 anos · Belo Horizonte',
    text:
      'Não tenho tempo para acompanhar mercado todo dia. A Nuvary cuida do monitoramento e me avisa só quando algo realmente importa. Tranquilidade que vale o preço.',
    rating: 5,
    initials: 'CHL',
  },
];

const FAQS = [
  {
    q: 'A Nuvary Invest é uma corretora?',
    a: 'Não. Somos uma plataforma de educação financeira e gestão informacional de carteiras. Operamos como consultoria orientada por Inteligência Artificial, sem custodiar seus recursos ou intermediar ordens. As operações são executadas pelas instituições financeiras de sua escolha.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Operamos em conformidade com a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet. Toda a infraestrutura roda em nuvem AWS com criptografia, e nunca compartilhamos seus dados com terceiros sem consentimento explícito.',
  },
  {
    q: 'Preciso já ter dinheiro investido?',
    a: 'Não. A plataforma serve tanto para quem está começando do zero quanto para quem já tem carteira e quer otimizar. As trilhas educacionais e o perfil de investidor são gratuitos.',
  },
  {
    q: 'Posso cancelar o Premium quando quiser?',
    a: 'Sim, sem fidelidade nem multa. O cancelamento é feito em um clique no próprio painel e você continua com acesso até o final do período já pago.',
  },
  {
    q: 'Como funcionam as recomendações da IA?',
    a: 'Combinamos seu perfil de risco, objetivos e horizonte com dados de mercado em tempo real (B3, Alpaca, NewsAPI) para sugerir alocações coerentes. Cada recomendação vem com explicação clara — você decide se aplica ou não.',
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const manrope = { fontFamily: 'var(--font-manrope)' } as const;

  return (
    <div
      className="min-h-screen bg-[#020817] text-slate-100 antialiased overflow-x-hidden"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* Background atmospherics */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.08),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* NAV */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#020817]/80 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-extrabold tracking-tight text-lg" style={manrope}>
              Nuvary <span className="text-cyan-400">Invest</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-[0_0_30px_-8px_rgba(6,182,212,0.6)]"
            >
              Criar conta
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-slate-200"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-[#020817]/95 backdrop-blur-xl">
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-slate-300 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex gap-2 pt-3 mt-2 border-t border-white/[0.06]">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 rounded-lg border border-white/10 text-slate-200"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex-1 text-center py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs font-medium text-cyan-300 mb-6">
              <Sparkles size={14} />
              Consultoria de investimentos com IA
            </div>

            <h1
              className="font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]"
              style={manrope}
            >
              Invista com{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                  inteligência.
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0" />
              </span>
              <br />
              Alcance seus objetivos.
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
              Plataforma de consultoria orientada por Inteligência Artificial,
              com automação de carteiras, monitoramento em tempo real e
              educação financeira contínua — tudo em um só lugar.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/cadastro"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_40px_-10px_rgba(6,182,212,0.7)]"
              >
                Começar grátis
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 transition-colors"
              >
                Já tenho conta
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                Conformidade LGPD
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Sem cartão de crédito
              </div>
            </div>
          </div>

          <HeroPortfolioMock />
        </div>

        {/* Stats strip */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              { k: '4', l: 'Perfis de Investidor' },
              { k: '10', l: 'Perguntas Objetivas' },
              { k: '2min', l: 'Tempo Médio' },
              { k: '100%', l: 'Gratuito para começar' },
            ].map((s) => (
              <div key={s.l} className="bg-[#0a1428] p-6 sm:p-7 text-center">
                <div
                  className="font-extrabold text-3xl sm:text-4xl text-cyan-400"
                  style={manrope}
                >
                  {s.k}
                </div>
                <div className="text-sm text-slate-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="beneficios" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Benefícios
            </p>
            <h2
              className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={manrope}
            >
              Por que escolher a <span className="text-cyan-400">Nuvary Invest</span>?
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Unimos tecnologia, didática e personalização para te dar autonomia
              real sobre o seu dinheiro.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.08),transparent_60%)]" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                    <b.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={manrope}>
                    {b.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Como funciona
            </p>
            <h2
              className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={manrope}
            >
              Três passos. Dois minutos.
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Do cadastro à primeira recomendação personalizada.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] h-full">
                  <div
                    className="font-extrabold text-5xl bg-gradient-to-br from-cyan-300 to-sky-500 bg-clip-text text-transparent"
                    style={manrope}
                  >
                    {s.n}
                  </div>
                  <h3 className="font-bold text-xl mt-4 mb-2" style={manrope}>
                    {s.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{s.text}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Planos
            </p>
            <h2
              className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={manrope}
            >
              Comece grátis. Evolua quando quiser.
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Sem fidelidade. Sem letra miúda. Cancele em um clique.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* FREE */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-sm font-semibold text-slate-300">Free</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-extrabold text-5xl" style={manrope}>
                  R$ 0
                </span>
                <span className="text-slate-400 text-sm">/mês</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Para começar a entender seu perfil e investir com clareza.
              </p>

              <Link
                href="/cadastro"
                className="mt-6 block text-center py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
              >
                Criar conta grátis
              </Link>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  'Análise de perfil de investidor',
                  '10 perguntas objetivas em 2 minutos',
                  'Alocação recomendada inicial',
                  'Conteúdo educacional básico',
                  'Acesso ao chatbot (limitado)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-slate-300">
                    <Check size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PREMIUM */}
            <div className="relative p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/[0.08] to-sky-500/[0.04] shadow-[0_0_60px_-20px_rgba(6,182,212,0.4)]">
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold">
                Mais escolhido
              </div>
              <div className="text-sm font-semibold text-cyan-300">Premium</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-extrabold text-5xl" style={manrope}>
                  R$ 49,90
                </span>
                <span className="text-slate-400 text-sm">/mês</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Para quem quer levar a sério a construção de patrimônio.
              </p>

              <Link
                href="/cadastro"
                className="mt-6 block text-center py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
              >
                Começar Premium
              </Link>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  'Tudo do plano Free',
                  'Recomendações personalizadas por IA',
                  'Rebalanceamento automático de carteira',
                  'Monitoramento em tempo real e alertas',
                  'Trilhas educacionais completas + webinars',
                  'Chatbot ilimitado com contexto da carteira',
                  'Relatórios detalhados em PDF',
                  'Suporte humano para casos complexos',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-slate-200">
                    <Check size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Depoimentos
            </p>
            <h2
              className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={manrope}
            >
              Histórias reais de quem deixou o medo de lado.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col"
              >
                <div className="flex items-center gap-1 text-cyan-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="text-slate-200 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center font-bold text-slate-950 text-sm"
                    style={manrope}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Dúvidas frequentes
            </p>
            <h2
              className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={manrope}
            >
              Tudo o que você quer saber.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {FAQS.map((f, i) => (
              <div
                key={f.q}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-100">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform shrink-0 ml-4 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-white/[0.04] pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-600 p-10 sm:p-14">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-10 -bottom-32 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative max-w-xl">
              <h2
                className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight"
                style={manrope}
              >
                Pronto para começar sua jornada?
              </h2>
              <p className="mt-4 text-white/90 text-lg">
                Descubra seu perfil de investidor em 2 minutos e receba
                recomendações personalizadas para sua carteira.
              </p>

              <ul className="mt-6 space-y-2.5 text-white/90">
                {[
                  '10 perguntas objetivas',
                  'Resultado instantâneo',
                  'Alocação recomendada',
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {x}
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-cyan-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Criar conta grátis
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <LogoMark small />
            <span>© 2026 Nuvary Invest. Todos os direitos reservados.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#beneficios" className="hover:text-slate-200">
              Benefícios
            </a>
            <Link href="/termos" className="hover:text-slate-200">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-slate-200">
              Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* -------- helpers -------- */

function LogoMark({ small = false }: { small?: boolean }) {
  const size = small ? 22 : 28;
  return (
    <div
      className="rounded-md bg-white flex items-center justify-center"
      style={{ width: size + 8, height: size + 8 }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path
          d="M7 19c-2.2 0-4-1.8-4-4s1.8-4 4-4c.3-2.8 2.7-5 5.5-5 2.1 0 4 1.2 4.9 3 .6-.2 1.2-.3 1.8-.3 3 0 5.4 2.4 5.4 5.3 1.9.4 3.4 2.1 3.4 4.1 0 2.3-1.9 4.2-4.2 4.2"
          stroke="#0e7490"
          strokeWidth="1.5"
          fill="#ecfeff"
        />
        <rect x="9" y="15" width="2.8" height="6" fill="#06b6d4" rx="0.5" />
        <rect x="13.5" y="12" width="2.8" height="9" fill="#06b6d4" rx="0.5" />
        <rect x="18" y="14" width="2.8" height="7" fill="#06b6d4" rx="0.5" />
      </svg>
    </div>
  );
}

function HeroPortfolioMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0a1428] to-[#0f1c33] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs text-slate-400">Sua carteira</div>
            <div
              className="font-bold text-2xl mt-0.5"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              R$ 47.382,<span className="text-slate-400">10</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <TrendingUp size={12} />
            +12,4%
          </div>
        </div>

        <div className="h-28 rounded-xl bg-[#020817]/40 border border-white/[0.04] p-3 mb-5 relative overflow-hidden">
          <svg viewBox="0 0 300 90" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,70 L20,65 L40,68 L60,55 L80,58 L100,45 L120,48 L140,38 L160,40 L180,28 L200,32 L220,22 L240,25 L260,15 L280,18 L300,10 L300,90 L0,90 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M0,70 L20,65 L40,68 L60,55 L80,58 L100,45 L120,48 L140,38 L160,40 L180,28 L200,32 L220,22 L240,25 L260,15 L280,18 L300,10"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-2.5">
          {[
            { name: 'Renda Fixa', pct: 50, color: 'bg-cyan-400' },
            { name: 'Ações Brasil', pct: 30, color: 'bg-sky-400' },
            { name: 'ETFs Globais', pct: 15, color: 'bg-indigo-400' },
            { name: 'Caixa', pct: 5, color: 'bg-slate-400' },
          ].map((a) => (
            <div key={a.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">{a.name}</span>
                <span className="text-slate-400 font-mono">{a.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className={`h-full ${a.color} rounded-full`}
                  style={{ width: `${a.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
          <Sparkles size={14} className="text-cyan-400" />
          <div className="text-xs text-slate-300">
            IA sugeriu rebalancear{' '}
            <span className="text-cyan-300 font-semibold">+2% em ETFs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
