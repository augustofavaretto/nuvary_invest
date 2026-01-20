'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Question } from '@/types/questionnaire';
import { Target, Clock, TrendingUp } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (value: string) => void;
}

// Cores conforme manual da marca Nuvary Invest
const categoryConfig = {
  objetivos: {
    label: 'Objetivos',
    icon: Target,
    bgColor: 'bg-[#00B8D9]/10',
    textColor: 'text-[#00B8D9]',
    borderColor: 'border-[#00B8D9]/30',
  },
  horizonte: {
    label: 'Horizonte',
    icon: Clock,
    bgColor: 'bg-[#007EA7]/10',
    textColor: 'text-[#007EA7]',
    borderColor: 'border-[#007EA7]/30',
  },
  tolerancia_risco: {
    label: 'Tolerancia a Risco',
    icon: TrendingUp,
    bgColor: 'bg-[#F59E0B]/10',
    textColor: 'text-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/30',
  },
};

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}: QuestionCardProps) {
  const category = categoryConfig[question.category];
  const CategoryIcon = category.icon;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-[#E5E7EB] shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className={`${category.bgColor} ${category.textColor} ${category.borderColor} font-medium`}
            >
              <CategoryIcon className="w-3.5 h-3.5 mr-1.5" />
              {category.label}
            </Badge>
            <span className="text-sm text-[#6B7280]">
              Pergunta {currentIndex + 1} de {totalQuestions}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-[#0B1F33] mb-8 leading-relaxed">
            {question.question}
          </h2>

          <RadioGroup
            value={selectedAnswer}
            onValueChange={onAnswerSelect}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Label
                  htmlFor={`option-${option.value}`}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${
                      selectedAnswer === option.value
                        ? 'border-[#00B8D9] bg-[#00B8D9]/5 shadow-md'
                        : 'border-[#E5E7EB] hover:border-[#00B8D9]/50 hover:bg-[#F3F4F6]'
                    }
                  `}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`option-${option.value}`}
                    className="shrink-0 border-[#00B8D9] text-[#00B8D9]"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        text-sm font-bold shrink-0 transition-colors
                        ${
                          selectedAnswer === option.value
                            ? 'nuvary-gradient text-white'
                            : 'bg-[#F3F4F6] text-[#6B7280]'
                        }
                      `}
                    >
                      {option.value}
                    </span>
                    <span className="text-base text-[#0B1F33]">{option.text}</span>
                  </div>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
