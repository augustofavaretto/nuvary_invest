'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import { cadastrar } from '@/services/authService';
import {
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

// Schema de validacao com Zod
const registerSchema = z
  .object({
    nome: z
      .string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome muito longo'),
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase(),
    senha: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmarSenha: z.string(),
    aceiteTermos: z
      .boolean()
      .refine((val) => val === true, 'Você deve aceitar os termos'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'Senhas não conferem',
    path: ['confirmarSenha'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      aceiteTermos: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      await cadastrar({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        aceiteTermos: data.aceiteTermos,
      });

      setIsSuccess(true);
      // Redireciona para questionario apos 2 segundos
      setTimeout(() => {
        router.push('/questionario');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          setServerError('Este email já está cadastrado');
        } else {
          setServerError(error.message || 'Erro ao criar conta');
        }
      } else {
        setServerError('Erro ao criar conta');
      }
    }
  };

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
              Conta criada com sucesso!
            </h2>
            <p className="text-[#6B7280]">
              Redirecionando para o questionário...
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
          <h1 className="text-2xl font-bold text-[#0B1F33]">Criar conta</h1>
          <p className="text-[#6B7280] text-sm">
            Preencha os dados para começar sua jornada
          </p>
        </CardHeader>

        <CardContent className="p-6">
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

            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-[#0B1F33]">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  className={`pl-10 ${errors.nome ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}`}
                  {...register('nome')}
                />
              </div>
              {errors.nome && (
                <p className="text-[#EF4444] text-xs">{errors.nome.message}</p>
              )}
            </div>

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
                  className={`pl-10 ${errors.email ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[#EF4444] text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-[#0B1F33]">
                Senha
              </Label>
              <PasswordInput
                id="senha"
                placeholder="Mínimo 8 caracteres"
                error={errors.senha?.message}
                {...register('senha')}
              />
              {errors.senha && (
                <p className="text-[#EF4444] text-xs">{errors.senha.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmarSenha" className="text-[#0B1F33]">
                Confirmar senha
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

            {/* Aceite dos Termos */}
            <div className="space-y-1.5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-[#E5E7EB] text-[#0066CC] focus:ring-[#0066CC]/20"
                  {...register('aceiteTermos')}
                />
                <span className="text-sm text-[#6B7280]">
                  Li e aceito os{' '}
                  <Link href="/termos" className="text-[#0066CC] hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="text-[#0066CC] hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.aceiteTermos && (
                <p className="text-[#EF4444] text-xs">{errors.aceiteTermos.message}</p>
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
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>

            {/* Link para Login */}
            <p className="text-center text-sm text-[#6B7280]">
              Já tem conta?{' '}
              <Link href="/login" className="text-[#0066CC] hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
