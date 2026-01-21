# Especificação Técnica - Sistema de Autenticação Nuvary Invest
## Versão Final com Supabase Configurado

---

## 1. Contexto do Projeto

- **Projeto:** Nuvary Invest - Consultoria de investimentos com IA
- **Stack Backend:** Node.js (APIs: AlphaVantage, Finnhub, News API, OpenAI)
- **Stack Frontend:** React + Vite + Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + Real-time)
- **Funcionalidades existentes:** Questionário de Perfil e Chatbot
- **Objetivo:** Sistema de cadastro/login para persistir dados do usuário

---

## 2. Credenciais Supabase (Projeto Nuvary)

### Arquivo: `.env` (na raiz do projeto React)

```env
VITE_SUPABASE_URL=https://qvwlfwuuuozixyqlyhez.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_7wGuJ-RzQOElc60FC4Hjfw_X7PN87Ul
```

> ⚠️ **IMPORTANTE:** Nunca commitar o arquivo `.env` no Git. Adicionar ao `.gitignore`

---

## 3. Configuração Inicial

### 3.1 Instalar dependência

```bash
npm install @supabase/supabase-js
```

### 3.2 Criar cliente Supabase

**Arquivo:** `src/utils/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

---

## 4. Estrutura do Banco de Dados (SQL)

Executar no **Supabase Dashboard → SQL Editor**:

### 4.1 Tabela: profiles

```sql
-- Tabela de perfis (dados adicionais do usuário)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  aceite_termos BOOLEAN NOT NULL DEFAULT false,
  data_aceite_termos TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuarios podem ver proprio perfil" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar proprio perfil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios podem inserir proprio perfil" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### 4.2 Tabela: perfil_investidor

```sql
-- Tabela do questionário de perfil do investidor
CREATE TABLE perfil_investidor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idade VARCHAR(50),
  perfil_risco VARCHAR(50) NOT NULL,
  objetivo_principal VARCHAR(100),
  horizonte_investimento VARCHAR(50),
  nivel_conhecimento INTEGER,
  renda_mensal VARCHAR(50),
  valor_investir VARCHAR(50),
  respostas_completas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE perfil_investidor ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuarios podem ver proprio perfil_investidor" 
  ON perfil_investidor FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir proprio perfil_investidor" 
  ON perfil_investidor FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar proprio perfil_investidor" 
  ON perfil_investidor FOR UPDATE 
  USING (auth.uid() = user_id);
```

### 4.3 Tabela: chat_historico

```sql
-- Tabela do histórico de conversas do chatbot
CREATE TABLE chat_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE chat_historico ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuarios podem ver proprio historico" 
  ON chat_historico FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir no historico" 
  ON chat_historico FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### 4.4 Trigger: criar profile automaticamente

```sql
-- Função que cria profile quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função após inserção em auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 5. Estrutura de Arquivos React

```
src/
├── utils/
│   └── supabase.ts                 # Cliente Supabase
├── contexts/
│   └── AuthContext.tsx             # Estado global de autenticação
├── hooks/
│   └── useAuth.ts                  # Hook customizado
├── services/
│   ├── authService.ts              # Funções de auth
│   ├── perfilService.ts            # Funções do questionário
│   └── chatService.ts              # Funções do chat
├── components/
│   ├── auth/
│   │   ├── FormCadastro.tsx
│   │   ├── FormLogin.tsx
│   │   ├── FormRecuperarSenha.tsx
│   │   └── InputSenha.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Cadastro.tsx
│   ├── Login.tsx
│   ├── RecuperarSenha.tsx
│   ├── RedefinirSenha.tsx
│   ├── Questionario.tsx            # Já existe - adaptar
│   ├── Chatbot.tsx                 # Já existe - adaptar
│   └── Dashboard.tsx
├── utils/
│   ├── supabase.ts
│   └── validators.ts
└── App.tsx
```

---

## 6. Tela de Cadastro

### 6.1 Campos obrigatórios

| Campo | Tipo | Validação |
|-------|------|-----------|
| Nome completo | texto | Mínimo 3 caracteres |
| Email | email | Formato válido |
| Senha | password | Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número |
| Confirmar senha | password | Igual ao campo senha |
| Aceite dos termos | checkbox | Obrigatório marcar |

### 6.2 Comportamento

- Validação em tempo real dos campos
- Botão desabilitado até todos os campos válidos
- Após cadastro → redirecionar para Questionário
- Exibir erros claros (email já existe, senha fraca)
- Link: "Já tem conta? Entrar"

### 6.3 Código do serviço

**Arquivo:** `src/services/authService.ts`

