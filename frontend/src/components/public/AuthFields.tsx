'use client';

import { Lock, Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  icon?: LucideIcon;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'search' | 'url' | 'none' | 'decimal';
  maxLength?: number;
  // Mensagem de erro a exibir abaixo do campo. Quando preenchida, o input ganha borda vermelha.
  error?: string;
}

// Campo de texto compartilhado entre /login, /cadastro e /recuperar-senha.
export function Field({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  required,
  inputMode,
  maxLength,
  error,
}: FieldProps) {
  const hasError = !!error;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              hasError ? 'text-red-400' : 'text-slate-500'
            }`}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={hasError}
          className={`w-full rounded-xl bg-[#0a1428] text-slate-100 placeholder:text-slate-500 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2.5 text-sm focus:outline-none transition border ${
            hasError
              ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-white/[0.06] focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20'
          }`}
        />
      </div>
      {hasError && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordInput({
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Lock
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl bg-[#0a1428] border border-white/[0.06] text-slate-100 placeholder:text-slate-500 pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 transition"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
