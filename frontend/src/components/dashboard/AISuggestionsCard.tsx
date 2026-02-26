'use client';

import { Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STRINGS } from '@/constants/strings';

interface AISuggestionsCardProps {
  suggestion: string;
  onRefresh: () => void;
  loading?: boolean;
}

export function AISuggestionsCard({ suggestion, onRefresh, loading }: AISuggestionsCardProps) {
  return (
    <Card className="border-border bg-gradient-to-br from-[#00B8D9]/5 to-[#007EA7]/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00B8D9]" />
          {STRINGS.dashboard.sugestoesIA}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-[#6B7280] hover:text-[#00B8D9]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {suggestion || STRINGS.perfil.fazerQuestionario}
          </div>
        )}
        <p className="text-xs text-[#9CA3AF] mt-4 italic">
          * Sugestões geradas por IA baseadas no seu perfil de investidor. {STRINGS.dashboard.naoConstituiRecomendacao}.
        </p>
      </CardContent>
    </Card>
  );
}
