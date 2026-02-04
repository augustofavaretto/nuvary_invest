# Documentacao de Integracao Supabase - Nuvary Invest

**Data:** Fevereiro 2026
**Versao:** 2.0

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
10. [Configuracao do Google OAuth](#10-configuracao-do-google-oauth)
11. [Proximos Passos](#11-proximos-passos)

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

# Supabase - Projeto Atual
NEXT_PUBLIC_SUPABASE_URL=https://ifxxldtefmcyovxomuau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0pc_-lIMl6uV-Fbc3p1JSw_cbSAHwrb
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
  user: User | null;                  // Usuario do Supabase Auth
  profile: Profile | null;            // Dados da tabela profiles
  loading: boolean;                   // Estado de carregamento
  isAuthenticated: boolean;           // Usuario autenticado?
  logout: () => Promise<void>;        // Funcao de logout
  refreshProfile: () => Promise<void>; // Atualiza dados do perfil
}
```

### 4.2 Fluxo de Cadastro (Email/Senha)

1. Usuario preenche formulario em `/cadastro` com:
   - Nome completo
   - CPF (com validacao e mascara)
   - Data de nascimento (minimo 18 anos)
   - Telefone (com mascara)
   - Email
   - Senha (8+ chars, maiuscula, minuscula, numero)
   - Aceite dos termos
2. Chama `supabase.auth.signUp()` passando dados via `user_metadata`
3. Supabase cria usuario e dispara trigger que cria registro em `profiles`
4. Exibe tela de confirmacao de email
5. Usuario clica no link do email
6. Usuario faz login

### 4.3 Fluxo de Cadastro (Google OAuth)

1. Usuario clica em "Continuar com Google" em `/cadastro` ou `/login`
2. Chama `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. Usuario e redirecionado para autenticacao do Google
4. Apos autenticacao, redireciona para `/questionario`
5. Usuario completa questionario de perfil investidor
6. Redireciona para `/chat`

**Configuracao necessaria no Supabase:**
- Habilitar provider Google em Authentication > Providers
- Configurar Client ID e Client Secret do Google Cloud Console
- Adicionar Callback URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

### 4.4 Fluxo de Login

1. Usuario preenche email e senha em `/login`
2. Chama `supabase.auth.signInWithPassword()`
3. Verifica se existe registro em `perfil_investidor`
4. Se **nao existe** → redireciona para `/questionario`
5. Se **existe** → redireciona para `/chat`

### 4.5 Fluxo de Recuperacao de Senha

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
| `cadastrar()` | Cria usuario no Supabase Auth com CPF, telefone, data nascimento |
| `login()` | Autentica usuario com email/senha |
| `loginWithGoogle()` | Autentica usuario via Google OAuth |
| `logout()` | Encerra sessao |
| `recuperarSenha()` | Envia email de recuperacao |
| `redefinirSenha()` | Atualiza senha do usuario |
| `getUsuarioAtual()` | Retorna usuario logado |
| `getProfile()` | Busca dados da tabela profiles |
| `atualizarNome()` | Atualiza nome do usuario |
| `atualizarSenha()` | Atualiza senha (requer senha atual) |

### 5.2 perfilService.ts

| Funcao | Descricao |
|--------|-----------|
| `salvarPerfilInvestidor()` | Salva/atualiza perfil na tabela `perfil_investidor` |
| `buscarPerfilInvestidor()` | Busca perfil do usuario logado |
| `verificarSeTemPerfil()` | Verifica se usuario ja tem perfil |

### 5.3 chatService.ts

| Funcao | Descricao |
|--------|-----------|
| `gerarConversaId()` | Gera UUID para nova conversa |
| `salvarMensagem()` | Salva mensagem (user ou assistant) com conversa_id |
| `buscarHistorico()` | Busca ultimas 50 mensagens do usuario |
| `buscarMensagensPorConversa()` | Busca mensagens de uma conversa especifica |
| `listarConversas()` | Lista todas as conversas do usuario |
| `buscarConversas()` | Pesquisa conversas por termo |
| `limparHistorico()` | Remove todas mensagens do usuario |
| `deletarConversa()` | Remove uma conversa especifica |
| `contarMensagens()` | Conta total de mensagens do usuario |

---

## 6. Componentes Atualizados

### 6.1 LoginForm.tsx

**Alteracoes:**
- Usa `login()` do authService
- Botao "Entrar com Google" para autenticacao social
- Verifica `verificarSeTemPerfil()` apos login
- Redireciona para `/chat` se tem perfil, senao `/questionario`
- Cores atualizadas para Design System (#0066CC)

### 6.2 RegisterForm.tsx

**Alteracoes:**
- Usa `cadastrar()` do authService
- Botao "Continuar com Google" para autenticacao social
- Campos adicionais:
  - CPF com validacao (algoritmo oficial) e mascara (000.000.000-00)
  - Data de nascimento com validacao (minimo 18 anos) e mascara (DD/MM/AAAA)
  - Telefone com validacao e mascara ((00) 00000-0000)
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
                     ▼             ▼
         ┌───────────────────────────────────┐
         │  Email/Senha    │     Google      │
         └───────────────────────────────────┘
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

**Nota:** Login com Google pula a etapa de confirmacao de email.

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

### Validacao de CPF

```
- 11 digitos numericos
- Algoritmo oficial de validacao (modulo 11)
- Rejeita sequencias repetidas (111.111.111-11)
- Mascara: 000.000.000-00
```

### Validacao de Data de Nascimento

```
- Formato: DD/MM/AAAA
- Data valida (dia, mes, ano)
- Idade minima: 18 anos
- Mascara automatica ao digitar
```

### Validacao de Telefone

```
- 10 ou 11 digitos (fixo ou celular)
- Mascara: (00) 00000-0000
- Aceita DDD + numero
```

---

## 9. Scripts SQL do Supabase

Execute estes scripts no **Supabase Dashboard > SQL Editor**:

### 9.1 Tabela profiles

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255),
  cpf VARCHAR(11),
  data_nascimento VARCHAR(10),
  telefone VARCHAR(11),
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
  conversa_id UUID,
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

-- Indices para performance
CREATE INDEX idx_chat_historico_user_id ON public.chat_historico(user_id);
CREATE INDEX idx_chat_historico_conversa_id ON public.chat_historico(conversa_id);
CREATE INDEX idx_chat_historico_created_at ON public.chat_historico(created_at);
```

### 9.4 Trigger para criar perfil automaticamente

```sql
-- Funcao que cria perfil quando usuario se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    aceite_termos,
    data_aceite_termos
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'data_nascimento',
    NEW.raw_user_meta_data->>'telefone',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'aceite_termos')::boolean, false),
    (NEW.raw_user_meta_data->>'data_aceite_termos')::timestamptz
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a funcao
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Nota:** O `COALESCE` em `nome` permite compatibilidade com login via Google,
que usa `full_name` ao inves de `nome` nos metadados.

