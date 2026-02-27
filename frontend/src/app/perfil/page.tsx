'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { atualizarNome, atualizarSenha, uploadAvatar } from '@/services/authService';
import { buscarPerfilInvestidor, deletarPerfilInvestidor } from '@/services/perfilService';
import Image from 'next/image';
import {
  User,
  Mail,
  Lock,
  TrendingUp,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Target,
  Clock,
  PiggyBank,
  Camera,
} from 'lucide-react';

interface PerfilInvestidorData {
  perfil_risco?: string;
  objetivo_principal?: string;
  horizonte_investimento?: string;
  nivel_conhecimento?: number;
  renda_mensal?: string;
  valor_investir?: string;
  created_at?: string;
  updated_at?: string;
}

const perfilColors: Record<string, { bg: string; text: string; border: string }> = {
  conservador: { bg: 'bg-blue-500/10',  text: 'text-blue-500',  border: 'border-blue-500/20'  },
  moderado:    { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  arrojado:    { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  agressivo:   { bg: 'bg-red-500/10',   text: 'text-red-500',   border: 'border-red-500/20'   },
};

const perfilDescricoes: Record<string, string> = {
  conservador: 'Você prioriza a segurança do seu patrimônio e prefere investimentos de baixo risco.',
  moderado:    'Você busca equilíbrio entre segurança e rentabilidade, aceitando riscos moderados.',
  arrojado:    'Você está disposto a assumir riscos maiores em busca de retornos mais elevados.',
  agressivo:   'Você busca maximizar retornos e tem alta tolerância à volatilidade.',
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');

  // Nome
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [erroNome, setErroNome] = useState('');
  const [sucessoNome, setSucessoNome] = useState(false);

  // Senha
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState(false);

  // Perfil de investidor
  const [perfilInvestidor, setPerfilInvestidor] = useState<PerfilInvestidorData | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [deletandoPerfil, setDeletandoPerfil] = useState(false);

  useEffect(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }, [profile]);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const perfil = await buscarPerfilInvestidor();
        setPerfilInvestidor(perfil);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setCarregandoPerfil(false);
      }
    }
    if (isAuthenticated) carregarPerfil();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErroFoto('A imagem deve ter no máximo 5 MB'); return; }
    if (!file.type.startsWith('image/')) { setErroFoto('Selecione uma imagem válida (JPG, PNG, WEBP)'); return; }

    setErroFoto('');
    setUploadandoFoto(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setErroFoto('Erro ao fazer upload. Verifique se o bucket "avatars" existe no Supabase.');
      console.error(err);
    } finally {
      setUploadandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Nome ────────────────────────────────────────────────────────────────────
  const handleEditarNome = () => {
    setNovoNome(profile?.nome || '');
    setEditandoNome(true);
    setErroNome('');
    setSucessoNome(false);
  };

  const handleSalvarNome = async () => {
    if (novoNome.trim().length < 3) { setErroNome('Nome deve ter no mínimo 3 caracteres'); return; }
    setSalvandoNome(true);
    setErroNome('');
    try {
      await atualizarNome(novoNome.trim());
      setSucessoNome(true);
      setEditandoNome(false);
      if (refreshProfile) await refreshProfile();
      setTimeout(() => setSucessoNome(false), 3000);
    } catch (error) {
      setErroNome(error instanceof Error ? error.message : 'Erro ao atualizar nome');
    } finally {
      setSalvandoNome(false);
    }
  };

  // ── Senha ───────────────────────────────────────────────────────────────────
  const handleSalvarSenha = async () => {
    setErroSenha('');
    if (novaSenha.length < 8)        { setErroSenha('A nova senha deve ter no mínimo 8 caracteres'); return; }
    if (!/[A-Z]/.test(novaSenha))    { setErroSenha('A nova senha deve ter ao menos uma letra maiúscula'); return; }
    if (!/[a-z]/.test(novaSenha))    { setErroSenha('A nova senha deve ter ao menos uma letra minúscula'); return; }
    if (!/[0-9]/.test(novaSenha))    { setErroSenha('A nova senha deve ter ao menos um número'); return; }
    if (novaSenha !== confirmarSenha) { setErroSenha('As senhas não coincidem'); return; }

    setSalvandoSenha(true);
    try {
      await atualizarSenha(senhaAtual, novaSenha);
      setSucessoSenha(true);
      setEditandoSenha(false);
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      setTimeout(() => setSucessoSenha(false), 3000);
    } catch (error) {
      setErroSenha(error instanceof Error ? error.message : 'Erro ao atualizar senha');
    } finally {
      setSalvandoSenha(false);
    }
  };

  // ── Refazer questionário ─────────────────────────────────────────────────────
  const handleRefazerQuestionario = async () => {
    setDeletandoPerfil(true);
    try {
      await deletarPerfilInvestidor();
      setPerfilInvestidor(null);
      setMostrarConfirmacao(false);
      router.push('/questionario');
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
    } finally {
      setDeletandoPerfil(false);
    }
  };

  if (authLoading) return null;

  const perfilStyle = perfilInvestidor?.perfil_risco
    ? perfilColors[perfilInvestidor.perfil_risco.toLowerCase()] || perfilColors.moderado
    : perfilColors.moderado;

  const iniciais = (profile?.nome || user?.email || 'U')
    .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  const inputClass = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Cabeçalho com botão fechar ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus dados pessoais e perfil de investidor</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Voltar ao Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* ── Foto de Perfil ─────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-6"
        >
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Foto de perfil" width={80} height={80} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">{iniciais}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadandoFoto}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#00B8D9] hover:bg-[#007EA7] rounded-full flex items-center justify-center text-white shadow-md transition-colors"
              title="Alterar foto"
            >
              {uploadandoFoto ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">{profile?.nome || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadandoFoto}
              className="mt-1.5 text-sm text-[#00B8D9] hover:text-[#007EA7] transition-colors"
            >
              {uploadandoFoto ? 'Enviando...' : 'Alterar foto de perfil'}
            </button>
            {erroFoto && <p className="text-xs text-red-500 mt-1">{erroFoto}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou WEBP · máx. 5 MB</p>
          </div>
        </motion.section>

        {/* ── Dados Pessoais ─────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Dados Pessoais</h2>
          </div>

          {/* Nome */}
          <div className="border-b border-border pb-4 mb-4">
            <label className="text-xs text-muted-foreground block mb-1.5">Nome</label>
            {editandoNome ? (
              <div className="flex items-center gap-2">
                <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className={inputClass} placeholder="Seu nome" />
                <Button size="sm" onClick={handleSalvarNome} disabled={salvandoNome} className="bg-[#00B8D9] hover:bg-[#007EA7] flex-shrink-0">
                  {salvandoNome ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditandoNome(false)} className="flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{profile?.nome}</span>
                <Button size="sm" variant="ghost" onClick={handleEditarNome} className="text-[#00B8D9] hover:text-[#007EA7]">Editar</Button>
              </div>
            )}
            {erroNome    && <p className="text-sm text-red-500 mt-1">{erroNome}</p>}
            {sucessoNome && <p className="text-sm text-green-500 mt-1">Nome atualizado com sucesso!</p>}
          </div>

          {/* Email */}
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs text-muted-foreground">Email</label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">{user?.email}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Não editável</span>
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs text-muted-foreground">Senha</label>
            </div>

            {editandoSenha ? (
              <div className="space-y-3 mt-2">
                <div className="relative">
                  <input type={mostrarSenhaAtual ? 'text' : 'password'} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className={`${inputClass} pr-10`} placeholder="Senha atual" />
                  <button type="button" onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={mostrarNovaSenha ? 'text' : 'password'} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className={`${inputClass} pr-10`} placeholder="Nova senha" />
                  <button type="button" onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} placeholder="Confirmar nova senha" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside">
                    <li className={novaSenha.length >= 8   ? 'text-green-500' : ''}>Mínimo 8 caracteres</li>
                    <li className={/[A-Z]/.test(novaSenha) ? 'text-green-500' : ''}>Uma letra maiúscula</li>
                    <li className={/[a-z]/.test(novaSenha) ? 'text-green-500' : ''}>Uma letra minúscula</li>
                    <li className={/[0-9]/.test(novaSenha) ? 'text-green-500' : ''}>Um número</li>
                  </ul>
                </div>
                {erroSenha && <p className="text-sm text-red-500">{erroSenha}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleSalvarSenha} disabled={salvandoSenha} className="bg-[#00B8D9] hover:bg-[#007EA7]">
                    {salvandoSenha ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Salvar nova senha'}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditandoSenha(false); setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha(''); setErroSenha(''); }}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-foreground">••••••••</span>
                <Button size="sm" variant="outline" onClick={() => setEditandoSenha(true)} className="border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9] hover:text-white">
                  <Lock className="w-3 h-3 mr-1.5" />Alterar senha
                </Button>
              </div>
            )}
            {sucessoSenha && <p className="text-sm text-green-500 mt-1">Senha atualizada com sucesso!</p>}
          </div>
        </motion.section>

        {/* ── Perfil de Investidor ───────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Perfil de Investidor</h2>
          </div>

          {carregandoPerfil ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ) : perfilInvestidor ? (
            <>
              <div className={`${perfilStyle.bg} ${perfilStyle.border} border rounded-xl p-5 mb-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full ${perfilStyle.bg} ${perfilStyle.border} border-2 flex items-center justify-center`}>
                    <Shield className={`w-5 h-5 ${perfilStyle.text}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${perfilStyle.text} capitalize`}>{perfilInvestidor.perfil_risco}</h3>
                    <p className="text-xs text-muted-foreground">Seu perfil de investidor</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {perfilInvestidor.perfil_risco ? perfilDescricoes[perfilInvestidor.perfil_risco.toLowerCase()] || '' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {perfilInvestidor.objetivo_principal && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                    <Target className="w-4 h-4 text-[#00B8D9] mt-0.5 flex-shrink-0" />
                    <div><p className="text-xs text-muted-foreground">Objetivo</p><p className="text-sm text-foreground font-medium">{perfilInvestidor.objetivo_principal}</p></div>
                  </div>
                )}
                {perfilInvestidor.horizonte_investimento && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                    <Clock className="w-4 h-4 text-[#00B8D9] mt-0.5 flex-shrink-0" />
                    <div><p className="text-xs text-muted-foreground">Horizonte</p><p className="text-sm text-foreground font-medium">{perfilInvestidor.horizonte_investimento}</p></div>
                  </div>
                )}
                {perfilInvestidor.renda_mensal && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                    <PiggyBank className="w-4 h-4 text-[#00B8D9] mt-0.5 flex-shrink-0" />
                    <div><p className="text-xs text-muted-foreground">Renda Mensal</p><p className="text-sm text-foreground font-medium">{perfilInvestidor.renda_mensal}</p></div>
                  </div>
                )}
                {perfilInvestidor.nivel_conhecimento !== undefined && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                    <TrendingUp className="w-4 h-4 text-[#00B8D9] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nível de Conhecimento</p>
                      <p className="text-sm text-foreground font-medium">
                        {perfilInvestidor.nivel_conhecimento <= 2 && 'Iniciante'}
                        {perfilInvestidor.nivel_conhecimento === 3 && 'Intermediário'}
                        {perfilInvestidor.nivel_conhecimento >= 4 && 'Avançado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {perfilInvestidor.updated_at && (
                <p className="text-xs text-muted-foreground mb-4">
                  Última atualização: {new Date(perfilInvestidor.updated_at).toLocaleDateString('pt-BR')}
                </p>
              )}

              {!mostrarConfirmacao ? (
                <Button variant="outline" onClick={() => setMostrarConfirmacao(true)} className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                  <RefreshCw className="w-4 h-4 mr-2" />Refazer Questionário
                </Button>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-500 mb-1">Confirmar ação</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ao refazer o questionário, seu perfil atual será substituído. Deseja continuar?
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleRefazerQuestionario} disabled={deletandoPerfil} className="bg-amber-500 hover:bg-amber-600">
                          {deletandoPerfil ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Processando...</> : 'Sim, refazer'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setMostrarConfirmacao(false)}>Cancelar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">Nenhum perfil encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">Responda ao questionário para descobrir seu perfil de investidor.</p>
              <Button onClick={() => router.push('/questionario')} className="bg-[#00B8D9] hover:bg-[#007EA7]">Fazer Questionário</Button>
            </div>
          )}
        </motion.section>

      </div>
    </DashboardLayout>
  );
}
