import { Suspense } from 'react';
import { LoginForm } from '@/components/auth';

export const metadata = {
  title: 'Login | Nuvary Invest',
  description: 'Acesse sua conta na Nuvary Invest',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
