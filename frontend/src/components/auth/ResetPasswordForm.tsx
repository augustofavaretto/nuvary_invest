'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './PasswordInput';
import supabase from '@/lib/supabase';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function ResetPasswordForm() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha.length < 8) {
      setErro('Senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        setErro(error.message);
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      supabase.auth.signOut().catch(() => {});
      window.location.href = 'https://nuvary-invest.vercel.app/login';

    } catch {
      setErro('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-border shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Senha redefinida com sucesso!
            </h2>
            <p className="text-muted-foreground">
              Redirecionando para o login...
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
      <Card className="border-border shadow-lg">
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
          <h1 className="text-2xl font-bold text-foreground">
            Nova senha
          </h1>
          <p className="text-muted-foreground text-sm">
            Digite sua nova senha
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          {erro && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-[#EF4444] text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="novaSenha" className="text-foreground">
                Nova senha
              </Label>
              <PasswordInput
                id="novaSenha"
                placeholder="Mínimo 8 caracteres"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmarSenha" className="text-foreground">
                Confirmar nova senha
              </Label>
              <PasswordInput
                id="confirmarSenha"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
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
