import { Suspense } from 'react';
import { Questionnaire } from '@/components/questionnaire';

export const metadata = {
  title: 'Questionário de Perfil | Nuvary Invest',
  description: 'Descubra seu perfil de investidor respondendo 11 perguntas rápidas',
};

export default function QuestionarioPage() {
  return (
    <Suspense>
      <Questionnaire />
    </Suspense>
  );
}
