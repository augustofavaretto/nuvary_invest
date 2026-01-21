# Documentacao de Integracao Supabase - Nuvary Invest

**Data:** Janeiro 2026
**Versao:** 1.0

---

## Sumario

1. [Visao Geral](#1-visao-geral)
2. [Configuracao do Supabase](#2-configuracao-do-supabase)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Sistema de Autenticacao](#4-sistema-de-autenticacao)
5. [Services (Servicos)](#5-services-servicos)
6. [Componentes Atualizados](#6-componentes-atualizados)
7. [Fluxo de Navegacao](#7-fluxo-de-navegacao)
8. [Design System](#8-design-system)
9. [Scripts SQL do Supabase](#9-scripts-sql-do-supabase)
10. [Proximos Passos](#10-proximos-passos)

---

## 1. Visao Geral

A integracao com Supabase foi implementada para gerenciar:

- **Autenticacao de usuarios** (cadastro, login, recuperacao de senha)
- **Perfil do investidor** (respostas do questionario)
- **Historico de conversas** do chatbot com IA

### Tecnologias Utilizadas

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 16.1.2 | Framework React |
| Supabase JS | ^2.x | SDK do Supabase |
| TypeScript | 5.x | Tipagem estatica |
| Tailwind CSS | 3.x | Estilizacao |
| Framer Motion | 11.x | Animacoes |
| React Hook Form | 7.x | Formularios |
| Zod | 3.x | Validacao |

---

## 2. Configuracao do Supabase

### Variaveis de Ambiente

Arquivo: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qvwlfwuuuozixyqlyhez.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7wGuJ-RzQOElc60FC4Hjfw_X7PN87Ul
```

### Cliente Supabase

Arquivo: `frontend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

---

## 3. Estrutura de Arquivos

```
frontend/src/
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── validators.ts        # Funcoes de validacao
│
├── services/
│   ├── authService.ts       # Servico de autenticacao
│   ├── perfilService.ts     # Servico do perfil investidor
│   └── chatService.ts       # Servico do historico de chat
│
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticacao (atualizado)
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # Formulario de login (atualizado)
│   │   ├── RegisterForm.tsx     # Formulario de cadastro (atualizado)
│   │   ├── ForgotPasswordForm.tsx  # Recuperar senha (atualizado)
│   │   ├── ResetPasswordForm.tsx   # Redefinir senha (novo)
│   │   ├── PasswordInput.tsx    # Input de senha
│   │   └── index.ts             # Exports
│   │
│   ├── questionnaire/
│   │   ├── Questionnaire.tsx    # Questionario (atualizado)
│   │   └── ResultCard.tsx       # Resultado (atualizado)
│   │
│   ├── chat/
│   │   └── Chatbot.tsx          # Chatbot (atualizado)
│   │
│   ├── layout/
│   │   └── Header.tsx           # Header (atualizado)
│   │
│   └── ProtectedRoute.tsx       # Rota protegida (novo)
│
└── app/
    ├── redefinir-senha/
    │   └── page.tsx             # Pagina redefinir senha (novo)
    └── ...
```

---

## 4. Sistema de Autenticacao

### 4.1 AuthContext

Arquivo: `frontend/src/contexts/AuthContext.tsx`

**Funcionalidades:**
- Gerencia estado do usuario autenticado
- Escuta mudancas de sessao do Supabase
- Busca perfil do usuario na tabela `profiles`
- Fornece funcao de logout

```typescript
interface AuthContextType {
  user: User | null;           // Usuario do Supabase Auth
  profile: Profile | null;     // Dados da tabela profiles
  loading: boolean;            // Estado de carregamento
  isAuthenticated: boolean;    // Usuario autenticado?
  logout: () => Promise<void>; // Funcao de logout
}
```

### 4.2 Fluxo de Cadastro

1. Usuario preenche formulario em `/cadastro`
2. Chama `supabase.auth.signUp()` com email, senha e nome
3. Supabase cria usuario e dispara trigger que cria registro em `profiles`
4. Exibe tela de confirmacao de email
5. Usuario clica no link do email
6. Usuario faz login

### 4.3 Fluxo de Login

1. Usuario preenche email e senha em `/login`
2. Chama `supabase.auth.signInWithPassword()`
3. Verifica se existe registro em `perfil_investidor`
4. Se **nao existe** → redireciona para `/questionario`
5. Se **existe** → redireciona para `/chat`

### 4.4 Fluxo de Recuperacao de Senha

1. Usuario informa email em `/recuperar-senha`
2. Chama `supabase.auth.resetPasswordForEmail()`
3. Supabase envia email com link para `/redefinir-senha`
4. Usuario clica no link e define nova senha
5. Chama `supabase.auth.updateUser()` com nova senha

---

## 5. Services (Servicos)

### 5.1 authService.ts

| Funcao | Descricao |
|--------|-----------|
| `cadastrar()` | Cria usuario no Supabase Auth |
| `login()` | Autentica usuario com email/senha |
| `logout()` | Encerra sessao |
| `recuperarSenha()` | Envia email de recuperacao |
| `redefinirSenha()` | Atualiza senha do usuario |
| `getUsuarioAtual()` | Retorna usuario logado |
| `getProfile()` | Busca dados da tabela profiles |

### 5.2 perfilService.ts

| Funcao | Descricao |
|--------|-----------|
| `salvarPerfilInvestidor()` | Salva/atualiza perfil na tabela `perfil_investidor` |
| `buscarPerfilInvestidor()` | Busca perfil do usuario logado |
| `verificarSeTemPerfil()` | Verifica se usuario ja tem perfil |

### 5.3 chatService.ts

| Funcao | Descricao |
|--------|-----------|
| `salvarMensagem()` | Salva mensagem (user ou assistant) |
| `buscarHistorico()` | Busca ultimas 50 mensagens do usuario |
| `limparHistorico()` | Remove todas mensagens do usuario |

---

## 6. Componentes Atualizados

### 6.1 LoginForm.tsx

**Alteracoes:**
- Usa `login()` do authService
- Verifica `verificarSeTemPerfil()` apos login
- Redireciona para `/chat` se tem perfil, senao `/questionario`
- Cores atualizadas para Design System (#0066CC)

### 6.2 RegisterForm.tsx

**Alteracoes:**
- Usa `cadastrar()` do authService
- Tela de sucesso com instrucoes para confirmar email
- Botao "Abrir meu email" detecta provedor (Gmail, Outlook, etc)
- Nao redireciona automaticamente (espera confirmacao)

### 6.3 ForgotPasswordForm.tsx

**Alteracoes:**
- Usa `recuperarSenha()` do authService
- Mensagem: "Se o email existir, voce recebera instrucoes"
- Cores atualizadas para Design System

### 6.4 ResetPasswordForm.tsx (Novo)

**Funcionalidades:**
- Verifica sessao valida do link de recuperacao
- Valida nova senha (8+ chars, maiuscula, minuscula, numero)
- Confirma senha
- Redireciona para login apos sucesso

### 6.5 Questionnaire.tsx

**Alteracoes:**
- Importa `salvarPerfilInvestidor` do perfilService
- Apos submeter respostas, salva no Supabase
- Adiciona `handleGoToChat()` para navegacao
- Passa prop `onGoToChat` para ResultCard

### 6.6 ResultCard.tsx

**Alteracoes:**
- Adiciona prop opcional `onGoToChat`
- Botao "Conversar com Assistente" usa funcao se disponivel

### 6.7 Chatbot.tsx

**Alteracoes:**
- Importa services do Supabase
- Carrega perfil do Supabase (com fallback localStorage)
- Carrega historico de mensagens do Supabase
- Salva cada mensagem (user e assistant) no Supabase
- Estado `isInitialized` para controlar carregamento

### 6.8 Header.tsx

**Alteracoes:**
- Usa `profile` em vez de `user` para nome/email
- Usa `loading` em vez de `isLoading`
- Exibe inicial do nome do perfil

### 6.9 ProtectedRoute.tsx (Novo)

**Funcionalidades:**
- Wrapper para rotas protegidas
- Mostra spinner enquanto verifica autenticacao
- Redireciona para `/login` se nao autenticado

---

## 7. Fluxo de Navegacao

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Tem conta?    │
                    └─────────────────┘
                     │             │
                    Nao           Sim
                     │             │
                     ▼             ▼
              ┌──────────┐  ┌──────────┐
              │ /cadastro │  │  /login  │
              └──────────┘  └──────────┘
                     │             │
                     ▼             │
              ┌──────────────┐     │
              │ Confirmar    │     │
              │ Email        │     │
              └──────────────┘     │
                     │             │
                     └─────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Tem perfil     │
                  │  investidor?    │
                  └─────────────────┘
                     │           │
                    Nao         Sim
                     │           │
                     ▼           ▼
             ┌─────────────┐ ┌────────┐
             │/questionario│ │ /chat  │
             └─────────────┘ └────────┘
                     │           ▲
                     │           │
                     └───────────┘
                   (apos responder)
```

---

## 8. Design System

### Cores

| Nome | Hex | Uso |
|------|-----|-----|
| Primaria | `#0066CC` | Botoes, links, destaques |
| Secundaria | `#1E3A5F` | Textos escuros |
| Erro | `#EF4444` | Mensagens de erro, validacao |
| Sucesso | `#10B981` | Confirmacoes, icones sucesso |
| Fundo | `#F9FAFB` | Background das paginas |
| Borda | `#E5E7EB` | Bordas de cards e inputs |
| Texto | `#0B1F33` | Titulos |
| Texto secundario | `#6B7280` | Descricoes, labels |

### Validacao de Senha

```
- Minimo 8 caracteres
- Pelo menos 1 letra maiuscula
- Pelo menos 1 letra minuscula
- Pelo menos 1 numero
```

---

## 9. Scripts SQL do Supabase

Execute estes scripts no **Supabase Dashboard > SQL Editor**:

### 9.1 Tabela profiles

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255),
  email VARCHAR(255),
  aceite_termos BOOLEAN DEFAULT FALSE,
  data_aceite_termos TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politicas de seguranca
CREATE POLICY "Usuarios podem ver proprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar proprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem inserir proprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 9.2 Tabela perfil_investidor

```sql
CREATE TABLE public.perfil_investidor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  idade VARCHAR(50),
  perfil_risco VARCHAR(50),
  objetivo_principal VARCHAR(255),
  horizonte_investimento VARCHAR(100),
  nivel_conhecimento INTEGER,
  renda_mensal VARCHAR(100),
  valor_investir VARCHAR(100),
  respostas_completas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.perfil_investidor ENABLE ROW LEVEL SECURITY;

-- Politicas de seguranca
CREATE POLICY "Usuarios podem ver proprio perfil investidor"
  ON public.perfil_investidor FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir proprio perfil investidor"
  ON public.perfil_investidor FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar proprio perfil investidor"
  ON public.perfil_investidor FOR UPDATE
  USING (auth.uid() = user_id);
```

### 9.3 Tabela chat_historico

```sql
CREATE TABLE public.chat_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.chat_historico ENABLE ROW LEVEL SECURITY;

-- Politicas de seguranca
CREATE POLICY "Usuarios podem ver proprio historico"
  ON public.chat_historico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir mensagens"
  ON public.chat_historico FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar proprio historico"
  ON public.chat_historico FOR DELETE
  USING (auth.uid() = user_id);

-- Indice para performance
CREATE INDEX idx_chat_historico_user_id ON public.chat_historico(user_id);
CREATE INDEX idx_chat_historico_created_at ON public.chat_historico(created_at);
```

### 9.4 Trigger para criar perfil automaticamente

```sql
-- Funcao que cria perfil quando usuario se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a funcao
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 10. Proximos Passos

### Pendente

- [ ] Configurar templates de email no Supabase Dashboard
- [ ] Adicionar pagina de perfil do usuario
- [ ] Implementar edicao do perfil investidor
- [ ] Adicionar paginacao no historico do chat
- [ ] Implementar "limpar historico" no chat

### Melhorias Futuras

- [ ] Autenticacao social (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting nas APIs
- [ ] Logs de auditoria
- [ ] Exportar historico de conversas

---

## Contato

Projeto desenvolvido para **Nuvary Invest** - Consultoria de Investimentos com IA.

---

*Documentacao gerada em Janeiro/2026*
