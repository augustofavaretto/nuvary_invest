'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Key,
} from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Schema para solicitar recuperação
const requestSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Schema para redefinir senha
const resetSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
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

type RequestFormData = z.infer<typeof requestSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export function ForgotPasswordForm() {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Form para solicitar recuperação
  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  });

  // Form para redefinir senha
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', novaSenha: '', confirmarSenha: '' },
  });

  const onRequestSubmit = async (data: RequestFormData) => {
    setServerError(null);
    setServerMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setServerMessage(result.message);
        setStep('reset');
      } else {
        setServerError(result.error || 'Erro ao solicitar recuperação');
      }
    } catch (error) {
      setServerError('Erro de conexão. Tente novamente.');
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setServerError(null);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setStep('success');
      } else {
        if (result.errors) {
          result.errors.forEach((err: { field: string; message: string }) => {
            if (err.field === 'token' || err.field === 'novaSenha' || err.field === 'confirmarSenha') {
              resetForm.setError(err.field, { message: err.message });
            }
          });
        } else {
          setServerError(result.error || 'Erro ao redefinir senha');
        }
      }
    } catch (error) {
      setServerError('Erro de conexão. Tente novamente.');
    }
  };

  // Tela de sucesso
  if (step === 'success') {
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
              Sua senha foi alterada com sucesso.
            </p>
            <Link href="/login">
              <Button className="nuvary-gradient text-white">
                Fazer login
              </Button>
            </Link>
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
            {step === 'request' ? 'Recuperar senha' : 'Nova senha'}
          </h1>
          <p className="text-[#6B7280] text-sm">
            {step === 'request'
              ? 'Digite seu email para receber instruções'
              : 'Digite o código recebido e sua nova senha'}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Mensagem de sucesso */}
          {serverMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {serverMessage}
            </motion.div>
          )}

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

          {step === 'request' ? (
            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
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
                    className={`pl-10 ${requestForm.formState.errors.email ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                    {...requestForm.register('email')}
                  />
                </div>
                {requestForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">{requestForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full nuvary-gradient text-white"
                disabled={requestForm.formState.isSubmitting}
              >
                {requestForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              {/* Token */}
              <div className="space-y-1.5">
                <Label htmlFor="token" className="text-[#0B1F33]">
                  Código de recuperação
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <Input
                    id="token"
                    placeholder="Cole o código recebido"
                    className={`pl-10 ${resetForm.formState.errors.token ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                    {...resetForm.register('token')}
                  />
                </div>
                {resetForm.formState.errors.token && (
                  <p className="text-red-500 text-xs">{resetForm.formState.errors.token.message}</p>
                )}
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="novaSenha" className="text-[#0B1F33]">
                  Nova senha
                </Label>
                <PasswordInput
                  id="novaSenha"
                  placeholder="Mínimo 8 caracteres"
                  error={resetForm.formState.errors.novaSenha?.message}
                  {...resetForm.register('novaSenha')}
                />
                {resetForm.formState.errors.novaSenha && (
                  <p className="text-red-500 text-xs">{resetForm.formState.errors.novaSenha.message}</p>
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
                  error={resetForm.formState.errors.confirmarSenha?.message}
                  {...resetForm.register('confirmarSenha')}
                />
                {resetForm.formState.errors.confirmarSenha && (
                  <p className="text-red-500 text-xs">{resetForm.formState.errors.confirmarSenha.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full nuvary-gradient text-white"
                disabled={resetForm.formState.isSubmitting}
              >
                {resetForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-[#6B7280]"
                onClick={() => setStep('request')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </form>
          )}

          {/* Link para Login */}
          <p className="text-center text-sm text-[#6B7280] mt-4">
            Lembrou a senha?{' '}
            <Link href="/login" className="text-[#00B8D9] hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
