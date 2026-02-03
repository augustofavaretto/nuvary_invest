'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { login, loginWithGoogle } from '@/services/authService';
import { verificarSeTemPerfil } from '@/services/perfilService';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

// Schema de validacao
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleLogin = async () => {
    setServerError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message || 'Erro ao entrar com Google');
      } else {
        setServerError('Erro ao entrar com Google');
      }
      setIsGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  // Mostra mensagem de sucesso se veio do cadastro
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  // Redireciona se ja autenticado
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isAuthenticated) {
        const temPerfil = await verificarSeTemPerfil();
        router.push(temPerfil ? '/chat' : '/questionario');
      }
    };
    checkAndRedirect();
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      await login(data.email, data.senha);

      // Verifica se usuario tem perfil de investidor
      const temPerfil = await verificarSeTemPerfil();

      // Redireciona baseado no perfil
      if (temPerfil) {
        router.push('/chat');
      } else {
        router.push('/questionario');
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError('Email ou senha incorretos');
      } else {
        setServerError('Email ou senha incorretos');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-[#E5E7EB] shadow-lg">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo-icon.png"
              alt="Nuvary Invest"
              width={48}
              height={48}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-[#0B1F33]">Entrar</h1>
          <p className="text-[#6B7280] text-sm">
            Acesse sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Mensagem de sucesso do cadastro */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Conta criada com sucesso! Faça login para continuar.
            </motion.div>
          )}

          {/* Erro do servidor */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </motion.div>
          )}

          {/* Botao Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 border-[#E5E7EB] text-[#0B1F33] hover:bg-[#F9FAFB]"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>

          {/* Divisor */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#9CA3AF]">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#0B1F33]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-[#0B1F33]">
                  Senha
                </Label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-[#0066CC] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <PasswordInput
                id="senha"
                placeholder="Sua senha"
                error={errors.senha?.message}
                {...register('senha')}
              />
              {errors.senha && (
                <p className="text-red-500 text-xs">{errors.senha.message}</p>
              )}
            </div>

            {/* Botao Submit */}
            <Button
              type="submit"
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Link para Cadastro */}
            <p className="text-center text-sm text-[#6B7280]">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-[#0066CC] hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
