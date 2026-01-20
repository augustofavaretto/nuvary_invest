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
import { login } from '@/services/authService';
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Erro do servidor */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </motion.div>
            )}

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
