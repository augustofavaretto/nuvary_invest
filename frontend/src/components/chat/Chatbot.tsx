'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage as ChatMessageType, InvestorProfileContext } from '@/types/chat';
import { buscarPerfilInvestidor } from '@/services/perfilService';
import {
  salvarMensagem,
  buscarMensagensPorConversa,
  gerarConversaId,
  contarMensagens,
} from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
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
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Estados para conversa atual
  const [conversaAtual, setConversaAtual] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0); // Para forçar re-render

  // Estados para paginação de mensagens antigas
  const [carregandoMais, setCarregandoMais] = useState(false);

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

  // Inicializa com mensagem de boas-vindas
  useEffect(() => {
    if (!isInitialized && user) {
      setIsInitialized(true);
      iniciarNovaConversa();
    } else if (!user) {
      setIsInitialized(true);
      iniciarNovaConversa();
    }
  }, [user, isInitialized]);

  // Scroll para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Inicia nova conversa
  const iniciarNovaConversa = () => {
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

  // Handler para limpar histórico
  const handleHistoricoLimpo = () => {
    iniciarNovaConversa();
    setSidebarKey(prev => prev + 1); // Força re-render da sidebar
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

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

      // Prepara o contexto do perfil
      const profileContext = profile
        ? '\n\n' + STRINGS.chat.contextoUsuario(profile.name, profile.type, profile.score, profile.recommendedAllocation.rendaFixa, profile.recommendedAllocation.rendaVariavel, profile.recommendedAllocation.fundosImobiliarios, profile.recommendedAllocation.internacional)
        : '';

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content + profileContext,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(STRINGS.errors.erroServidor);
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
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, profile, user, conversaAtual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const profileColors = {
    conservador: 'bg-blue-500',
    moderado: 'bg-green-500',
    arrojado: 'bg-amber-500',
    agressivo: 'bg-red-500',
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      {user && (
        <ChatSidebar
          key={sidebarKey}
          conversaAtual={conversaAtual}
          onNovaConversa={iniciarNovaConversa}
          onSelecionarConversa={carregarConversa}
          onLimparHistorico={handleHistoricoLimpo}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden text-[#6B7280]"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full nuvary-gradient flex items-center justify-center">
                    <Image
                      src="/logo-icon.png"
                      alt="Nuvary"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-semibold text-[#0B1F33]">
                    Assistente Nuvary
                  </h1>
                  <p className="text-xs text-[#6B7280]">
                    Seu consultor de investimentos com IA
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Badge */}
            <div className="flex items-center gap-3">
              {profile && (
                <Badge
                  className={`${profileColors[profile.type as keyof typeof profileColors] || 'bg-gray-500'} text-white px-2 py-0.5 text-xs`}
                >
                  <User className="w-3 h-3 mr-1" />
                  {profile.name}
                </Badge>
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
            <div className="max-w-4xl mx-auto px-4 py-6">
              {/* Status indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280] mb-6">
                <Bot className="w-4 h-4 text-[#00B8D9]" />
                <span>Chat ativo</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
                  className="mt-8"
                >
                  <p className="text-sm text-[#6B7280] mb-4 text-center">
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
                  <Card className="border-[#00B8D9]/30 bg-[#00B8D9]/5">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0B1F33]">
                          Quer respostas personalizadas?
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Descubra seu perfil de investidor
                        </p>
                      </div>
                      <Link href="/questionario">
                        <Button className="nuvary-gradient text-white">
                          {STRINGS.chat.fazerQuestionario}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#E5E7EB] p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="
                  flex-1 border-[#E5E7EB] bg-[#F9FAFB]
                  focus:border-[#00B8D9] focus:ring-[#00B8D9]/20
                  placeholder:text-[#6B7280] h-12
                "
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="nuvary-gradient text-white hover:opacity-90 px-6 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-[#6B7280] mt-2 text-center">
              Powered by OpenAI • {STRINGS.chat.respostasIADisclaimer}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
