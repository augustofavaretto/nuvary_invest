'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import {
  listarConversas,
  buscarConversas,
  deletarConversa,
  limparHistorico,
  getTituloCustomizado,
  setTituloCustomizado,
  removerTituloCustomizado,
} from '@/services/chatService';
import Image from 'next/image';
import Link from 'next/link';
import { STRINGS } from '@/constants/strings';

interface Conversa {
  id: string;
  titulo: string;
  ultimaMensagem: string;
  dataAtualizacao: string;
  totalMensagens: number;
}

interface ChatSidebarProps {
  conversaAtual: string | null;
  onNovaConversa: () => void;
  onSelecionarConversa: (conversaId: string) => void;
  onLimparHistorico: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatSidebar({
  conversaAtual,
  onNovaConversa,
  onSelecionarConversa,
  onLimparHistorico,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [conversaParaDeletar, setConversaParaDeletar] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);

  // Aplica títulos customizados do localStorage sobre a lista
  const aplicarTitulosCustomizados = (lista: Conversa[]): Conversa[] =>
    lista.map(c => ({
      ...c,
      titulo: getTituloCustomizado(c.id) || c.titulo,
    }));

  // Carrega conversas
  useEffect(() => {
    carregarConversas();
  }, []);

  const carregarConversas = async () => {
    setCarregando(true);
    try {
      const lista = await listarConversas();
      setConversas(aplicarTitulosCustomizados(lista));
    } catch (e) {
      console.error('Erro ao carregar conversas:', e);
    } finally {
      setCarregando(false);
    }
  };

  // Busca conversas
  const handleBusca = async (termo: string) => {
    setTermoBusca(termo);
    if (!termo.trim()) {
      carregarConversas();
      return;
    }

    setBuscando(true);
    try {
      const resultado = await buscarConversas(termo);
      setConversas(aplicarTitulosCustomizados(resultado));
    } catch (e) {
      console.error('Erro ao buscar conversas:', e);
    } finally {
      setBuscando(false);
    }
  };

  // Limpar todo histórico
  const handleLimparHistorico = async () => {
    setLimpando(true);
    try {
      await limparHistorico();
      setConversas([]);
      setMostrarConfirmacaoLimpar(false);
      onLimparHistorico();
    } catch (e) {
      console.error('Erro ao limpar histórico:', e);
    } finally {
      setLimpando(false);
    }
  };

  // Deletar conversa específica
  const handleDeletarConversa = async (conversaId: string) => {
    setDeletando(true);
    try {
      await deletarConversa(conversaId);
      removerTituloCustomizado(conversaId);
      setConversas(prev => prev.filter(c => c.id !== conversaId));
      setConversaParaDeletar(null);
      if (conversaAtual === conversaId) {
        onNovaConversa();
      }
    } catch (e) {
      console.error('Erro ao deletar conversa:', e);
    } finally {
      setDeletando(false);
    }
  };

  // Renomear conversa (persiste no localStorage)
  const handleRenomearConversa = (conversaId: string, novoTitulo: string) => {
    const titulo = novoTitulo.trim();
    if (!titulo) return;
    setTituloCustomizado(conversaId, titulo);
    setConversas(prev =>
      prev.map(c => (c.id === conversaId ? { ...c, titulo } : c))
    );
  };

  // Formata data relativa
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return STRINGS.chat.hoje;
    } else if (dias === 1) {
      return STRINGS.chat.ontem;
    } else if (dias < 7) {
      return STRINGS.chat.diasAtras(dias);
    } else if (dias < 30) {
      const semanas = Math.floor(dias / 7);
      return STRINGS.chat.semanasAtras(semanas);
    } else {
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  };

  // Agrupa conversas por período
  const agruparConversas = () => {
    const hoje: Conversa[] = [];
    const ontem: Conversa[] = [];
    const semana: Conversa[] = [];
    const mes: Conversa[] = [];
    const antigas: Conversa[] = [];

    conversas.forEach(conversa => {
      const data = new Date(conversa.dataAtualizacao);
      const agora = new Date();
      const diff = agora.getTime() - data.getTime();
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias === 0) {
        hoje.push(conversa);
      } else if (dias === 1) {
        ontem.push(conversa);
      } else if (dias < 7) {
        semana.push(conversa);
      } else if (dias < 30) {
        mes.push(conversa);
      } else {
        antigas.push(conversa);
      }
    });

