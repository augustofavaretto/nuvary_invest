'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MoreVertical,
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
  const [, setBuscando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [conversaParaDeletar, setConversaParaDeletar] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);
  const [menuAberto, setMenuAberto] = useState<{ conversaId: string; x: number; y: number } | null>(null);
  const [renameConversaId, setRenameConversaId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha menu ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!menuAberto) return;
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAberto(null);
    };
    document.addEventListener('mousedown', handleClickFora);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuAberto]);

  const aplicarTitulosCustomizados = (lista: Conversa[]): Conversa[] =>
    lista.map(c => ({
      ...c,
      titulo: getTituloCustomizado(c.id) || c.titulo,
    }));

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

  const handleRenomearConversa = (conversaId: string, novoTitulo: string) => {
    const titulo = novoTitulo.trim();
    if (!titulo) return;
    setTituloCustomizado(conversaId, titulo);
    setConversas(prev =>
      prev.map(c => (c.id === conversaId ? { ...c, titulo } : c))
    );
  };

  // Agrupa conversas por periodo
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

      if (dias === 0) hoje.push(conversa);
      else if (dias === 1) ontem.push(conversa);
      else if (dias < 7) semana.push(conversa);
      else if (dias < 30) mes.push(conversa);
      else antigas.push(conversa);
    });

    return { hoje, ontem, semana, mes, antigas };
  };

  const grupos = agruparConversas();

  const renderItem = (conversa: Conversa) => (
    <ConversaItem
      key={conversa.id}
      conversa={conversa}
      isAtiva={conversaAtual === conversa.id}
      onSelecionar={() => onSelecionarConversa(conversa.id)}
      onDeletar={() => setConversaParaDeletar(conversa.id)}
      onRenomear={(titulo) => handleRenomearConversa(conversa.id, titulo)}
      onAbrirMenu={(id, x, y) => setMenuAberto({ conversaId: id, x, y })}
      startRenaming={renameConversaId === conversa.id}
      onRenameActivated={() => setRenameConversaId(null)}
    />
  );

  // Versao colapsada — 64px com brand mark + nova conversa + expand
  if (isCollapsed) {
    return (
      <div
        className="w-16 flex flex-col h-full overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-[10px] grid place-items-center overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 12px rgba(0, 184, 217, 0.25)' }}
            >
              <Image
                src="/brand/nuvary-icon.png"
                alt="Nuvary"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center py-4 gap-3">
          <button
            onClick={onNovaConversa}
            className="w-10 h-10 rounded-[var(--r-md)] grid place-items-center transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cyan)' }}
            title="Nova conversa"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-[var(--r-md)] grid place-items-center transition-colors"
            style={{ color: 'var(--t2)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="w-[320px] flex flex-col h-full overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        {/* Head — brand pill + nova conversa + busca */}
        <div className="px-[18px] pt-[18px] pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          {/* Brand pill — logo gradient + Nuvary + collapse */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] mb-3.5">
            <div
              className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 12px rgba(0, 184, 217, 0.25)' }}
            >
              <Image
                src="/brand/nuvary-icon.png"
                alt="Nuvary"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between flex-1">
              <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--t1)' }}>
                Nuvary
              </span>
              <button
                onClick={onToggleCollapse}
                className="w-6 h-6 grid place-items-center rounded-md transition-colors"
                style={{ color: 'var(--t2)' }}
                title="Recolher"
                aria-label="Recolher sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nova conversa + lixeira (apagar todas) */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onNovaConversa}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-[var(--r-md)] text-[13.5px] font-medium transition-colors"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
              }}
            >
              <Plus className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
              Nova conversa
            </button>
            <button
              onClick={() => setMostrarConfirmacaoLimpar(true)}
              disabled={conversas.length === 0}
              className="w-[42px] h-[42px] grid place-items-center rounded-[var(--r-md)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--t2)',
              }}
              title={STRINGS.chat.limparHistorico}
              aria-label="Apagar todas as conversas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Busca */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-md)]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--t3)' }} />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar conversas..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-100"
              style={{ color: 'var(--t1)' }}
            />
            {termoBusca && (
              <button
                onClick={() => handleBusca('')}
                className="shrink-0"
                style={{ color: 'var(--t3)' }}
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1 px-1.5 py-2.5">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--t3)' }} />
            </div>
          ) : conversas.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--t3)', opacity: 0.5 }} />
              <p className="text-[13px]" style={{ color: 'var(--t2)' }}>
                {termoBusca ? STRINGS.chat.nenhumaConversaEncontrada : STRINGS.chat.nenhumaConversaAinda}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>
                {STRINGS.chat.iniciaNova}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {grupos.hoje.length > 0 && (
                <HistorySection label={STRINGS.chat.hoje}>{grupos.hoje.map(renderItem)}</HistorySection>
              )}
              {grupos.ontem.length > 0 && (
                <HistorySection label={STRINGS.chat.ontem}>{grupos.ontem.map(renderItem)}</HistorySection>
              )}
              {grupos.semana.length > 0 && (
                <HistorySection label={STRINGS.chat.ultimosDias(7)}>{grupos.semana.map(renderItem)}</HistorySection>
              )}
              {grupos.mes.length > 0 && (
                <HistorySection label={STRINGS.chat.ultimosDias(30)}>{grupos.mes.map(renderItem)}</HistorySection>
              )}
              {grupos.antigas.length > 0 && (
                <HistorySection label={STRINGS.chat.maisAntigas}>{grupos.antigas.map(renderItem)}</HistorySection>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Menu de contexto (renomear / apagar) */}
      <AnimatePresence>
        {menuAberto && (
          <MenuContexto
            position={{ x: menuAberto.x, y: menuAberto.y }}
            onRenomear={() => {
              setRenameConversaId(menuAberto.conversaId);
              setMenuAberto(null);
            }}
            onDeletar={() => {
              setConversaParaDeletar(menuAberto.conversaId);
              setMenuAberto(null);
            }}
            onFechar={() => setMenuAberto(null)}
            menuRef={menuRef}
          />
        )}
      </AnimatePresence>

      {/* Modal confirmar limpar todo o historico */}
      <AnimatePresence>
        {mostrarConfirmacaoLimpar && (
          <ConfirmModal
            icon={<AlertTriangle className="w-6 h-6" style={{ color: 'var(--loss)' }} />}
            title={STRINGS.chat.limparTudoConfirm}
            description={STRINGS.chat.acaoIraExcluirTudo}
            confirmLabel={limpando ? 'Limpando...' : 'Limpar tudo'}
            loading={limpando}
            onCancel={() => setMostrarConfirmacaoLimpar(false)}
            onConfirm={handleLimparHistorico}
          />
        )}
      </AnimatePresence>

      {/* Modal confirmar deletar conversa */}
      <AnimatePresence>
        {conversaParaDeletar && (
          <ConfirmModal
            icon={<Trash2 className="w-6 h-6" style={{ color: 'var(--loss)' }} />}
            title="Deletar conversa?"
            description={STRINGS.chat.seraExcluida}
            confirmLabel={deletando ? 'Deletando...' : 'Deletar'}
            loading={deletando}
            onCancel={() => setConversaParaDeletar(null)}
            onConfirm={() => handleDeletarConversa(conversaParaDeletar)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Seccao "Hoje / Ontem / Ultimos 7 dias" — label uppercase + lista
function HistorySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5">
      <div
        className="text-[11px] uppercase tracking-[0.08em] mb-2"
        style={{ color: 'var(--t3)' }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// Modal generico de confirmacao
function ConfirmModal({
  icon,
  title,
  description,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="max-w-md w-full p-6 rounded-[var(--r-lg)]"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full grid place-items-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--t1)' }}>
              {title}
            </h3>
            <p className="text-[13px] mb-4" style={{ color: 'var(--t2)' }}>
              {description}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-[var(--r-md)] text-[13px] font-medium transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--t1)',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-md)] text-[13px] font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: 'var(--loss)' }}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {confirmLabel}
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0"
            style={{ color: 'var(--t3)' }}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Menu de contexto dropdown (renomear / apagar)
function MenuContexto({
  position,
  onRenomear,
  onDeletar,
  onFechar,
  menuRef,
}: {
  position: { x: number; y: number };
  onRenomear: () => void;
  onDeletar: () => void;
  onFechar: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  void onFechar;
  const MENU_WIDTH = 180;
  const MENU_HEIGHT = 92;

  const x = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8);
  const y = position.y + MENU_HEIGHT > window.innerHeight
    ? position.y - MENU_HEIGHT
    : position.y;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 50,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
      className="rounded-[var(--r-md)] p-1.5 min-w-[200px]"
    >
      <button
        type="button"
        onClick={onRenomear}
        className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] text-[13px] w-full text-left transition-colors hover:bg-[var(--surface-3)]"
        style={{ color: 'var(--t1)' }}
      >
        <Pencil className="w-4 h-4" />
        {STRINGS.chat.mudarNome}
      </button>
      <button
        type="button"
        onClick={onDeletar}
        className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] text-[13px] w-full text-left transition-colors hover:bg-[var(--surface-3)]"
        style={{ color: 'var(--loss)' }}
      >
        <Trash2 className="w-4 h-4" />
        {STRINGS.chat.apagar}
      </button>
    </motion.div>
  );
}

// Item da lista de conversas — fiel ao mockup (.history-item)
function ConversaItem({
  conversa,
  isAtiva,
  onSelecionar,
  onRenomear,
  onAbrirMenu,
  startRenaming,
  onRenameActivated,
}: {
  conversa: Conversa;
  isAtiva: boolean;
  onSelecionar: () => void;
  onDeletar: () => void;
  onRenomear: (titulo: string) => void;
  onAbrirMenu: (conversaId: string, x: number, y: number) => void;
  startRenaming?: boolean;
  onRenameActivated?: () => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState(conversa.titulo);

  useEffect(() => {
    if (startRenaming) {
      setNovoTitulo(conversa.titulo);
      setIsRenaming(true);
      onRenameActivated?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRenaming]);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onAbrirMenu(conversa.id, e.clientX, e.clientY);
  };

  const handleMoreVertical = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onAbrirMenu(conversa.id, rect.right, rect.bottom);
  };

  return (
    <div
      className="conversa-item-row relative flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-md)] cursor-pointer transition-colors overflow-hidden mb-0.5"
      style={
        isAtiva
          ? { background: 'var(--surface-2)', color: 'var(--t1)' }
          : { color: 'var(--t2)' }
      }
      onClick={isRenaming ? undefined : onSelecionar}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => {
        if (!isAtiva) {
          e.currentTarget.style.background = 'var(--surface-2)';
          e.currentTarget.style.color = 'var(--t1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isAtiva) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--t2)';
        }
      }}
    >
      <MessageSquare
        className="w-[15px] h-[15px] shrink-0"
        style={{ color: isAtiva ? 'var(--cyan)' : 'currentColor', opacity: isAtiva ? 1 : 0.7 }}
      />

      {isRenaming ? (
        <>
          <input
            autoFocus
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') salvarRename();
              if (e.key === 'Escape') cancelarRename();
            }}
            onBlur={salvarRename}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-transparent text-[13.5px] outline-none border-b"
            style={{ color: 'var(--t1)', borderColor: 'var(--cyan)' }}
          />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); salvarRename(); }}
            className="p-1 rounded shrink-0"
            style={{ color: 'var(--cyan)' }}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 min-w-0 text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">
            {conversa.titulo}
          </span>
          <button
            type="button"
            onClick={handleMoreVertical}
            className="conversa-dots-btn shrink-0 w-6 h-6 grid place-items-center rounded-md transition-colors"
            style={{ color: 'var(--t3)' }}
            title="Opções"
            aria-label="Opções da conversa"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
