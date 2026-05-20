'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Loader2,
  PieChart,
  RefreshCw,
  Target,
  Wallet,
} from 'lucide-react';

import { salvarPerfilInvestidor, verificarSeTemPerfil } from '@/services/perfilService';
import { useAuth } from '@/contexts/AuthContext';
import { STRINGS } from '@/constants/strings';
import {
  Question,
  QuestionnaireResult,
  Answers,
} from '@/types/questionnaire';
import { PROFILES, normalizePerfilTipo, type PerfilTipo } from '@/lib/perfis';

import styles from './Questionnaire.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Screen = 'intro' | 'questions' | 'loading' | 'result';

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const KPI_ICONS = [Target, Clock, BarChart3];

export function Questionnaire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [screen, setScreen] = useState<Screen>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const fetchQuestionnaire = useCallback(async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`${API_URL}/profile/questionnaire`);
      const data = await response.json();
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
      } else {
        setError(STRINGS.errors.erroCarregarQuestionario);
      }
    } catch (err) {
      setError(STRINGS.errors.servidorOffline);
      console.error('Erro ao carregar questionário:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    const refazer = searchParams.get('refazer') === '1';
    if (refazer) {
      fetchQuestionnaire();
      return;
    }
    verificarSeTemPerfil().then((temPerfil) => {
      if (temPerfil) {
        router.replace('/dashboard');
      } else {
        fetchQuestionnaire();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleStart = () => {
    if (totalQuestions > 0) {
      setError(null);
      setScreen('questions');
    }
  };

  const handleAnswerSelect = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const submitAnswers = useCallback(async () => {
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
        try {
          const tipoPerfil = data.profile?.type || data.profile;
          await salvarPerfilInvestidor({
            perfilRisco: tipoPerfil,
            idade: answers[1],
            objetivo_principal: answers[2],
            renda_mensal: answers[3],
            nivel_conhecimento: answers[4]
              ? Number(answers[4] === 'A' ? 1 : answers[4] === 'B' ? 2 : answers[4] === 'C' ? 3 : 4)
              : undefined,
            horizonte_investimento: answers[5],
            respostas_completas: { ...answers, perfilRisco: tipoPerfil },
          });
        } catch (saveError) {
          console.error('Erro ao salvar perfil no Supabase:', saveError);
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
  }, [answers, user]);

  const handleNext = useCallback(() => {
    if (totalQuestions === 0) return;
    const answeredCount = Object.keys(answers).length;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (answeredCount === totalQuestions) {
      void submitAnswers();
    }
  }, [answers, currentIndex, totalQuestions, submitAnswers]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleBack = () => {
    if (screen === 'questions') {
      if (currentIndex === 0) setScreen('intro');
      else handlePrev();
    } else if (screen === 'result') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setScreen('intro');
  };

  // Keyboard shortcuts: A/B/C/D + arrows + Enter (only while answering)
  useEffect(() => {
    if (screen !== 'questions' || !currentQuestion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const key = e.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(key)) {
        const idx = key.charCodeAt(0) - 97;
        if (idx < currentQuestion.options.length) {
          handleAnswerSelect(currentQuestion.options[idx].value);
          e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handlePrev();
          e.preventDefault();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentAnswer) {
          handleNext();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentQuestion, currentAnswer, currentIndex, handleAnswerSelect, handleNext, handlePrev]);

  // Scroll to top on screen / question change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [screen, currentIndex]);

  return (
    <div className={styles.shell}>
      {/* TOPBAR */}
      <header className={styles.topbar}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft />
          Voltar
        </button>
        <div className={styles.topbarBrand}>
          <div className={styles.brandMark}>
            <Image
              src="/brand/nuvary-icon.png"
              alt="Nuvary Invest"
              width={36}
              height={36}
            />
          </div>
          <div>
            <div className={styles.brandName}>Nuvary</div>
            <div className={styles.brandSub}>INVEST</div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {screen === 'intro' && (
          <IntroState
            isLoading={isLoadingQuestions}
            disabled={isLoadingQuestions || totalQuestions === 0}
            onStart={handleStart}
          />
        )}

        {screen === 'questions' && currentQuestion && (
          <QuestionState
            question={currentQuestion}
            index={currentIndex}
            total={totalQuestions}
            selected={currentAnswer}
            isLast={isLastQuestion}
            onSelect={handleAnswerSelect}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

        {screen === 'loading' && <LoadingState />}

        {screen === 'result' && result && (
          <ResultState
            result={result}
            onWallet={() => router.push('/carteira')}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================
// INTRO
// ============================================================
function IntroState({
  isLoading,
  disabled,
  onStart,
}: {
  isLoading: boolean;
  disabled: boolean;
  onStart: () => void;
}) {
  return (
    <section className={styles.state}>
      <div className={styles.introCard}>
        <div className={styles.introIcon}>
          <BarChart3 />
        </div>
        <h1 className={styles.introTitle}>Questionário de Perfil de Investidor</h1>
        <p className={styles.introDesc}>
          Responda 11 perguntas rápidas e descubra qual é o seu perfil. O resultado vai te
          ajudar a tomar melhores decisões de investimento.
        </p>

        <div className={styles.introKpis}>
          <KpiCard icon={KPI_ICONS[0]} value="11" label="Perguntas objetivas" />
          <KpiCard icon={KPI_ICONS[1]} value="2 min" label="Tempo médio" />
          <KpiCard icon={KPI_ICONS[2]} value="Instantâneo" label="Resultado na hora" />
        </div>

        <button
          type="button"
          className={styles.introCta}
          onClick={onStart}
          disabled={disabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Carregando perguntas...
            </>
          ) : (
            <>
              Começar Questionário
              <ArrowRight />
            </>
          )}
        </button>

        <div className={styles.introNote}>
          <span className={styles.introNoteItem}>
            <CheckCircle2 />
            Sem armazenar dados sensíveis
          </span>
          <span className={styles.introNoteItem}>
            <CheckCircle2 />
            Refaça quando quiser
          </span>
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Target;
  value: string;
  label: string;
}) {
  return (
    <div className={styles.introKpi}>
      <div className={styles.introKpiIc}>
        <Icon />
      </div>
      <div className={styles.introKpiVal}>{value}</div>
      <div className={styles.introKpiLbl}>{label}</div>
    </div>
  );
}

// ============================================================
// QUESTION
// ============================================================
function QuestionState({
  question,
  index,
  total,
  selected,
  isLast,
  onSelect,
  onPrev,
  onNext,
}: {
  question: Question;
  index: number;
  total: number;
  selected: string | undefined;
  isLast: boolean;
  onSelect: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className={styles.state} key={question.id}>
      <div className={styles.qCard}>
        <div className={styles.qTag}>
          Pergunta {index + 1} de {total}
        </div>
        <h2 className={styles.qTitle}>{question.question}</h2>
        <div className={styles.options}>
          {question.options.map((opt, i) => {
            const letter = LETTERS[i] ?? String.fromCharCode(65 + i);
            const isSelected = selected === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => onSelect(opt.value)}
              >
                <div className={styles.optLetter}>{letter}</div>
                <div className={styles.optText}>{opt.text}</div>
                <div className={styles.optKbd}>{letter}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.qNav}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={onPrev}
          disabled={index === 0}
        >
          <ChevronLeft />
          Anterior
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navNext} ${selected ? styles.navNextReady : ''}`}
          onClick={onNext}
          disabled={!selected}
        >
          {isLast ? 'Ver resultado' : 'Próxima'}
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}

// ============================================================
// LOADING
// ============================================================
function LoadingState() {
  return (
    <section className={styles.state}>
      <div className={styles.loadingCard}>
        <div className={styles.loadingSpinner}>
          <Loader2 />
        </div>
        <div className={styles.loadingTitle}>Analisando suas respostas...</div>
        <div className={styles.loadingDesc}>Calculando seu perfil de investidor</div>
      </div>
    </section>
  );
}

// ============================================================
// RESULT
// ============================================================
function ResultState({
  result,
  onWallet,
  onRestart,
}: {
  result: QuestionnaireResult;
  onWallet: () => void;
  onRestart: () => void;
}) {
  const tipoBackend =
    typeof result.profile === 'string' ? result.profile : result.profile?.type;
  const tipo: PerfilTipo = normalizePerfilTipo(tipoBackend);
  const profile = PROFILES[tipo];
  const HeroIcon = profile.icon;

  return (
    <section className={styles.state}>
      <div className={styles.resultHero} data-perfil={tipo}>
        <div className={styles.resultHeroInner}>
          <div className={styles.resultIcon}>
            <HeroIcon />
          </div>
          <div className={styles.resultLabel}>Seu perfil é</div>
          <h1 className={styles.resultName}>{profile.name}</h1>
          <p className={styles.resultDesc}>{profile.description}</p>
        </div>
      </div>

      <AllocationCard profile={profile} />

      <div className={styles.profileTips}>
        <h3>
          <HelpCircle />
          O que esperar do perfil{' '}
          <span className={styles.tipsName} style={{ color: profile.color }}>
            {profile.name}
          </span>
        </h3>
        <div className={styles.tipsGrid}>
          {profile.tips.map((tip) => {
            const TipIcon = tip.icon;
            return (
              <div key={tip.title} className={styles.tip}>
                <div className={styles.tipIc}>
                  <TipIcon />
                </div>
                <strong className={styles.tipTitle}>{tip.title}</strong>
                <span className={styles.tipDesc}>{tip.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.resultActions}>
        <button type="button" className={`${styles.resultCta} ${styles.resultCtaPrimary}`} onClick={onWallet}>
          <Wallet />
          Ir para Minha Carteira
        </button>
        <button
          type="button"
          className={`${styles.resultCta} ${styles.resultCtaSecondary}`}
          onClick={onRestart}
        >
          <RefreshCw />
          Refazer Questionário
        </button>
      </div>
    </section>
  );
}

// ============================================================
// ALLOCATION (donut + stacked bar + legend)
// ============================================================
function AllocationCard({ profile }: { profile: (typeof PROFILES)[PerfilTipo] }) {
  const RADIUS = 42;
  const C = 2 * Math.PI * RADIUS;

  // Recompute cumulative offsets for the donut once per profile change.
  const segments = useMemo(() => {
    let cumulative = 0;
    return profile.allocation.map((item) => {
      const dashLen = (item.value / 100) * C;
      const offset = -((cumulative / 100) * C);
      cumulative += item.value;
      return { item, dashLen, offset };
    });
  }, [profile, C]);

  // Stagger donut animation: start at 0 then fill on mount.
  const [animated, setAnimated] = useState(false);
  const lastProfileRef = useRef<string>('');
  useEffect(() => {
    if (lastProfileRef.current !== profile.type) {
      setAnimated(false);
      lastProfileRef.current = profile.type;
      const t = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(t);
    }
    setAnimated(true);
  }, [profile.type]);

  return (
    <div className={styles.allocationCard}>
      <div className={styles.allocationHead}>
        <h2>
          <PieChart />
          Alocação Recomendada
        </h2>
        <span className={styles.allocationBadge}>Sugerida pela IA</span>
      </div>

      <div className={styles.allocationGrid}>
        <div className={styles.allocationDonut}>
          <svg viewBox="0 0 100 100">
            <circle className={styles.donutTrack} cx="50" cy="50" r={RADIUS} />
            {segments.map(({ item, dashLen, offset }) => (
              <circle
                key={item.name}
                className={styles.donutSeg}
                cx="50"
                cy="50"
                r={RADIUS}
                stroke={item.color}
                strokeDasharray={animated ? `${dashLen} ${C}` : `0 ${C}`}
                strokeDashoffset={offset}
              />
            ))}
          </svg>
          <div className={styles.donutCenter}>
            <div>
              <div className={styles.donutLbl}>Risco</div>
              <div className={styles.donutVal} style={{ color: profile.color }}>
                {profile.risk}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.allocationBar}>
            {profile.allocation.map((item) => (
              <div
                key={item.name}
                className={styles.barSeg}
                style={{ width: `${item.value}%`, background: item.color }}
                title={`${item.name}: ${item.value}%`}
              >
                {item.value >= 10 ? `${item.value}%` : ''}
              </div>
            ))}
          </div>
          <div className={styles.allocationLegend}>
            {profile.allocation.map((item) => {
              const LegendIcon = item.icon;
              return (
                <div key={item.name} className={styles.legendRow}>
                  <div className={styles.legendIc} style={{ color: item.color }}>
                    <LegendIcon />
                  </div>
                  <div className={styles.legendName}>{item.name}</div>
                  <div className={styles.legendVal}>{item.value}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

