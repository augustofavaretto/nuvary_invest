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
import { cadastrar } from '@/services/authService';
import {
  User,
  Mail,
  AlertCircle,
  Loader2,
  MailCheck,
  ExternalLink,
  CreditCard,
  Calendar,
  Phone,
} from 'lucide-react';
import Image from 'next/image';

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
}

// Função para formatar CPF
function formatarCPF(valor: string): string {
  const cpfLimpo = valor.replace(/\D/g, '');
  if (cpfLimpo.length <= 3) return cpfLimpo;
  if (cpfLimpo.length <= 6) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
  if (cpfLimpo.length <= 9) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;
  return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`;
}

// Função para formatar data de nascimento
function formatarData(valor: string): string {
  const dataLimpa = valor.replace(/\D/g, '');
  if (dataLimpa.length <= 2) return dataLimpa;
  if (dataLimpa.length <= 4) return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2)}`;
  return `${dataLimpa.slice(0, 2)}/${dataLimpa.slice(2, 4)}/${dataLimpa.slice(4, 8)}`;
}

// Função para validar data de nascimento
function validarDataNascimento(data: string): boolean {
  const dataLimpa = data.replace(/\D/g, '');
  if (dataLimpa.length !== 8) return false;

  const dia = parseInt(dataLimpa.slice(0, 2));
  const mes = parseInt(dataLimpa.slice(2, 4));
  const ano = parseInt(dataLimpa.slice(4, 8));

  if (dia < 1 || dia > 31) return false;
  if (mes < 1 || mes > 12) return false;
  if (ano < 1900 || ano > new Date().getFullYear()) return false;

  const dataObj = new Date(ano, mes - 1, dia);
  if (dataObj > new Date()) return false;

  // Verifica se tem pelo menos 18 anos
  const hoje = new Date();
  const idade = hoje.getFullYear() - ano;
  if (idade < 18) return false;

  return true;
}

