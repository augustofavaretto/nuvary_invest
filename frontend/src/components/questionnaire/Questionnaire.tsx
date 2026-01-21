'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionCard } from './QuestionCard';
import { ResultCard } from './ResultCard';
import { salvarPerfilInvestidor } from '@/services/perfilService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Question,
  QuestionnaireResult,
  Answers,
} from '@/types/questionnaire';
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  BarChart3,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Screen = 'intro' | 'questions' | 'loading' | 'result';

export function Questionnaire() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestionnaire();
  }, []);

  const fetchQuestionnaire = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/questionnaire`);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
      }
    } catch (err) {
      setError('Erro ao carregar questionário. Verifique se o servidor está rodando.');
      console.error('Erro ao carregar questionário:', err);
    }
  };

  const handleStart = () => {
    if (questions.length > 0) {
      setScreen('questions');
    }
  };

  const handleAnswerSelect = (value: string) => {
    const questionId = questions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await submitAnswers();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitAnswers = async () => {
    setScreen('loading');

    try {
      const userId = user?.id || `user_${Date.now()}`;
      const response = await fetch(`${API_URL}/profile/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers }),
      });

      const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (data.success) {
        // Salvar perfil no Supabase
        try {
          // Converte answers para objeto genérico para salvar
          const respostasObj = Object.entries(answers).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

          await salvarPerfilInvestidor({
            perfilRisco: data.profile?.type || data.profile,
            ...respostasObj,
          });
          console.log('Perfil salvo no Supabase com sucesso!');
        } catch (saveError) {
          console.error('Erro ao salvar perfil no Supabase:', saveError);
          // Não bloqueia o fluxo, apenas loga o erro
        }

        setResult(data);
        setScreen('result');
      } else {
        setError('Erro ao processar respostas.');
        setScreen('questions');
      }
    } catch (err) {
      setError('Erro ao enviar respostas.');
      setScreen('questions');
      console.error('Erro ao enviar respostas:', err);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setScreen('intro');
  };

  const handleGoToChat = () => {
    router.push('/chat');
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#6B7280] hover:text-[#0B1F33] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-icon.png"
                alt="Nuvary Invest"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-[#0B1F33]">Nuvary</span>
                <span className="text-xs font-medium text-[#00B8D9]">INVEST</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#EF4444]/10 text-[#EF4444] p-4 rounded-lg mb-6 text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border border-[#E5E7EB] shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 nuvary-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold mb-3 text-[#0B1F33]">
                    Questionário de Perfil de Investidor
                  </h2>
                  <p className="text-[#6B7280] mb-8 leading-relaxed">
                    Responda 10 perguntas rápidas e descubra qual é o seu perfil
                    de investidor. O resultado vai te ajudar a tomar melhores
                    decisões de investimento.
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#00B8D9]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-[#00B8D9]" />
                      </div>
                      <span className="text-sm text-[#6B7280]">
                        10 perguntas
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#00B8D9]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-[#00B8D9]" />
                      </div>
                      <span className="text-sm text-[#6B7280]">
                        2 minutos
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#00B8D9]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-6 h-6 text-[#00B8D9]" />
                      </div>
                      <span className="text-sm text-[#6B7280]">
                        Resultado instantâneo
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full nuvary-gradient border-0 font-semibold"
                    disabled={questions.length === 0}
                  >
                    {questions.length === 0 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      'Começar Questionário'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Questions Screen */}
          {screen === 'questions' && currentQuestion && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Progress Bar */}
              <Card className="border border-[#E5E7EB] shadow-md">
                <CardContent className="p-4">
                  <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full nuvary-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-[#6B7280]">
                    <span>
                      {currentQuestion.category === 'objetivos' && 'Objetivos'}
                      {currentQuestion.category === 'horizonte' && 'Horizonte'}
                      {currentQuestion.category === 'tolerancia_risco' &&
                        'Tolerância a Risco'}
                    </span>
                    <span>
                      {currentIndex + 1} de {questions.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Question Card */}
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                selectedAnswer={currentAnswer}
                onAnswerSelect={handleAnswerSelect}
              />

              {/* Navigation */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex-1 border-[#E5E7EB] text-[#6B7280] hover:text-[#0B1F33] hover:border-[#0B1F33]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="flex-1 nuvary-gradient border-0 font-semibold"
                >
                  {isLastQuestion ? 'Ver Resultado' : 'Próxima'}
                  {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading Screen */}
          {screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border border-[#E5E7EB] shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 nuvary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-[#0B1F33]">Analisando suas respostas...</p>
                  <p className="text-[#6B7280] mt-2">
                    Calculando seu perfil de investidor
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result Screen */}
          {screen === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultCard result={result} onRestart={handleRestart} onGoToChat={handleGoToChat} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