---

## 10. Configuracao do Google OAuth

### 10.1 Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Va em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Selecione **Web application**
6. Configure:
   - **Name**: Nuvary Invest
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (producao)
   - **Authorized redirect URIs**:
     - `https://ifxxldtefmcyovxomuau.supabase.co/auth/v1/callback`
7. Copie o **Client ID** e **Client Secret**

### 10.2 Supabase Dashboard

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto
3. Va em **Authentication** > **Providers**
4. Encontre **Google** e clique para expandir
5. Ative o toggle **Enable Sign in with Google**
6. Cole o **Client ID** e **Client Secret** do Google
7. Clique em **Save**

### 10.3 Tela de Consentimento (OAuth consent screen)

1. No Google Cloud Console, va em **OAuth consent screen**
2. Selecione **External** e clique em **Create**
3. Preencha:
   - App name: Nuvary Invest
   - User support email: seu email
   - Developer contact: seu email
4. Em **Scopes**, adicione:
   - `email`
   - `profile`
   - `openid`
5. Salve

---

## 11. Proximos Passos

---

### ✅ Concluido

**Autenticacao e Usuarios**
- ✅ Cadastro com email/senha e validacao completa
- ✅ Login/Logout com JWT e refresh token
- ✅ Recuperacao e redefinicao de senha
- ✅ Autenticacao social com Google OAuth
- ✅ Campos CPF, data nascimento e telefone no cadastro
- ✅ Validacao de CPF com algoritmo oficial (modulo 11)
- ✅ Mascaras de input para CPF, telefone e data
- ✅ Funcao refreshProfile no AuthContext
- ✅ Exclusao de conta do usuario

**Perfil de Investidor**
- ✅ Questionario de 10 perguntas em 3 categorias
- ✅ Classificacao em 4 perfis (Conservador, Moderado, Arrojado, Agressivo)
- ✅ Alocacao recomendada por perfil
- ✅ Persistencia no Supabase PostgreSQL
- ✅ Opcao de refazer questionario

**Chat com IA**
- ✅ Integracao com OpenAI (gpt-4o-mini)
- ✅ Sistema de multiplas conversas (conversa_id)
- ✅ Listagem e busca de conversas
- ✅ Historico persistente no banco de dados
- ✅ Acoes rapidas pre-definidas
- ✅ Contexto do perfil de investidor nas respostas
- ✅ Analise de acoes e noticias
- ✅ Explicacao de termos financeiros

**Backend e APIs**
- ✅ Integracao Alpha Vantage (acoes, forex, cripto)
- ✅ Integracao Finnhub (dados real-time, indicadores)
- ✅ Integracao News API (noticias financeiras)
- ✅ Sistema de cache inteligente (node-cache)
- ✅ Rotacao de API keys para maximizar limites
- ✅ Rate limiting nos endpoints de autenticacao