// Função para formatar telefone
function formatarTelefone(valor: string): string {
  const telLimpo = valor.replace(/\D/g, '');
  if (telLimpo.length <= 2) return telLimpo.length > 0 ? `(${telLimpo}` : '';
  if (telLimpo.length <= 7) return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2)}`;
  if (telLimpo.length <= 11) return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 7)}-${telLimpo.slice(7)}`;
  return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 7)}-${telLimpo.slice(7, 11)}`;
}

// Função para validar telefone
function validarTelefone(telefone: string): boolean {
  const telLimpo = telefone.replace(/\D/g, '');
  return telLimpo.length >= 10 && telLimpo.length <= 11;
}

// Schema de validação com Zod
const registerSchema = z
  .object({
    nome: z
      .string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome muito longo'),
    cpf: z
      .string()
      .min(14, 'CPF inválido')
      .refine((val) => validarCPF(val), 'CPF inválido'),
    dataNascimento: z
      .string()
      .min(10, 'Data inválida')
      .refine((val) => validarDataNascimento(val), 'Data inválida ou menor de 18 anos'),
    telefone: z
      .string()
      .min(14, 'Telefone inválido')
      .refine((val) => validarTelefone(val), 'Telefone inválido'),
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

// Função para obter o link do provedor de email
function getEmailProviderUrl(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();

  const providers: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'googlemail.com': 'https://mail.google.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'live.com': 'https://outlook.live.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'yahoo.com.br': 'https://mail.yahoo.com',
    'icloud.com': 'https://www.icloud.com/mail',
    'me.com': 'https://www.icloud.com/mail',
    'protonmail.com': 'https://mail.protonmail.com',
    'proton.me': 'https://mail.protonmail.com',
  };

  return providers[domain] || null;
}

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      aceiteTermos: false,
    },
  });

  // Máscara do CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCPF(e.target.value);
    setValue('cpf', formatted);
  };

  // Máscara da Data de Nascimento
  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarData(e.target.value);
    setValue('dataNascimento', formatted);
  };

  // Máscara do Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value);
    setValue('telefone', formatted);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      await cadastrar({
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ''),
        dataNascimento: data.dataNascimento,
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        senha: data.senha,
        aceiteTermos: data.aceiteTermos,
      });

      setRegisteredEmail(data.email);
      setIsSuccess(true);
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

  // Tela de sucesso - Confirmar email
  if (isSuccess) {
    const emailProviderUrl = getEmailProviderUrl(registeredEmail);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-border shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Ícone de email */}
            <div className="w-20 h-20 bg-[#0066CC]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-10 h-10 text-[#0066CC]" />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Verifique seu email
            </h2>

            {/* Mensagem */}
            <p className="text-muted-foreground mb-2">
              Enviamos um link de confirmação para:
            </p>
            <p className="text-foreground font-medium mb-6">
              {registeredEmail}
            </p>

            {/* Instruções */}
            <div className="bg-muted rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-foreground">Próximos passos:</strong>
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Abra sua caixa de entrada</li>
                <li>Procure o email da Nuvary Invest</li>
                <li>Clique no link de confirmação</li>
                <li>Volte aqui e faça login</li>
              </ol>
            </div>

            {/* Botão abrir email */}
            {emailProviderUrl && (
              <a
                href={emailProviderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full mb-4"
              >
                <Button className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Abrir meu email
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}

            {/* Link para login */}
            <Link href="/login">
              <Button variant="outline" className="w-full border-border text-muted-foreground">
                Já confirmei, fazer login
              </Button>
            </Link>

            {/* Aviso spam */}
            <p className="text-xs text-muted-foreground mt-4">
              Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
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
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground text-sm">
            Preencha os dados para começar sua jornada
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2">
          {/* Erro do servidor */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-foreground">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  className={`pl-10 ${errors.nome ? 'border-[#EF4444]' : 'border-border'}`}
                  {...register('nome')}
                />
              </div>
              {errors.nome && (
                <p className="text-[#EF4444] text-xs">{errors.nome.message}</p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-1.5">
              <Label htmlFor="cpf" className="text-foreground">
                CPF
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`pl-10 ${errors.cpf ? 'border-[#EF4444]' : 'border-border'}`}
                  {...register('cpf')}
                  onChange={handleCPFChange}
                />
              </div>
              {errors.cpf && (
                <p className="text-[#EF4444] text-xs">{errors.cpf.message}</p>
              )}
            </div>

            {/* Data de Nascimento e Telefone em linha */}
            <div className="grid grid-cols-2 gap-3">
              {/* Data de Nascimento */}
              <div className="space-y-1.5">
                <Label htmlFor="dataNascimento" className="text-foreground">
                  Data de nascimento
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dataNascimento"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className={`pl-10 ${errors.dataNascimento ? 'border-[#EF4444]' : 'border-border'}`}
                    {...register('dataNascimento')}
                    onChange={handleDataNascimentoChange}
                  />
                </div>
                {errors.dataNascimento && (
                  <p className="text-[#EF4444] text-xs">{errors.dataNascimento.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-foreground">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`pl-10 ${errors.telefone ? 'border-[#EF4444]' : 'border-border'}`}
                    {...register('telefone')}
                    onChange={handleTelefoneChange}
                  />
                </div>
                {errors.telefone && (
                  <p className="text-[#EF4444] text-xs">{errors.telefone.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`pl-10 ${errors.email ? 'border-[#EF4444]' : 'border-border'}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[#EF4444] text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-foreground">
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
              <Label htmlFor="confirmarSenha" className="text-foreground">
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
                  className="mt-1 w-4 h-4 rounded border-border text-[#0066CC] focus:ring-[#0066CC]/20"
                  {...register('aceiteTermos')}
                />
                <span className="text-sm text-muted-foreground">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noopener noreferrer" className="text-[#0066CC] hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#0066CC] hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.aceiteTermos && (
                <p className="text-[#EF4444] text-xs">{errors.aceiteTermos.message}</p>
              )}
            </div>

            {/* Botão Submit */}
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
            <p className="text-center text-sm text-muted-foreground">
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
