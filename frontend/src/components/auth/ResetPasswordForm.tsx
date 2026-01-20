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
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minuscula')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um numero'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'Senhas nao conferem',
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
      // Redireciona para login apos 3 segundos
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-[#0B1F33] mb-2">
              Link expirado
            </h2>
            <p className="text-[#6B7280] mb-6">
              Este link de recuperacao expirou ou e invalido. Solicite um novo link.
            </p>
            <Link href="/recuperar-senha">
              <Button className="nuvary-gradient text-white">
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
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
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"
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
                placeholder="Minimo 8 caracteres"
                error={errors.novaSenha?.message}
                {...register('novaSenha')}
              />
              {errors.novaSenha && (
                <p className="text-red-500 text-xs">{errors.novaSenha.message}</p>
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
                <p className="text-red-500 text-xs">{errors.confirmarSenha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full nuvary-gradient text-white"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
