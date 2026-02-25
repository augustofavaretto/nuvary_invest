'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar, MobileSidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { STRINGS } from '@/constants/strings';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col lg:ml-[240px] ml-0"
        style={{ marginLeft: undefined }} // Override for responsive
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left spacer for mobile menu button */}
            <div className="lg:hidden w-10" />

            {/* Right section */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 text-[#6B7280] hover:text-[#0B1F33] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00B8D9] rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#00B8D9] to-[#007EA7] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {profile?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[#0B1F33]">
                      {profile?.nome || user?.email?.split('@')[0] || STRINGS.nav.usuario}
                    </p>
                    <p className="text-xs text-[#6B7280]">{user?.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2 z-20"
                    >
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[#0B1F33] hover:bg-[#F3F4F6] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[#0B1F33] hover:bg-[#F3F4F6] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {STRINGS.nav.configuracoes}
                      </Link>
                      <div className="border-t border-[#E5E7EB] my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </motion.div>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .lg\\:ml-\\[240px\\] {
            margin-left: ${sidebarCollapsed ? '72px' : '240px'} !important;
          }
        }
      `}</style>
    </div>
  );
}
