import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout';
import {
  ArrowRight,
  CheckCircle2,
  Brain,
  GraduationCap,
  PieChart,
  MessageSquare,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Image
              src="/logo-vertical.png"
              alt="Nuvary Invest"
              width={120}
              height={120}
              className="mx-auto h-24 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Invista com{' '}
            <span className="text-[#00B8D9]">inteligência</span>
            <br />e alcance seus objetivos
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma de consultoria de investimentos orientada por Inteligência
            Artificial, com foco em automação de carteiras e educação financeira.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="w-full sm:w-auto nuvary-gradient border-0">
                Começar grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9]/10">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
          Por que escolher a <span className="text-[#00B8D9]">Nuvary Invest</span>?
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 nuvary-gradient rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Inteligência Artificial</h3>
              <p className="text-muted-foreground text-sm">
                Recomendações personalizadas baseadas em IA para otimizar sua
                carteira de investimentos.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 nuvary-gradient rounded-xl flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Análise de Perfil</h3>
              <p className="text-muted-foreground text-sm">
                Questionário completo para identificar seu perfil de investidor
                e tolerância a risco.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 nuvary-gradient rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Educação Financeira</h3>
              <p className="text-muted-foreground text-sm">
                Trilhas de aprendizado para desenvolver sua inteligência
                financeira.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 nuvary-gradient rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Chatbot Inteligente</h3>
              <p className="text-muted-foreground text-sm">
                Assistente virtual para tirar dúvidas sobre investimentos
                e análises de mercado em tempo real.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#0B1F33] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00B8D9] mb-2">4</div>
              <div className="text-white/80 text-sm">Perfis de Investidor</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00B8D9] mb-2">10</div>
              <div className="text-white/80 text-sm">Perguntas Objetivas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00B8D9] mb-2">2min</div>
              <div className="text-white/80 text-sm">Tempo Médio</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#00B8D9] mb-2">100%</div>
              <div className="text-white/80 text-sm">Gratuito</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-0 shadow-xl nuvary-gradient text-white overflow-hidden">
          <CardContent className="p-8 md:p-12 relative">
            <div className="max-w-2xl relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Pronto para começar sua jornada?
              </h3>
              <p className="text-white/80 mb-6">
                Descubra seu perfil de investidor em apenas 2 minutos e receba
                recomendações personalizadas para sua carteira.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>10 perguntas objetivas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Resultado instantâneo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Alocação recomendada</span>
                </li>
              </ul>
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="bg-white text-[#00B8D9] hover:bg-white/90 font-semibold"
                >
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            {/* Decorative element */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-icon.png"
                alt="Nuvary Invest"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-sm text-muted-foreground">
                © 2024 Nuvary Invest. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/questionario"
                className="text-sm text-muted-foreground hover:text-[#00B8D9] transition-colors"
              >
                Questionário
              </Link>
              <Link
                href="/chat"
                className="text-sm text-muted-foreground hover:text-[#00B8D9] transition-colors"
              >
                Assistente IA
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-[#00B8D9] transition-colors"
              >
                Sobre
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
