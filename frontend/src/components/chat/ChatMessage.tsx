'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Bubble de mensagem do chat — bot a esquerda com avatar gradient ciano,
// user a direita com bubble brand. Fiel ao mockup (.msg + .msg-bot-icon
// + .msg-body).
export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar circular — branco com logo natural para bot, surface para user */}
      <div
        className="w-10 h-10 rounded-full grid place-items-center shrink-0 overflow-hidden"
        style={
          isAssistant
            ? { background: 'white' }
            : { background: 'var(--surface-2)', border: '1px solid var(--border)' }
        }
      >
        {isAssistant ? (
          <Image
            src="/brand/nuvary-icon.png"
            alt="Nuvary"
            width={34}
            height={34}
            className="object-contain"
          />
        ) : (
          <User className="w-5 h-5 text-[var(--t1)]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-[var(--r-lg)] px-4 py-3 ${
          isAssistant ? 'rounded-tl-sm' : 'rounded-tr-sm text-white'
        }`}
        style={
          isAssistant
            ? {
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
              }
            : { background: 'var(--grad-brand-h)' }
        }
      >
        {message.isLoading ? (
          <div className="flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay) => (
              <motion.span
                key={delay}
                className="w-2 h-2 rounded-full"
                style={{ background: isAssistant ? 'var(--cyan)' : 'rgba(255,255,255,0.7)' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
              />
            ))}
          </div>
        ) : isAssistant ? (
          <div className="text-[14px] leading-relaxed space-y-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-5 my-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-5 my-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyan)] hover:underline"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code
                    className="px-1.5 py-0.5 rounded text-[12px] font-mono"
                    style={{ background: 'var(--glass)' }}
                  >
                    {children}
                  </code>
                ),
                h1: ({ children }) => (
                  <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
                ),
                h2: ({ children }) => (
                  <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-[14px] leading-relaxed">
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        {!message.isLoading && (
          <div
            className="text-[11px] mt-1.5"
            style={{ color: isAssistant ? 'var(--t3)' : 'rgba(255,255,255,0.75)' }}
          >
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
