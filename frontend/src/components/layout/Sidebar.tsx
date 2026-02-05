'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  FileText,
  BarChart3,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    id: 'chat',
    label: 'Chat IA',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/chat',
    badge: 'IA',
  },
  {
    id: 'carteira',
    label: 'Minha Carteira',
    icon: <Wallet className="w-5 h-5" />,
    href: '/carteira',
  },
  {
    id: 'extratos',
    label: 'Extratos',
    icon: <FileText className="w-5 h-5" />,
    href: '/extratos',
  },
  {
    id: 'relatorios',
    label: 'Relatorios',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/relatorios',
  },
  {
    id: 'trilhas',
    label: 'Trilhas Educativas',
    icon: <GraduationCap className="w-5 h-5" />,
    href: '/trilhas',
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#0B1F33] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a3a5c]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00B8D9] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-white font-semibold text-lg whitespace-nowrap overflow-hidden"
              >
                Nuvary
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-[#00B8D9] text-white'
                      : 'text-[#8BA3C1] hover:bg-[#1a3a5c] hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isCollapsed && item.badge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="ml-auto bg-[#00B8D9] text-white text-xs px-2 py-0.5 rounded-full font-semibold"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-[#1a3a5c]">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#8BA3C1] hover:bg-[#1a3a5c] hover:text-white transition-colors"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// Mobile Sidebar Component
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-[#0B1F33] flex flex-col z-50"
          >
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a3a5c]">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 bg-[#00B8D9] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-white font-semibold text-lg">Nuvary</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#8BA3C1] hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1 px-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                          ${isActive
                            ? 'bg-[#00B8D9] text-white'
                            : 'text-[#8BA3C1] hover:bg-[#1a3a5c] hover:text-white'
                          }
                        `}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[#00B8D9] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
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
