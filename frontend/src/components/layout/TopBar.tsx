'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  /** Opcional: substitui o sino padrao por um componente custom (ex: NotificationBell). */
  notificationSlot?: React.ReactNode;
}

// ── TopBar do redesign — 80px, navy-deep, cloud + notif + user pill ──────────
export function TopBar({ notificationSlot }: TopBarProps) {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  const nome = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';

  return (
    <header
      className="
        sticky top-0 z-30
        h-[var(--topbar-h)]
        bg-[var(--navy-deep)]
        border-b border-[var(--border)]
        flex items-center
        px-4 lg:px-8
      "
    >
      {/* Spacer */}
      <div className="flex-1" />

      {/* Notificacao — slot ou botao default */}
      {notificationSlot ?? (
        <button
          type="button"
          className="
            relative w-10 h-10 grid place-items-center
            rounded-full text-[var(--t2)]
            transition-colors duration-200 ease-[var(--ease)]
            hover:text-[var(--cyan)] hover:bg-[rgba(0,184,217,0.08)]
          "
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          <span
            className="
              absolute top-[9px] right-[10px] w-2 h-2 rounded-full
              bg-[var(--cyan)]
              border-2 border-[var(--navy-deep)]
            "
          />
        </button>
      )}

      {/* User pill */}
      <div className="relative ml-3" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="
            flex items-center gap-3
            pl-1.5 pr-3.5 py-1.5
            rounded-full
            transition-colors duration-200 ease-[var(--ease)]
            hover:bg-[var(--glass)]
          "
        >
          {/* Avatar — usa profile.avatar_url se houver, senao logo nuvary */}
          <span className="w-9 h-9 rounded-full bg-white grid place-items-center overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src="/brand/nuvary-icon.png"
                alt=""
                width={26}
                height={26}
                className="object-contain"
              />
            )}
          </span>

          <span className="hidden sm:flex flex-col text-left leading-tight">
            <strong className="text-sm font-semibold text-[var(--t1)]">
              {nome}
            </strong>
            <small className="text-[11px] text-[var(--t2)] truncate max-w-[180px]">
              {email}
            </small>
          </span>

          <ChevronDown className="w-[18px] h-[18px] text-[var(--t2)] hidden sm:block" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-full mt-2 w-56
              bg-[var(--surface-2)]
              border border-[var(--border)]
              rounded-[var(--r-md)]
              shadow-xl
              py-2 z-40
            "
          >
            <Link
              href="/perfil"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--t1)] hover:bg-[var(--glass)] transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Meu Perfil
            </Link>
            <Link
              href="/configuracoes"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--t1)] hover:bg-[var(--glass)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
            <div className="border-t border-[var(--border)] my-1" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--loss)] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
