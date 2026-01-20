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
import { recuperarSenha } from '@/services/authService';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

// Schema para solicitar recuperacao
const requestSchema = z.object({
  email: z.string().email('Email inválido'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: RequestFormData) => {
    setServerError(null);

    try {
      await recuperarSenha(data.email);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message || 'Erro ao solicitar recuperação');
      } else {
        setServerError('Erro ao solicitar recuperação');
      }
    }
  };

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
              Email enviado!
            </h2>
            <p className="text-[#6B7280] mb-6">
              Se o email existir em nossa base, você receberá as instruções para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white">
                Voltar para login
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
            Recuperar senha
          </h1>
          <p className="text-[#6B7280] text-sm">
            Digite seu email para receber instruções
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

            <Button
              type="submit"
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
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
