'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { atualizarNome, atualizarSenha } from '@/services/authService';
import { buscarPerfilInvestidor, deletarPerfilInvestidor } from '@/services/perfilService';
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
  conservador: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  moderado: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  arrojado: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  agressivo: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const perfilDescricoes: Record<string, string> = {
  conservador: 'Você prioriza a segurança do seu patrimônio e prefere investimentos de baixo risco.',
  moderado: 'Você busca equilíbrio entre segurança e rentabilidade, aceitando riscos moderados.',
  arrojado: 'Você está disposto a assumir riscos maiores em busca de retornos mais elevados.',
  agressivo: 'Você busca maximizar retornos e tem alta tolerância à volatilidade.',
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();

  // Estados para edição de nome
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [erroNome, setErroNome] = useState('');
  const [sucessoNome, setSucessoNome] = useState(false);

  // Estados para edição de senha
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState(false);
  const [mostrarAvisoSenha, setMostrarAvisoSenha] = useState(false);

  // Estados para perfil de investidor
  const [perfilInvestidor, setPerfilInvestidor] = useState<PerfilInvestidorData | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [deletandoPerfil, setDeletandoPerfil] = useState(false);

  // Carregar perfil de investidor
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

    if (isAuthenticated) {
      carregarPerfil();
    }
  }, [isAuthenticated]);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Handlers para nome
  const handleEditarNome = () => {
    setNovoNome(profile?.nome || '');
    setEditandoNome(true);
    setErroNome('');
    setSucessoNome(false);
  };

  const handleSalvarNome = async () => {
    if (novoNome.trim().length < 3) {
      setErroNome('Nome deve ter no mínimo 3 caracteres');
      return;
    }

    setSalvandoNome(true);
    setErroNome('');

    try {
      await atualizarNome(novoNome.trim());
      setSucessoNome(true);
      setEditandoNome(false);
      if (refreshProfile) {
        await refreshProfile();
      }
      setTimeout(() => setSucessoNome(false), 3000);
    } catch (error) {
      setErroNome(error instanceof Error ? error.message : 'Erro ao atualizar nome');
    } finally {
      setSalvandoNome(false);
    }
  };

  // Handlers para senha
  const handleSalvarSenha = async () => {
    setErroSenha('');

    if (novaSenha.length < 8) {
      setErroSenha('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(novaSenha)) {
      setErroSenha('A nova senha deve ter ao menos uma letra maiúscula');
      return;
    }

    if (!/[a-z]/.test(novaSenha)) {
      setErroSenha('A nova senha deve ter ao menos uma letra minúscula');
      return;
    }

    if (!/[0-9]/.test(novaSenha)) {
      setErroSenha('A nova senha deve ter ao menos um número');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem');
      return;
    }

    setSalvandoSenha(true);

    try {
      await atualizarSenha(senhaAtual, novaSenha);
      setSucessoSenha(true);
      setEditandoSenha(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSucessoSenha(false), 3000);
    } catch (error) {
      setErroSenha(error instanceof Error ? error.message : 'Erro ao atualizar senha');
    } finally {
      setSalvandoSenha(false);
    }
  };

  // Handler para refazer questionário
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const perfilStyle = perfilInvestidor?.perfil_risco
    ? perfilColors[perfilInvestidor.perfil_risco.toLowerCase()] || perfilColors.moderado
    : perfilColors.moderado;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#0B1F33] mb-6">Meu Perfil</h1>

        {/* Dados Pessoais */}
        <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0B1F33] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#00B8D9]" />
            Dados Pessoais
          </h2>

          {/* Nome */}
          <div className="border-b border-[#E5E7EB] pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm text-[#6B7280] block mb-1">Nome</label>
                {editandoNome ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent"
                      placeholder="Seu nome"
                    />
                    <Button
                      size="sm"
                      onClick={handleSalvarNome}
                      disabled={salvandoNome}
                      className="bg-[#00B8D9] hover:bg-[#007EA7]"
                    >
                      {salvandoNome ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditandoNome(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[#0B1F33] font-medium">{profile?.nome}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditarNome}
                      className="text-[#00B8D9] hover:text-[#007EA7]"
                    >
                      Editar
                    </Button>
                  </div>
                )}
                {erroNome && (
                  <p className="text-sm text-red-500 mt-1">{erroNome}</p>
                )}
                {sucessoNome && (
                  <p className="text-sm text-green-500 mt-1">Nome atualizado com sucesso!</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="border-b border-[#E5E7EB] pb-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-[#6B7280]" />
              <label className="text-sm text-[#6B7280]">Email</label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#0B1F33]">{user?.email}</span>
              <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-1 rounded">
                Não editável
              </span>
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#6B7280]" />
              <label className="text-sm text-[#6B7280]">Senha</label>
            </div>

            {editandoSenha ? (
              <div className="space-y-3 mt-2">
                {/* Senha atual */}
                <div className="relative">
                  <input
                    type={mostrarSenhaAtual ? 'text' : 'password'}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent pr-10"
                    placeholder="Senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Nova senha */}
                <div className="relative">
                  <input
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent pr-10"
                    placeholder="Nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirmar senha */}
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8D9] focus:border-transparent"
                  placeholder="Confirmar nova senha"
                />

                <div className="text-xs text-[#6B7280] space-y-1">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside">
                    <li className={novaSenha.length >= 8 ? 'text-green-500' : ''}>
                      Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(novaSenha) ? 'text-green-500' : ''}>
                      Uma letra maiúscula
                    </li>
                    <li className={/[a-z]/.test(novaSenha) ? 'text-green-500' : ''}>
                      Uma letra minúscula
                    </li>
                    <li className={/[0-9]/.test(novaSenha) ? 'text-green-500' : ''}>
                      Um número
                    </li>
                  </ul>
                </div>

                {erroSenha && (
                  <p className="text-sm text-red-500">{erroSenha}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSalvarSenha}
                    disabled={salvandoSenha}
                    className="bg-[#00B8D9] hover:bg-[#007EA7]"
                  >
                    {salvandoSenha ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar nova senha'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoSenha(false);
                      setSenhaAtual('');
                      setNovaSenha('');
                      setConfirmarSenha('');
                      setErroSenha('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[#0B1F33]">••••••••</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditandoSenha(true)}
                  className="border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9] hover:text-white"
                >
                  <Lock className="w-3 h-3 mr-1.5" />
                  Alterar senha
                </Button>
              </div>
            )}
            {sucessoSenha && (
              <p className="text-sm text-green-500 mt-1">Senha atualizada com sucesso!</p>
            )}
          </div>
        </section>

        {/* Perfil de Investidor */}
        <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#0B1F33] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00B8D9]" />
            Perfil de Investidor
          </h2>

          {carregandoPerfil ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : perfilInvestidor ? (
            <>
              {/* Card do perfil */}
              <div className={`${perfilStyle.bg} ${perfilStyle.border} border rounded-xl p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${perfilStyle.bg} ${perfilStyle.border} border-2 flex items-center justify-center`}>
                      <Shield className={`w-6 h-6 ${perfilStyle.text}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${perfilStyle.text} capitalize`}>
                        {perfilInvestidor.perfil_risco}
                      </h3>
                      <p className="text-sm text-[#6B7280]">Seu perfil de investidor</p>
                    </div>
                  </div>
                </div>
                <p className="text-[#6B7280]">
                  {perfilInvestidor.perfil_risco ? perfilDescricoes[perfilInvestidor.perfil_risco.toLowerCase()] || '' : ''}
                </p>
              </div>

              {/* Detalhes do perfil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {perfilInvestidor.objetivo_principal && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Target className="w-5 h-5 text-[#00B8D9] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Objetivo</p>
                      <p className="text-[#0B1F33] font-medium">{perfilInvestidor.objetivo_principal}</p>
                    </div>
                  </div>
                )}

                {perfilInvestidor.horizonte_investimento && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-[#00B8D9] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Horizonte</p>
                      <p className="text-[#0B1F33] font-medium">{perfilInvestidor.horizonte_investimento}</p>
                    </div>
                  </div>
                )}

                {perfilInvestidor.renda_mensal && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <PiggyBank className="w-5 h-5 text-[#00B8D9] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Renda Mensal</p>
                      <p className="text-[#0B1F33] font-medium">{perfilInvestidor.renda_mensal}</p>
                    </div>
                  </div>
                )}

                {perfilInvestidor.nivel_conhecimento !== undefined && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#00B8D9] mt-0.5" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Nível de Conhecimento</p>
                      <p className="text-[#0B1F33] font-medium">
                        {perfilInvestidor.nivel_conhecimento <= 2 && 'Iniciante'}
                        {perfilInvestidor.nivel_conhecimento === 3 && 'Intermediário'}
                        {perfilInvestidor.nivel_conhecimento >= 4 && 'Avançado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {perfilInvestidor.updated_at && (
                <p className="text-xs text-[#6B7280] mb-4">
                  Última atualização: {new Date(perfilInvestidor.updated_at).toLocaleDateString('pt-BR')}
                </p>
              )}

              {/* Botão refazer questionário */}
              {!mostrarConfirmacao ? (
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfirmacao(true)}
                  className="border-amber-500 text-amber-600 hover:bg-amber-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refazer Questionário
                </Button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800">Confirmar ação</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        Ao refazer o questionário, seu perfil atual será substituído pelo novo resultado.
                        Deseja continuar?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleRefazerQuestionario}
                          disabled={deletandoPerfil}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          {deletandoPerfil ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              Processando...
                            </>
                          ) : (
                            'Sim, refazer'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMostrarConfirmacao(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#6B7280]" />
              </div>
              <h3 className="text-lg font-medium text-[#0B1F33] mb-2">
                Nenhum perfil encontrado
              </h3>
              <p className="text-[#6B7280] mb-4">
                Responda ao questionário para descobrir seu perfil de investidor.
              </p>
              <Button
                onClick={() => router.push('/questionario')}
                className="bg-[#00B8D9] hover:bg-[#007EA7]"
              >
                Fazer Questionário
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
