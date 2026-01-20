'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="Nuvary Invest"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-[#0B1F33]">Nuvary</span>
              <span className="text-sm font-medium text-[#00B8D9]">INVEST</span>
            </div>
          </Link>
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt="Nuvary Invest"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold text-[#0B1F33]">Nuvary</span>
            <span className="text-sm font-medium text-[#00B8D9]">INVEST</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Links de navegação */}
              <Link
                href="/questionario"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Questionario
              </Link>
              <Link
                href="/chat"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Assistente IA
              </Link>

              {/* Botão Chat */}
              <Link href="/chat" className="hidden sm:block">
                <Button size="sm" variant="outline" className="border-[#00B8D9] text-[#00B8D9]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </Link>

              {/* Menu do usuário */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full nuvary-gradient flex items-center justify-center text-white font-medium text-sm">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#0B1F33] hidden sm:block max-w-[100px] truncate">
                    {user?.nome?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E5E7EB]">
                      <p className="text-sm font-medium text-[#0B1F33] truncate">{user?.nome}</p>
                      <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/questionario"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] hover:bg-gray-50 sm:hidden"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Links para não autenticados */}
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Entrar
              </Link>
              <Link href="/cadastro">
                <Button size="sm" className="nuvary-gradient border-0">
                  Criar conta
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
