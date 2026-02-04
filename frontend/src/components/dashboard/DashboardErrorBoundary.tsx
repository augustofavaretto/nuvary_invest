'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorar AbortError - nao e um erro real, e do React Strict Mode
    if (error.name === 'AbortError') {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Ignorar AbortError silenciosamente
    if (error.name === 'AbortError') {
      return;
    }
    console.error('Dashboard error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-[#E5E7EB]">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0B1F33] mb-2">
                Algo deu errado
              </h3>
              <p className="text-[#6B7280] text-sm mb-4">
                Ocorreu um erro ao carregar o dashboard. Tente novamente.
              </p>
              <Button
                onClick={this.handleRetry}
                className="bg-[#00B8D9] hover:bg-[#007EA7]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