    return { hoje, ontem, semana, mes, antigas };
  };

  const grupos = agruparConversas();

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[#1C1C1C] border-r border-[#2D2D2D] flex flex-col h-full">
        {/* Logo colapsado */}
        <div className="p-3 border-b border-[#2D2D2D]">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg nuvary-gradient flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="Nuvary"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Botões colapsados */}
        <div className="flex-1 flex flex-col items-center py-4 gap-3">
          <Button
            onClick={onNovaConversa}
            size="icon"
            className="w-10 h-10 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white"
            title="Nova conversa"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Botão expandir */}
        <div className="p-3 border-t border-[#2D2D2D]">
          <Button
            onClick={onToggleCollapse}
            size="icon"
            variant="ghost"
            className="w-10 h-10 text-[#6B7280] hover:text-white hover:bg-[#2D2D2D]"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-72 bg-[#1C1C1C] border-r border-[#2D2D2D] flex flex-col h-full">
        {/* Header com logo */}
        <div className="p-4 border-b border-[#2D2D2D]">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg nuvary-gradient flex items-center justify-center">
                <Image
                  src="/logo-icon.png"
                  alt="Nuvary"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-white font-semibold text-sm">Nuvary</span>
            </Link>
            <Button
              onClick={onToggleCollapse}
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-[#6B7280] hover:text-white hover:bg-[#2D2D2D]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Botão Nova Conversa */}
          <Button
            onClick={onNovaConversa}
            className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white border border-[#3D3D3D] justify-start gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova conversa
          </Button>
        </div>

        {/* Busca */}
        <div className="p-4 border-b border-[#2D2D2D]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              value={termoBusca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar conversas..."
              className="pl-10 bg-[#2D2D2D] border-[#3D3D3D] text-white placeholder:text-[#6B7280] focus:border-[#00B8D9]"
            />
            {termoBusca && (
              <button
                onClick={() => handleBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Conversas */}
        <ScrollArea className="flex-1 px-2">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 text-[#6B7280] animate-spin" />
            </div>
          ) : conversas.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-10 h-10 text-[#3D3D3D] mx-auto mb-3" />
              <p className="text-[#6B7280] text-sm">
                {termoBusca ? STRINGS.chat.nenhumaConversaEncontrada : STRINGS.chat.nenhumaConversaAinda}
              </p>
              <p className="text-[#4D4D4D] text-xs mt-1">
                {STRINGS.chat.iniciaNova}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* Hoje */}
              {grupos.hoje.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#6B7280] px-3 py-2 font-medium">{STRINGS.chat.hoje}</p>
                  {grupos.hoje.map((conversa) => (
                    <ConversaItem
                      key={conversa.id}
                      conversa={conversa}
                      isAtiva={conversaAtual === conversa.id}
                      onSelecionar={() => onSelecionarConversa(conversa.id)}
                      onDeletar={() => setConversaParaDeletar(conversa.id)}
                      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
                    />
                  ))}
                </div>
              )}

              {/* Ontem */}
              {grupos.ontem.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#6B7280] px-3 py-2 font-medium">{STRINGS.chat.ontem}</p>
                  {grupos.ontem.map((conversa) => (
                    <ConversaItem
                      key={conversa.id}
                      conversa={conversa}
                      isAtiva={conversaAtual === conversa.id}
                      onSelecionar={() => onSelecionarConversa(conversa.id)}
                      onDeletar={() => setConversaParaDeletar(conversa.id)}
                      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
                    />
                  ))}
                </div>
              )}

              {/* Últimos 7 dias */}
              {grupos.semana.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#6B7280] px-3 py-2 font-medium">{STRINGS.chat.ultimosDias(7)}</p>
                  {grupos.semana.map((conversa) => (
                    <ConversaItem
                      key={conversa.id}
                      conversa={conversa}
                      isAtiva={conversaAtual === conversa.id}
                      onSelecionar={() => onSelecionarConversa(conversa.id)}
                      onDeletar={() => setConversaParaDeletar(conversa.id)}
                      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
                    />
                  ))}
                </div>
              )}

              {/* Últimos 30 dias */}
              {grupos.mes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#6B7280] px-3 py-2 font-medium">{STRINGS.chat.ultimosDias(30)}</p>
                  {grupos.mes.map((conversa) => (
                    <ConversaItem
                      key={conversa.id}
                      conversa={conversa}
                      isAtiva={conversaAtual === conversa.id}
                      onSelecionar={() => onSelecionarConversa(conversa.id)}
                      onDeletar={() => setConversaParaDeletar(conversa.id)}
                      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
                    />
                  ))}
                </div>
              )}

              {/* Mais antigas */}
              {grupos.antigas.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#6B7280] px-3 py-2 font-medium">{STRINGS.chat.maisAntigas}</p>
                  {grupos.antigas.map((conversa) => (
                    <ConversaItem
                      key={conversa.id}
                      conversa={conversa}
                      isAtiva={conversaAtual === conversa.id}
                      onSelecionar={() => onSelecionarConversa(conversa.id)}
                      onDeletar={() => setConversaParaDeletar(conversa.id)}
                      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer com opções */}
        {conversas.length > 0 && (
          <div className="p-3 border-t border-[#2D2D2D]">
            <Button
              variant="ghost"
              onClick={() => setMostrarConfirmacaoLimpar(true)}
              className="w-full justify-start gap-2 text-[#6B7280] hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              {STRINGS.chat.limparHistorico}
            </Button>
          </div>
        )}
      </div>

      {/* Modal confirmar limpar histórico */}
      <AnimatePresence>
        {mostrarConfirmacaoLimpar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarConfirmacaoLimpar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {STRINGS.chat.limparTudoConfirm}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {STRINGS.chat.acaoIraExcluirTudo}
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setMostrarConfirmacaoLimpar(false)}
                      disabled={limpando}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleLimparHistorico}
                      disabled={limpando}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {limpando ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Limpando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar tudo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarConfirmacaoLimpar(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal confirmar deletar conversa */}
      <AnimatePresence>
        {conversaParaDeletar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConversaParaDeletar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Deletar conversa?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {STRINGS.chat.seraExcluida}
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setConversaParaDeletar(null)}
                      disabled={deletando}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleDeletarConversa(conversaParaDeletar)}
                      disabled={deletando}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {deletando ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Deletando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setConversaParaDeletar(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Componente de item de conversa
function ConversaItem({
  conversa,
  isAtiva,
  onSelecionar,
  onDeletar,
  onRenomear,
}: {
  conversa: Conversa;
  isAtiva: boolean;
  onSelecionar: () => void;
  onDeletar: () => void;
  onRenomear: (titulo: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState(conversa.titulo);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const salvarRename = () => {
    const titulo = novoTitulo.trim();
    if (titulo && titulo !== conversa.titulo) {
      onRenomear(titulo);
    }
    setIsRenaming(false);
  };

  const cancelarRename = () => {
    setNovoTitulo(conversa.titulo);
    setIsRenaming(false);
  };

  return (
    <div
      className={`
        group relative flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer
        transition-colors
        ${isAtiva || showMenu ? 'bg-[#2D2D2D]' : 'hover:bg-[#2D2D2D]/50'}
      `}
      onClick={isRenaming || showMenu ? undefined : onSelecionar}
    >
      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isAtiva ? 'text-[#00B8D9]' : 'text-[#6B7280]'}`} />

      {isRenaming ? (
        <>
          <input
            autoFocus
            value={novoTitulo}
            onChange={e => setNovoTitulo(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') salvarRename();
              if (e.key === 'Escape') cancelarRename();
            }}
            onBlur={salvarRename}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent text-sm text-white border-b border-[#00B8D9] outline-none min-w-0"
          />
          <button
            onMouseDown={e => { e.preventDefault(); salvarRename(); }}
            className="p-1 text-[#00B8D9] hover:text-white rounded flex-shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <span className={`text-sm truncate flex-1 min-w-0 ${isAtiva ? 'text-white' : 'text-[#9CA3AF]'}`}>
            {conversa.titulo}
          </span>

          {/* Botão três pontos */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
              className={`
                p-1 rounded transition-colors
                ${showMenu
                  ? 'text-white bg-[#3D3D3D]'
                  : 'text-[#6B7280] hover:text-white hover:bg-[#3D3D3D]'}
              `}
              title="Mais opções"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-7 z-50 bg-[#2D2D2D] border border-[#3D3D3D] rounded-lg shadow-xl py-1 min-w-[150px]">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setNovoTitulo(conversa.titulo);
                    setIsRenaming(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#3D3D3D] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Renomear
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDeletar();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Apagar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
