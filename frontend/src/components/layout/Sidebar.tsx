'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  LifeBuoy,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  // duas linhas opcionais para itens com label longo (ex: "Minha Carteira")
  labelLine2?: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard',     label: 'Dashboard',                                  icon: <LayoutDashboard className="w-[22px] h-[22px]" />, href: '/dashboard' },
  { id: 'chat',          label: 'Chat IA',                                    icon: <MessageSquare className="w-[22px] h-[22px]" />,   href: '/chat',          badge: 'IA' },
  { id: 'carteira',      label: 'Minha',           labelLine2: 'Carteira',    icon: <Wallet className="w-[22px] h-[22px]" />,          href: '/carteira' },
  { id: 'relatorios',    label: 'Relatórios',                                 icon: <BarChart3 className="w-[22px] h-[22px]" />,       href: '/relatorios' },
  { id: 'trilhas',       label: 'Trilhas',         labelLine2: 'Educativas',  icon: <GraduationCap className="w-[22px] h-[22px]" />,   href: '/trilhas' },
  { id: 'configuracoes', label: 'Configurações',                              icon: <Settings className="w-[22px] h-[22px]" />,        href: '/configuracoes' },
];

// ── Conteudo compartilhado entre Desktop e Mobile ───────────────────────────
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand mark — quadrado branco com logo nuvary */}
      <Link href="/dashboard" onClick={onItemClick} className="block">
        <div className="w-14 h-14 bg-white rounded-[14px] grid place-items-center mb-6 shadow-[var(--shadow-brand)]">
          <Image
            src="/brand/nuvary-icon.png"
            alt="Nuvary Invest"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
      </Link>

      {/* Nav — paddings reduzidos para "Configurações" caber dentro do botao ativo */}
      <nav className="w-full px-2 flex-1">
        <ul className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-0 rounded-[var(--r-md)] text-center text-[10.5px] font-medium leading-[1.15] tracking-[-0.005em] transition-colors duration-200 ease-[var(--ease)] ${
                    isActive
                      ? 'bg-[var(--cyan)] text-[var(--navy-deep)] shadow-[var(--shadow-glow)]'
                      : 'text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--glass)]'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>
                    {item.label}
                    {item.labelLine2 && (
                      <>
                        <br />
                        {item.labelLine2}
                      </>
                    )}
                  </span>
                  {item.badge && (
                    <span
                      className={`
                        absolute top-1 right-3.5 px-1.5 py-[1px] rounded-lg
                        text-[9px] font-bold tracking-wider
                        ${isActive
                          ? 'bg-[var(--navy)] text-[var(--cyan)]'
                          : 'bg-[var(--cyan-700)] text-white'}
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Suporte — fixo na base, abre a Central de Ajuda (FAQ + contato) */}
      <div className="w-full px-2 mt-2 pt-3 border-t border-[var(--border)]">
        <Link
          href="/suporte"
          onClick={onItemClick}
          aria-current={pathname === '/suporte' ? 'page' : undefined}
          title="Central de Ajuda — FAQ e contato"
          className={`flex flex-col items-center justify-center gap-1 py-2.5 px-0 rounded-[var(--r-md)] text-center text-[10.5px] font-medium leading-[1.15] tracking-[-0.005em] transition-colors duration-200 ease-[var(--ease)] ${
            pathname === '/suporte'
              ? 'bg-[var(--cyan)] text-[var(--navy-deep)] shadow-[var(--shadow-glow)]'
              : 'text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--glass)]'
          }`}
        >
          <LifeBuoy className="w-[22px] h-[22px] shrink-0" />
          <span>Suporte</span>
        </Link>
      </div>
    </>
  );
}

// ── Desktop Sidebar (fixo, 96px, sempre visivel em lg+) ─────────────────────
export function Sidebar() {
  return (
    <aside
      className="
        fixed top-0 left-0 bottom-0 z-40
        w-[var(--sidebar-w)]
        bg-[var(--navy-deep)]
        border-r border-[var(--border)]
        flex flex-col items-center
        py-[18px]
        hidden lg:flex
      "
    >
      <SidebarContent />
    </aside>
  );
}

// ── Mobile Sidebar (drawer com hamburger) ───────────────────────────────────
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[var(--navy-deep)] rounded-lg text-white"
        aria-label="Abrir menu"
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
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -120 }}
            animate={{ x: 0 }}
            exit={{ x: -120 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="
              lg:hidden fixed top-0 left-0 bottom-0 z-50
              w-[var(--sidebar-w)]
              bg-[var(--navy-deep)]
              border-r border-[var(--border)]
              flex flex-col items-center
              py-[18px]
            "
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 text-[var(--t2)] hover:text-white"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent onItemClick={() => setIsOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
