'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import { redefinirSenha } from '@/services/authService';
import supabase from '@/lib/supabase';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

// Schema para redefinir senha
const resetSchema = z
  .object({
    novaSenha: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'Senhas não conferem',
    path: ['confirmarSenha'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { novaSenha: '', confirmarSenha: '' },
  });

  // Verifica se existe uma sessao valida do link de recuperacao
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setServerError(null);

    try {
      await redefinirSenha(data.novaSenha);
      setIsSuccess(true);
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message || 'Erro ao redefinir senha');
      } else {
        setServerError('Erro ao redefinir senha');
      }
    }
  };

  // Loading enquanto verifica sessao
  if (isValidSession === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  // Sessao invalida
  if (!isValidSession) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-[#E5E7EB] shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B1F33] mb-2">
              Link expirado
            </h2>
            <p className="text-[#6B7280] mb-6">
              Este link de recuperação expirou ou é inválido. Solicite um novo link.
            </p>
            <Link href="/recuperar-senha">
              <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white">
                Solicitar novo link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Tela de sucesso
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-[#E5E7EB] shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B1F33] mb-2">
              Senha redefinida!
            </h2>
            <p className="text-[#6B7280] mb-6">
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
          <h1 className="text-2xl font-bold text-[#0B1F33]">
            Nova senha
          </h1>
          <p className="text-[#6B7280] text-sm">
            Digite sua nova senha
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Erro do servidor */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-[#EF4444] text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="novaSenha" className="text-[#0B1F33]">
                Nova senha
              </Label>
              <PasswordInput
                id="novaSenha"
                placeholder="Mínimo 8 caracteres"
                error={errors.novaSenha?.message}
                {...register('novaSenha')}
              />
              {errors.novaSenha && (
                <p className="text-[#EF4444] text-xs">{errors.novaSenha.message}</p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmarSenha" className="text-[#0B1F33]">
                Confirmar nova senha
              </Label>
              <PasswordInput
                id="confirmarSenha"
                placeholder="Digite a senha novamente"
                error={errors.confirmarSenha?.message}
                {...register('confirmarSenha')}
              />
              {errors.confirmarSenha && (
                <p className="text-[#EF4444] text-xs">{errors.confirmarSenha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <p className="text-center text-sm text-[#6B7280] mt-4">
            Lembrou a senha?{' '}
            <Link href="/login" className="text-[#0066CC] hover:underline font-medium">
              Voltar para login
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
