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
import { ChatMessage as ChatMessageType, InvestorProfileContext } from '@/types/chat';
import {
  Send,
  Bot,
  RefreshCw,
  User,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ChatbotProps {
  initialProfile?: InvestorProfileContext | null;
}

export function Chatbot({ initialProfile = null }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<InvestorProfileContext | null>(initialProfile);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega o perfil do localStorage se existir
  useEffect(() => {
    if (!profile) {
      const savedProfile = localStorage.getItem('investorProfile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Erro ao carregar perfil:', e);
        }
      }
    }
  }, [profile]);

  // Scroll para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mensagem inicial do assistente
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: 'welcome',
        role: 'assistant',
        content: profile
          ? `Olá! Sou o assistente virtual da Nuvary Invest. Vi que seu perfil é **${profile.name}**. Como posso ajudá-lo hoje com seus investimentos?`
          : `Olá! Sou o assistente virtual da Nuvary Invest. Estou aqui para ajudá-lo com dúvidas sobre investimentos, análises de mercado e educação financeira. Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [profile, messages.length]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setShowQuickActions(false);
    setInputValue('');

    // Adiciona mensagem do usuário
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

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
        ? `\n\n[Contexto: O usuário tem perfil ${profile.name} (${profile.type}), com pontuação ${profile.score}. Alocação recomendada: Renda Fixa ${profile.recommendedAllocation.rendaFixa}%, Renda Variável ${profile.recommendedAllocation.rendaVariavel}%, FIIs ${profile.recommendedAllocation.fundosImobiliarios}%, Internacional ${profile.recommendedAllocation.internacional}%.]`
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
        throw new Error('Erro na comunicação com o servidor');
      }

      const data = await response.json();

      // Substitui a mensagem de loading pela resposta
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: data.content || 'Desculpe, não consegui processar sua mensagem.',
                isLoading: false,
              }
            : m
        )
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Substitui a mensagem de loading por erro
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
  }, [isLoading, messages, profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([]);
    setShowQuickActions(true);
  };

  const profileColors = {
    conservador: 'bg-blue-500',
    moderado: 'bg-green-500',
    arrojado: 'bg-amber-500',
    agressivo: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#00B8D9] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-[#6B7280] hover:text-[#00B8D9]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nova conversa
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full nuvary-gradient flex items-center justify-center">
                <Image
                  src="/logo-icon.png"
                  alt="Nuvary"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B1F33]">
                Assistente Nuvary
              </h1>
              <p className="text-sm text-[#6B7280]">
                Seu consultor de investimentos com IA
              </p>
            </div>
          </div>

          {/* Profile Badge */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <Badge
                className={`${profileColors[profile.type]} text-white px-3 py-1`}
              >
                <User className="w-3 h-3 mr-1.5" />
                Perfil: {profile.name}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Chat Card */}
        <Card className="border-[#E5E7EB] shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Bot className="w-4 h-4 text-[#00B8D9]" />
              <span>Chat ativo</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
              <div className="space-y-4">
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
                  className="mt-6"
                >
                  <p className="text-sm text-[#6B7280] mb-3 text-center">
                    Escolha uma opção ou digite sua pergunta:
                  </p>
                  <QuickActions onAction={handleQuickAction} disabled={isLoading} />
                </motion.div>
              )}
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="
                    flex-1 border-[#E5E7EB]
                    focus:border-[#00B8D9] focus:ring-[#00B8D9]/20
                    placeholder:text-[#6B7280]
                  "
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="nuvary-gradient text-white hover:opacity-90 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-[#6B7280] mt-2 text-center">
                Powered by OpenAI • As respostas são geradas por IA e não constituem recomendação de investimento
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Questionnaire CTA */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
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
                    Fazer questionário
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
