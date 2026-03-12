import { ForgotPasswordForm } from '@/components/auth';

export const metadata = {
  title: 'Recuperar Senha | Nuvary Invest',
  description: 'Recupere sua senha da Nuvary Invest',
};

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
