'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage as ChatMessageType, InvestorProfileContext } from '@/types/chat';
import { buscarPerfilInvestidor } from '@/services/perfilService';
import { getAllAssets } from '@/services/portfolioService';
import {
  salvarMensagem,
  buscarMensagensPorConversa,
  gerarConversaId,
  contarMensagens,
  listarConversas,
  contarConversasIniciadasHoje,
} from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { FREE_LIMITS } from '@/lib/freeLimits';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Menu,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { STRINGS } from '@/constants/strings';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type ProfileType = 'conservador' | 'moderado' | 'arrojado' | 'agressivo';

// Valida e converte string para ProfileType
function toProfileType(value: string | undefined): ProfileType {
  const validTypes: ProfileType[] = ['conservador', 'moderado', 'arrojado', 'agressivo'];
  const lowercased = value?.toLowerCase() as ProfileType;
  return validTypes.includes(lowercased) ? lowercased : 'moderado';
}

// Extrai recommendedAllocation de respostas_completas de forma type-safe
interface RecommendedAllocation {
  rendaFixa: number;
  rendaVariavel: number;
  fundosImobiliarios: number;
  internacional: number;
}

const defaultAllocation: RecommendedAllocation = {
  rendaFixa: 40,
  rendaVariavel: 30,
  fundosImobiliarios: 20,
  internacional: 10,
};

function getRecommendedAllocation(respostas: unknown): RecommendedAllocation {
  if (respostas && typeof respostas === 'object' && 'recommendedAllocation' in respostas) {
    const allocation = (respostas as { recommendedAllocation?: RecommendedAllocation }).recommendedAllocation;
    if (allocation) return allocation;
  }
  return defaultAllocation;
}

interface ChatbotProps {
  initialProfile?: InvestorProfileContext | null;
}