**Interface e UX**
- ✅ Landing page com hero, features e CTA
- ✅ Design system com cores e tipografia padronizadas
- ✅ Componentes shadcn/ui
- ✅ Animacoes com Framer Motion
- ✅ Layout responsivo basico
- ✅ Pagina de documentacao tecnica

---

### 🔥 Alta Prioridade

**Dashboard Principal**
- 🔥 Criar pagina /dashboard apos login
- 🔥 Exibir resumo do perfil de investidor
- 🔥 Mostrar estatisticas de uso do chat
- 🔥 Integrar graficos de mercado (Recharts/Chart.js)

**Visualizacao de Dados de Mercado**
- 🔥 Graficos de acoes com candlestick
- 🔥 Feed de noticias financeiras
- 🔥 Indicadores tecnicos visuais
- 🔥 Watchlist de ativos favoritos

**Seguranca**
- 🔥 Migrar tokens de localStorage para httpOnly cookies
- 🔥 Implementar protecao CSRF
- 🔥 Validacao de entrada em todas as rotas da API
- 🔥 Error boundaries nos componentes React

---

### ⏳ Pendente

**Configuracoes e Preferencias**
- ⏳ Pagina de configuracoes do usuario
- ⏳ Preferencias de notificacao
- ⏳ Selecao de tema (claro/escuro)
- ⏳ Configuracoes de privacidade

**Melhorias no Chat**
- ⏳ Paginacao no historico de conversas
- ⏳ Exportar conversas em PDF/TXT
- ⏳ Renomear conversas
- ⏳ Fixar conversas importantes

**Perfil do Usuario**
- ⏳ Edicao do perfil de investidor (sem refazer questionario)
- ⏳ Upload de foto de perfil
- ⏳ Historico de alteracoes do perfil

**Email e Comunicacao**
- ⏳ Configurar templates de email no Supabase
- ⏳ Email de boas-vindas personalizado
- ⏳ Notificacoes por email de atividades

---

### ⭐ Melhorias Futuras

**Funcionalidades Avancadas**
- ⭐ Portfolio de investimentos com tracking
- ⭐ Alertas de preco em tempo real
- ⭐ Backtesting de estrategias
- ⭐ Analise de correlacao de ativos
- ⭐ Metricas de risco (Sharpe, volatilidade)
- ⭐ Sugestoes de rebalanceamento

**Autenticacao e Seguranca**
- ⭐ Autenticacao social com GitHub
- ⭐ Two-factor authentication (2FA)
- ⭐ Biometria (mobile)
- ⭐ Logs de auditoria de acesso
- ⭐ Sessoes ativas e gerenciamento

**Conteudo Educacional**
- ⭐ Modulo de cursos sobre investimentos
- ⭐ Trilhas de aprendizado personalizadas
- ⭐ Videos e tutoriais interativos
- ⭐ Glossario financeiro completo
- ⭐ Simulador de investimentos

**Integracao e Expansao**
- ⭐ Conexao com corretoras (APIs)
- ⭐ Importacao de extratos
- ⭐ Sincronizacao automatica de portfolio
- ⭐ Webhooks para integracao externa

**Mobile e PWA**
- ⭐ Progressive Web App (PWA)
- ⭐ App mobile nativo (React Native)
- ⭐ Push notifications
- ⭐ Modo offline

**Social e Comunidade**
- ⭐ Perfis publicos de investidores
- ⭐ Forum de discussao
- ⭐ Compartilhamento de ideias de investimento
- ⭐ Ranking e gamificacao

**Infraestrutura**
- ⭐ Testes unitarios (Jest)
- ⭐ Testes E2E (Playwright/Cypress)
- ⭐ Monitoramento (Sentry)
- ⭐ CI/CD pipeline
- ⭐ Documentacao da API (Swagger)

---

### 🛠️ Debito Tecnico

**Codigo**
- 🛠️ Remover tipos `any` do TypeScript
- 🛠️ Centralizar constantes (cores, URLs)
- 🛠️ Criar cliente HTTP centralizado com interceptors
- 🛠️ Melhorar tratamento de erros especificos

**Banco de Dados**
- 🛠️ Remover better-sqlite3 (usar apenas Supabase)
- 🛠️ Adicionar indices de performance
- 🛠️ Implementar soft delete

**Performance**
- 🛠️ Otimizar bundle size (code splitting)
- 🛠️ Lazy loading de rotas
- 🛠️ Otimizacao de imagens Next.js
- 🛠️ Service workers para cache

---

## Contato

Projeto desenvolvido para **Nuvary Invest** - Consultoria de Investimentos com IA.

---

*Documentacao atualizada em Fevereiro/2026*
