'use client';

import Link from 'next/link';
import { MessageSquare, User, ClipboardList, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STRINGS } from '@/constants/strings';

const actions = [
  {
    href: '/chat',
    icon: MessageSquare,
    label: 'Chat com IA',
    description: 'Tire dúvidas',
    gradient: 'from-[#00B8D9] to-[#007EA7]',
  },
  {
    href: '/perfil',
    icon: User,
    label: 'Meu Perfil',
    description: 'Editar dados',
    gradient: 'from-[#8B5CF6] to-[#6D28D9]',
  },
  {
    href: '/questionario',
    icon: ClipboardList,
    label: STRINGS.nav.questionario,
    description: 'Refazer perfil',
    gradient: 'from-[#10B981] to-[#059669]',
  },
];

export function QuickActionsPanel() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00B8D9]" />
          {STRINGS.dashboard.acoesRapidas}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-[#00B8D9] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-[#6B7280]">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
