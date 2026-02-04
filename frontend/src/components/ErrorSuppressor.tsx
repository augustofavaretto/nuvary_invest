'use client';

import { useEffect } from 'react';

/**
 * Componente que suprime erros de AbortError do React 19 Strict Mode + Next.js 16
 * Esses erros sao inofensivos e ocorrem apenas em desenvolvimento
 */
export function ErrorSuppressor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handler para unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === 'AbortError' ||
        event.reason?.message?.includes('signal is aborted') ||
        event.reason?.message?.includes('aborted')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Handler para erros globais
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.name === 'AbortError' ||
        event.message?.includes('AbortError') ||
        event.message?.includes('signal is aborted')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Sobrescrever console.error
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const firstArg = args[0];

      // Verificar se e string
      if (typeof firstArg === 'string') {
        if (
          firstArg.includes('AbortError') ||
          firstArg.includes('signal is aborted') ||
          firstArg.includes('aborted without reason')
        ) {
          return;
        }
      }

      // Verificar se e Error
      if (firstArg instanceof Error) {
        if (
          firstArg.name === 'AbortError' ||
          firstArg.message?.includes('signal is aborted')
        ) {
          return;
        }
      }

      originalConsoleError.apply(console, args);
    };

    // Adicionar listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
      console.error = originalConsoleError;
    };
  }, []);

  return <>{children}</>;
}