export function Chatbot({ initialProfile = null }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<InvestorProfileContext | null>(initialProfile);
  const [portfolioAssets, setPortfolioAssets] = useState<Array<{ name: string; ticker: string; type: string; totalValue: number }>>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Estados para conversa atual
  const [conversaAtual, setConversaAtual] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0); // Para forçar re-render

  // Estados para paginação de mensagens antigas
  const [carregandoMais, setCarregandoMais] = useState(false);

  // Gate Premium: total de conversas para limitar plano Free
  const { isPremium, loading: premiumLoading } = usePremium();
  const [totalConversas, setTotalConversas] = useState<number>(0);

  // Auto-resize do textarea conforme o conteudo (padrao Claude/ChatGPT).
  // Limite max-height: 200px (CSS); acima disso o textarea ganha scroll vertical.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [inputValue]);

  // Preenche o input quando vem de outra pagina com ?q=... (ex: dashboard
  // → /chat?q=Devo rebalancear...). Roda apenas no mount + se o input
  // estiver vazio, e remove o query param da URL para nao reativar em
  // navegacoes subsequentes.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const q = searchParams?.get('q');
    if (!q || inputValue) return;
    setInputValue(q);
    inputRef.current?.focus();
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega o perfil do Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!profile && user) {
        try {
          const perfilData = await buscarPerfilInvestidor();
          if (perfilData) {
            const profileType = toProfileType(perfilData.perfil_risco);
            const profileContext: InvestorProfileContext = {
              type: profileType,
              name: profileType.charAt(0).toUpperCase() + profileType.slice(1),
              score: perfilData.nivel_conhecimento || 0,
              recommendedAllocation: getRecommendedAllocation(perfilData.respostas_completas),
            };
            setProfile(profileContext);
            localStorage.setItem('investorProfile', JSON.stringify(profileContext));
          }
        } catch (e) {
          console.error('Erro ao carregar perfil do Supabase:', e);
          const savedProfile = localStorage.getItem('investorProfile');
          if (savedProfile) {
            try {
              setProfile(JSON.parse(savedProfile));
            } catch (err) {
              console.error('Erro ao carregar perfil do localStorage:', err);
            }
          }
        }
      }
    };
    loadProfile();
  }, [profile, user]);

  // Carrega a carteira do Supabase
  useEffect(() => {
    if (!user) return;
    getAllAssets().then(assets => {
      setPortfolioAssets(assets.map(a => ({
        name: a.name,
        ticker: a.ticker,
        type: a.type,
        totalValue: a.totalValue,
      })));
    }).catch(() => {});
  }, [user]);

  // Inicializa com mensagem de boas-vindas (sempre ignora gate — apenas
  // recria a tela inicial, nao adiciona conversa permanente ate a primeira
  // mensagem ser enviada).
  useEffect(() => {
    if (!isInitialized && user) {
      setIsInitialized(true);
      iniciarNovaConversa({ ignorarGate: true });
    } else if (!user) {
      setIsInitialized(true);
      iniciarNovaConversa({ ignorarGate: true });
    }
  }, [user, isInitialized]);

  // Scroll para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Conta conversas que o usuario iniciou HOJE (gate Free de 10/dia, renova a meia-noite)
  const recarregarTotalConversas = useCallback(async () => {
    if (!user) return;
    try {
      const total = await contarConversasIniciadasHoje();
      setTotalConversas(total);
    } catch {
      // silencioso — gate usa 0 e nao bloqueia
    }
  }, [user]);

  useEffect(() => {
    recarregarTotalConversas();
  }, [recarregarTotalConversas, sidebarKey]);

  const limiteConversasAtingido =
    !isPremium && !premiumLoading && totalConversas >= FREE_LIMITS.MAX_CONVERSAS;

  // Inicia nova conversa — com gate Free de MAX_CONVERSAS
  const iniciarNovaConversa = (opts?: { ignorarGate?: boolean }) => {
    if (!opts?.ignorarGate && limiteConversasAtingido) {
      router.push('/premium');
      return;
    }
    const novoId = gerarConversaId();
    setConversaAtual(novoId);
    setMessages([]);
    setShowQuickActions(true);

    // Adiciona mensagem de boas-vindas
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      role: 'assistant',
      content: profile
        ? STRINGS.chat.boasVindasComPerfil(profile.name)
        : STRINGS.chat.boasVindasSemPerfil,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // Carrega conversa existente
  const carregarConversa = async (conversaId: string) => {
    if (conversaId === 'sem_conversa') {
      // Conversas antigas sem ID - carregar todas mensagens sem conversa_id
      setConversaAtual(null);
      setMessages([]);
      setShowQuickActions(false);
      return;
    }

    setConversaAtual(conversaId);
    setShowQuickActions(false);

    try {
      const mensagens = await buscarMensagensPorConversa(conversaId);
      if (mensagens && mensagens.length > 0) {
        const mensagensCarregadas: ChatMessageType[] = mensagens.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(mensagensCarregadas);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Erro ao carregar conversa:', e);
    }
  };

  // Handler para limpar histórico — historico foi zerado, pode criar sem gate
  const handleHistoricoLimpo = () => {
    iniciarNovaConversa({ ignorarGate: true });
    setSidebarKey(prev => prev + 1); // Força re-render da sidebar
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Gate Free: se vai iniciar uma nova conversa (so tem mensagem de
    // boas-vindas) e ja atingiu o limite, redireciona para /premium.
    const ehNovaConversa = messages.length <= 1 && messages[0]?.id === 'welcome';
    if (ehNovaConversa && limiteConversasAtingido) {
      router.push('/premium');
      return;
    }

    setShowQuickActions(false);
    setInputValue('');

    // Se não tem conversa atual, cria uma nova
    let currentConversaId = conversaAtual;
    if (!currentConversaId) {
      currentConversaId = gerarConversaId();
      setConversaAtual(currentConversaId);
    }

    // Adiciona mensagem do usuário
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Salva mensagem do usuário no Supabase
    if (user) {
      try {
        await salvarMensagem('user', content.trim(), currentConversaId);
      } catch (e) {
        console.error(STRINGS.chat.erroSalvarMensagem, e);
      }
    }

    // Adiciona mensagem de loading do assistente
    const loadingId = generateId();
    const loadingMessage: ChatMessageType = {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      // Prepara o histórico de conversação (últimas 10 mensagens)
      const conversationHistory = messages
        .filter((m) => !m.isLoading && m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Monta contexto do usuário para o backend
      const userContext = {
        ...(profile && {
          profile: {
            nome: profile.name,
            tipo: profile.type,
            pontuacao: profile.score,
            rf: profile.recommendedAllocation.rendaFixa,
            rv: profile.recommendedAllocation.rendaVariavel,
            fii: profile.recommendedAllocation.fundosImobiliarios,
            intl: profile.recommendedAllocation.internacional,
          },
        }),
        ...(portfolioAssets.length > 0 && { portfolio: portfolioAssets }),
      };

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
          userContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || STRINGS.errors.erroServidor);
      }

      const data = await response.json();
      const assistantContent = data.content || STRINGS.errors.naoConseguiProcessar;

      // Salva resposta do assistente no Supabase
      if (user) {
        try {
          await salvarMensagem('assistant', assistantContent, currentConversaId);
          // Atualiza sidebar para mostrar nova conversa
          setSidebarKey(prev => prev + 1);
        } catch (e) {
          console.error('Erro ao salvar resposta do assistente:', e);
        }
      }

      // Substitui a mensagem de loading pela resposta
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: assistantContent,
                isLoading: false,
              }
            : m
        )
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${errorMsg}`,
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, profile, user, conversaAtual, limiteConversasAtingido, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (prompt: string) => {
    // Apenas preenche o input — o usuario revisa/edita e envia manualmente.
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const profileColors = {
    conservador: 'bg-blue-500',
    moderado: 'bg-green-500',
    arrojado: 'bg-amber-500',
    agressivo: 'bg-red-500',
  };

  return (
    <div className="flex h-full bg-[var(--bg)]">
      {/* Sidebar de conversas */}
      {user && (
        <ChatSidebar
          key={sidebarKey}
          conversaAtual={conversaAtual}
          onNovaConversa={() => iniciarNovaConversa()}
          onSelecionarConversa={carregarConversa}
          onLimparHistorico={handleHistoricoLimpo}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg)]">
        {/* Header — avatar gradient + titulo + badge perfil ambar */}
        <div className="bg-[var(--surface-1)] border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile menu toggle */}
              {user && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden w-9 h-9 grid place-items-center rounded-[var(--r-pill)] text-[var(--t2)] hover:text-[var(--cyan)] hover:bg-[rgba(0,184,217,0.08)] transition-colors"
                  aria-label="Abrir histórico"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <div
                className="w-12 h-12 rounded-full grid place-items-center shrink-0 overflow-hidden"
                style={{ background: 'white' }}
              >
                <Image
                  src="/brand/nuvary-icon.png"
                  alt="Nuvary"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-[var(--t1)]">
                  Assistente Nuvary
                </h1>
                <p className="text-[12.5px] text-[var(--t2)] truncate">
                  Seu consultor de investimentos com IA
                </p>
              </div>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-3 shrink-0">
              {profile && (
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--r-pill)] text-[13px] font-bold border"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    borderColor: 'rgba(245, 158, 11, 0.25)',
                    color: 'var(--warn)',
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  {profile.name}
                </span>
              )}

              {!user && (
                <Link href="/login">
                  <Button size="sm" variant="outline" className="text-xs">
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Aviso de limite Free atingido */}
              {!isPremium && !premiumLoading && totalConversas > 0 && (
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--r-md)] mb-6"
                  style={{
                    background: limiteConversasAtingido
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.10), transparent 60%), var(--surface-1)'
                      : 'var(--surface-1)',
                    border: `1px solid ${limiteConversasAtingido ? 'rgba(239,68,68,0.30)' : 'var(--border)'}`,
                  }}
                >
                  <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>
                    Plano Free:{' '}
                    <strong style={{ color: 'var(--t1)' }}>
                      {totalConversas} de {FREE_LIMITS.MAX_CONVERSAS}
                    </strong>{' '}
                    conversas hoje.
                    {limiteConversasAtingido
                      ? ' Limite renova amanhã. Faça upgrade para conversas ilimitadas.'
                      : ` Restam ${FREE_LIMITS.MAX_CONVERSAS - totalConversas} hoje.`}
                  </span>
                  <button
                    onClick={() => router.push('/premium')}
                    className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-[var(--r-pill)] text-white shrink-0"
                    style={{ background: 'var(--cyan)' }}
                  >
                    Fazer upgrade
                  </button>
                </div>
              )}

              {/* Status indicator pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-pill)] text-[12.5px] font-medium mx-auto mb-8"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--t2)',
                  display: 'flex',
                  width: 'fit-content',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                <Bot className="w-4 h-4 text-[var(--cyan)]" />
                <span>Chat ativo</span>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--gain)' }}
                />
              </div>

              {/* Messages */}
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Quick Actions */}
              {showQuickActions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10"
                >
                  <p className="text-[13px] text-[var(--t2)] mb-4 text-center">
                    {STRINGS.chat.escolhaOpcao}
                  </p>
                  <QuickActions onAction={handleQuickAction} disabled={isLoading} />
                </motion.div>
              )}

              {/* Questionnaire CTA */}
              {!profile && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8"
                >
                  <div
                    className="rounded-[var(--r-lg)] p-4 flex items-center justify-between gap-4"
                    style={{
                      background: 'rgba(0,184,217,0.06)',
                      border: '1px solid rgba(0,184,217,0.25)',
                    }}
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--t1)]">
                        Quer respostas personalizadas?
                      </p>
                      <p className="text-[12.5px] text-[var(--t2)]">
                        Descubra seu perfil de investidor
                      </p>
                    </div>
                    <Link href="/questionario">
                      <Button
                        className="text-white px-5"
                        style={{ background: 'var(--cyan)' }}
                      >
                        {STRINGS.chat.fazerQuestionario}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div
          className="border-t px-6 py-4"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div
                className="flex-1 rounded-[var(--r-md)] flex items-end"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      if (inputValue.trim() && !isLoading) sendMessage(inputValue);
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 resize-none bg-transparent px-4 py-3 text-[14px] leading-relaxed text-[var(--t1)] placeholder:text-[var(--t3)] focus:outline-none min-h-[48px] max-h-[200px] overflow-y-auto disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 grid place-items-center rounded-full text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:-translate-y-[1px]"
                style={{
                  background: 'var(--cyan)',
                  boxShadow: '0 4px 14px rgba(0,184,217,0.28)',
                }}
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11.5px] text-[var(--t3)] mt-3 text-center">
              {STRINGS.chat.respostasIADisclaimer}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