```typescript
import supabase from '../utils/supabase';

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  aceiteTermos: boolean;
}

export async function cadastrar({ nome, email, senha, aceiteTermos }: CadastroData) {
  // 1. Criar usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome: nome
      }
    }
  });

  if (error) throw error;

  // 2. Atualizar aceite dos termos
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        aceite_termos: aceiteTermos,
        data_aceite_termos: new Date().toISOString()
      })
      .eq('id', data.user.id);
  }

  return data;
}

export async function login(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function recuperarSenha(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`
  });

  if (error) throw error;
  return data;
}

export async function redefinirSenha(novaSenha: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: novaSenha
  });

  if (error) throw error;
  return data;
}

export async function getUsuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
```

---

## 7. Tela de Login

### 7.1 Campos

| Campo | Tipo |
|-------|------|
| Email | email |
| Senha | password |

### 7.2 Comportamento

- Mensagem de erro genérica: "Email ou senha incorretos"
- Após login:
  - Se não tem perfil_investidor → redirecionar para Questionário
  - Se tem → redirecionar para Dashboard/Chatbot
- Links: "Criar conta" e "Esqueci minha senha"

---

## 8. Tela de Recuperação de Senha

### 8.1 Etapa 1 - Solicitar

- Campo: Email
- Mensagem: "Se o email existir, você receberá instruções"
- Botão: "Enviar link de recuperação"

### 8.2 Etapa 2 - Redefinir

- Campos: Nova senha + Confirmar nova senha
- Após redefinir → redirecionar para Login

---

## 9. Contexto de Autenticação

**Arquivo:** `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supabase from '../utils/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  nome: string;
  email: string;
  aceite_termos: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    setProfile(data);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loading,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 10. Proteção de Rotas

