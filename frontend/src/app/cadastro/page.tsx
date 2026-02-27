import { RegisterForm } from '@/components/auth';

export const metadata = {
  title: 'Criar Conta | Nuvary Invest',
  description: 'Crie sua conta na Nuvary Invest e comece sua jornada de investimentos',
};

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </div>
  );
}
