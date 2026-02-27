'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  BarChart3,
  GraduationCap,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard',     label: 'Dashboard',        icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
  { id: 'chat',          label: 'Chat IA',           icon: <MessageSquare className="w-5 h-5" />,  href: '/chat',          badge: 'IA' },
  { id: 'carteira',      label: 'Minha Carteira',    icon: <Wallet className="w-5 h-5" />,         href: '/carteira' },
  { id: 'relatorios',    label: 'Relatórios',        icon: <BarChart3 className="w-5 h-5" />,      href: '/relatorios' },
  { id: 'trilhas',       label: 'Trilhas Educativas',icon: <GraduationCap className="w-5 h-5" />,  href: '/trilhas' },
  { id: 'configuracoes', label: 'Configurações',     icon: <Settings className="w-5 h-5" />,       href: '/configuracoes' },
];

// ── Desktop Sidebar (fixo, ícone acima do texto) ─────────────────────────────
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[80px] bg-[#0B1F33] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center justify-center py-5 border-b border-[#1a3a5c]">
        <Link href="/dashboard">
          <div className="w-10 h-10 bg-[#00B8D9] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-base">N</span>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col items-center gap-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.id} className="w-full">
                <Link
                  href={item.href}
                  className={`
                    relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-[#00B8D9] text-white'
                      : 'text-[#8BA3C1] hover:bg-[#1a3a5c] hover:text-white'}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="absolute top-1.5 right-1.5 bg-white/20 text-white text-[9px] px-1 py-0.5 rounded-full font-semibold leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

// ── Mobile Sidebar (drawer, abre/fecha) ──────────────────────────────────────
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#0B1F33] rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lg:hidden fixed left-0 top-0 h-screen w-[80px] bg-[#0B1F33] flex flex-col z-50"
          >
            <div className="flex items-center justify-center py-5 border-b border-[#1a3a5c] relative">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <div className="w-10 h-10 bg-[#00B8D9] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-base">N</span>
                </div>
              </Link>
              <button onClick={() => setIsOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8BA3C1] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="flex flex-col items-center gap-1 px-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.id} className="w-full">
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-[#00B8D9] text-white'
                            : 'text-[#8BA3C1] hover:bg-[#1a3a5c] hover:text-white'}
                        `}
                      >
                        <span>{item.icon}</span>
                        <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 bg-white/20 text-white text-[9px] px-1 py-0.5 rounded-full font-semibold leading-none">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