**Arquivo:** `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## 11. Configuração de Rotas

**Arquivo:** `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Questionario from './pages/Questionario';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          
          {/* Rotas protegidas */}
          <Route path="/questionario" element={
            <ProtectedRoute><Questionario /></ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute><Chatbot /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          
          {/* Rota padrão */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 12. Integração: Questionário de Perfil

**Arquivo:** `src/services/perfilService.ts`

```typescript
import supabase from '../utils/supabase';

interface PerfilInvestidor {
  idade?: string;
  perfilRisco: string;
  objetivo?: string;
  horizonte?: string;
  nivelConhecimento?: number;
  renda?: string;
  valorInvestir?: string;
  [key: string]: any;
}

export async function salvarPerfilInvestidor(respostas: PerfilInvestidor) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('perfil_investidor')
    .upsert({
      user_id: user.id,
      idade: respostas.idade,
      perfil_risco: respostas.perfilRisco,
      objetivo_principal: respostas.objetivo,
      horizonte_investimento: respostas.horizonte,
      nivel_conhecimento: respostas.nivelConhecimento,
      renda_mensal: respostas.renda,
      valor_investir: respostas.valorInvestir,
      respostas_completas: respostas,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function buscarPerfilInvestidor() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('perfil_investidor')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // PGRST116 = registro não encontrado (não é erro)
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function verificarSeTemPerfil(): Promise<boolean> {
  const perfil = await buscarPerfilInvestidor();
  return !!perfil;
}
```

---

## 13. Integração: Chatbot

**Arquivo:** `src/services/chatService.ts`

```typescript
import supabase from '../utils/supabase';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function salvarMensagem(role: 'user' | 'assistant', content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('chat_historico')
    .insert({
      user_id: user.id,
      role,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function buscarHistorico(limite = 50): Promise<Mensagem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_historico')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limite);

  if (error) throw error;
  return data || [];
}

export async function limparHistorico() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('chat_historico')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
```

---

## 14. Validações

**Arquivo:** `src/utils/validators.ts`

```typescript
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarSenha(senha: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(senha);
}

export function validarNome(nome: string): boolean {
  return nome.trim().length >= 3;
}

export function getErroSenha(senha: string): string | null {
  if (!senha) return 'Senha é obrigatória';
  if (senha.length < 8) return 'Mínimo 8 caracteres';
  if (!/[a-z]/.test(senha)) return 'Deve conter letra minúscula';
  if (!/[A-Z]/.test(senha)) return 'Deve conter letra maiúscula';
  if (!/\d/.test(senha)) return 'Deve conter número';
  return null;
}

export function getErroNome(nome: string): string | null {
  if (!nome) return 'Nome é obrigatório';
  if (nome.trim().length < 3) return 'Mínimo 3 caracteres';
  return null;
}

export function getErroEmail(email: string): string | null {
  if (!email) return 'Email é obrigatório';
  if (!validarEmail(email)) return 'Email inválido';
  return null;
}
```

---

## 15. Fluxo de Navegação

```
[Página Inicial "/"]
        │
        ▼
   [Redireciona]
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                  NÃO AUTENTICADO                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│   [/login] ◄──────────────────► [/cadastro]           │
│       │                              │                │
│       │                              ▼                │
│       │                    [Criar conta]              │
│       │                              │                │
│       ▼                              │                │
│   [/recuperar-senha]                 │                │
│       │                              │                │
│       ▼                              │                │
│   [/redefinir-senha]                 │                │
│                                      │                │
└──────────────────────────────────────┼────────────────┘
                                       │
                                       ▼
┌───────────────────────────────────────────────────────┐
│                    AUTENTICADO                        │
├───────────────────────────────────────────────────────┤
│                                                       │
│   [Verifica se tem perfil_investidor]                 │
│           │                                           │
│     ┌─────┴─────┐                                     │
│     │           │                                     │
│     ▼           ▼                                     │
│   [NÃO]       [SIM]                                   │
│     │           │                                     │
│     ▼           ▼                                     │
│ [/questionario] [/dashboard]                          │
│     │               │                                 │
│     └───────┬───────┘                                 │
│             ▼                                         │
│       [/chatbot]                                      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 16. Requisitos de UX/UI

### 16.1 Design System

| Elemento | Especificação |
|----------|---------------|
| Cor primária | `#0066CC` (azul Nuvary) |
| Cor secundária | `#1E3A5F` (azul escuro) |
| Cor de sucesso | `#10B981` (verde) |
| Cor de erro | `#EF4444` (vermelho) |
| Cor de fundo | `#F9FAFB` (cinza claro) |
| Fonte | Inter ou system-ui |

### 16.2 Componentes

- Inputs com ícones (usuário, email, cadeado)
- Loading spinner nos botões durante requisições
- Feedback visual de validação (borda verde/vermelha)
- Toast notifications para sucesso/erro
- Mobile-first (responsivo)

---

## 17. Checklist de Implementação

### Supabase Dashboard:
- [ ] Criar projeto no Supabase ✅ (já feito)
- [ ] Executar SQL da tabela `profiles`
- [ ] Executar SQL da tabela `perfil_investidor`
- [ ] Executar SQL da tabela `chat_historico`
- [ ] Executar SQL do trigger `handle_new_user`
- [ ] Verificar se RLS está habilitado em todas as tabelas

### Frontend React:
- [ ] Instalar `@supabase/supabase-js`
- [ ] Criar arquivo `.env` com credenciais
- [ ] Criar `src/utils/supabase.ts`
- [ ] Criar `src/contexts/AuthContext.tsx`
- [ ] Criar `src/components/ProtectedRoute.tsx`
- [ ] Criar `src/services/authService.ts`
- [ ] Criar `src/services/perfilService.ts`
- [ ] Criar `src/services/chatService.ts`
- [ ] Criar `src/utils/validators.ts`
- [ ] Criar página `/cadastro`
- [ ] Criar página `/login`
- [ ] Criar página `/recuperar-senha`
- [ ] Criar página `/redefinir-senha`
- [ ] Adaptar página `/questionario` para salvar no Supabase
- [ ] Adaptar página `/chatbot` para salvar histórico
- [ ] Criar página `/dashboard`
- [ ] Configurar rotas no `App.tsx`
- [ ] Testar fluxo completo

---

## 18. Critérios de Aceite

1. ✅ Usuário consegue criar conta com dados válidos
2. ✅ Validação em tempo real exibe erros nos campos
3. ✅ Usuário consegue fazer login com credenciais corretas
4. ✅ Rotas protegidas redirecionam para login se não autenticado
5. ✅ Sessão persiste ao recarregar a página
6. ✅ Usuário consegue solicitar recuperação de senha
7. ✅ Usuário consegue redefinir senha via link
8. ✅ Profile é criado automaticamente no cadastro (trigger)
9. ✅ Respostas do questionário são salvas vinculadas ao usuário
10. ✅ Histórico do chatbot é salvo e recuperado por usuário
11. ✅ RLS garante que usuário só acessa seus próprios dados
12. ✅ Logout limpa sessão e redireciona para login

---

## 19. Observações LGPD

- Consentimento explícito via checkbox obrigatório
- Data/hora do aceite armazenados em `data_aceite_termos`
- Senhas com hash (gerenciado pelo Supabase Auth)
- RLS garante isolamento de dados entre usuários
- ON DELETE CASCADE permite exclusão completa da conta
- Adicionar futuramente: página "Minha Conta" para exclusão
