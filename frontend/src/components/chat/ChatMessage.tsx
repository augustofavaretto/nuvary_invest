'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <Avatar className={`w-9 h-9 shrink-0 ${isAssistant ? 'bg-[#00B8D9]' : 'bg-[#0B1F33]'}`}>
        {isAssistant ? (
          <>
            <AvatarImage src="/logo-icon.png" alt="Nuvary" />
            <AvatarFallback className="bg-[#00B8D9] text-white">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-[#0B1F33] text-white">
            <User className="w-5 h-5" />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Message Bubble */}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isAssistant
            ? 'bg-card border border-border text-foreground rounded-tl-sm'
            : 'nuvary-gradient text-white rounded-tr-sm'
          }
        `}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-1.5">
            <motion.span
              className={`w-2 h-2 rounded-full ${isAssistant ? 'bg-[#00B8D9]' : 'bg-white/70'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className={`w-2 h-2 rounded-full ${isAssistant ? 'bg-[#00B8D9]' : 'bg-white/70'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className={`w-2 h-2 rounded-full ${isAssistant ? 'bg-[#00B8D9]' : 'bg-white/70'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        {!message.isLoading && (
          <div
            className={`text-xs mt-1.5 ${isAssistant ? 'text-muted-foreground' : 'text-white/70'}`}
          >
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
