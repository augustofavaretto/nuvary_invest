# Tarefa: Desenvolver Sistema de Autenticação - Nuvary Invest

## Contexto

Projeto React + Vite + TypeScript + Tailwind CSS para consultoria de investimentos com IA.
O Supabase já está configurado com as tabelas e políticas RLS funcionando.
Já existem as páginas `Questionario.tsx` e `Chatbot.tsx` funcionando.

---

## Credenciais Supabase (arquivo .env na raiz)

```env
VITE_SUPABASE_URL=https://qvwlfwuuuozixyqlyhez.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_7wGuJ-RzQOElc60FC4Hjfw_X7PN87Ul
```

---

## Tarefas

### Tarefa 1: Instalar dependências

```bash
npm install @supabase/supabase-js react-router-dom lucide-react
```

---

### Tarefa 2: Criar cliente Supabase

**Arquivo:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

### Tarefa 3: Criar validadores

**Arquivo:** `src/utils/validators.ts`

```typescript
export const validarEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validarSenha = (senha: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
};

export const validarNome = (nome: string): boolean => {
  return nome.trim().length >= 3;
};

export const getErroSenha = (senha: string): string | null => {
  if (!senha) return 'Senha é obrigatória';
  if (senha.length < 8) return 'Mínimo 8 caracteres';
  if (!/[a-z]/.test(senha)) return 'Deve conter letra minúscula';
  if (!/[A-Z]/.test(senha)) return 'Deve conter letra maiúscula';
  if (!/\d/.test(senha)) return 'Deve conter número';
  return null;
};
```

---

### Tarefa 4: Criar AuthContext

**Arquivo:** `src/contexts/AuthContext.tsx`

Implementar contexto com:
- Estados: `user`, `profile`, `loading`
- Função: `logout()`
- Hook exportado: `useAuth()`
- Usar `supabase.auth.getSession()` no mount
- Usar `supabase.auth.onAuthStateChange()` para escutar mudanças
- Buscar dados da tabela `profiles` quando usuário autenticar

---

### Tarefa 5: Criar ProtectedRoute

**Arquivo:** `src/components/ProtectedRoute.tsx`

- Se `loading` → mostrar spinner de carregamento
- Se não autenticado → `<Navigate to="/login" />`
- Se autenticado → renderizar `children`

---

### Tarefa 6: Criar página de Cadastro

**Arquivo:** `src/pages/Cadastro.tsx`

**Campos do formulário:**
- Nome completo (validar mínimo 3 caracteres)
- Email (validar formato)
- Senha (validar: mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número)
- Confirmar senha (validar igual à senha)
- Checkbox: "Li e aceito os Termos de Uso e Política de Privacidade"

**Comportamento:**
- Validação em tempo real com feedback visual (borda verde/vermelha)
- Mostrar mensagem de erro abaixo do campo inválido
- Botão "Criar conta" desabilitado até formulário válido
- Mostrar loading spinner no botão durante requisição
- Chamar `supabase.auth.signUp({ email, password, options: { data: { nome } } })`
- Após sucesso, atualizar tabela `profiles` com `aceite_termos: true` e `data_aceite_termos`
- Redirecionar para `/questionario`
- Exibir erros da API (ex: "Email já cadastrado")
- Link no rodapé: "Já tem conta? Entrar" → navegar para `/login`

**Design:**
- Layout centralizado, responsivo
- Logo Nuvary no topo
- Ícones nos inputs (User, Mail, Lock do lucide-react)
- Cor primária: `#0066CC`

---

### Tarefa 7: Criar página de Login

**Arquivo:** `src/pages/Login.tsx`

**Campos:**
- Email
- Senha

**Comportamento:**
- Chamar `supabase.auth.signInWithPassword({ email, password })`
- Erro genérico: "Email ou senha incorretos"
- Loading no botão durante requisição
- Após login bem-sucedido:
  - Verificar se existe registro em `perfil_investidor` para o `user.id`
  - Se NÃO existe → redirecionar para `/questionario`
  - Se existe → redirecionar para `/chatbot`
- Links: "Criar conta" → `/cadastro` | "Esqueci minha senha" → `/recuperar-senha`

---

### Tarefa 8: Criar página Recuperar Senha

**Arquivo:** `src/pages/RecuperarSenha.tsx`

**Campo:**
- Email

**Comportamento:**
- Chamar `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/redefinir-senha' })`
- Mostrar mensagem: "Se o email existir em nossa base, você receberá as instruções"
- Link: "Voltar para login" → `/login`

---

### Tarefa 9: Criar página Redefinir Senha

**Arquivo:** `src/pages/RedefinirSenha.tsx`

**Campos:**
- Nova senha
- Confirmar nova senha

**Comportamento:**
- Chamar `supabase.auth.updateUser({ password: novaSenha })`
- Após sucesso, mostrar mensagem e redirecionar para `/login`

---

### Tarefa 10: Configurar rotas no App.tsx

**Arquivo:** `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Questionario from './pages/Questionario';
import Chatbot from './pages/Chatbot';

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

## Estrutura Final de Arquivos

```
src/
├── lib/
│   └── supabase.ts
├── contexts/
│   └── AuthContext.tsx
├── components/
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Cadastro.tsx
│   ├── Login.tsx
│   ├── RecuperarSenha.tsx
│   ├── RedefinirSenha.tsx
│   ├── Questionario.tsx (já existe - não modificar)
│   └── Chatbot.tsx (já existe - não modificar)
├── utils/
│   └── validators.ts
└── App.tsx
```

---

## Design System

| Elemento | Valor |
|----------|-------|
| Cor primária | `#0066CC` |
| Cor secundária | `#1E3A5F` |
| Cor erro | `#EF4444` |
| Cor sucesso | `#10B981` |
| Cor fundo | `#F9FAFB` |
| Border radius | `8px` |
| Font | `Inter` ou `system-ui` |

---

## Critérios de Aceite

- [ ] Usuário consegue criar conta com validação em tempo real
- [ ] Usuário consegue fazer login
- [ ] Rotas protegidas redirecionam para login se não autenticado
- [ ] Sessão persiste ao recarregar página
- [ ] Recuperação de senha funciona
- [ ] Redirecionamento pós-login verifica se tem perfil_investidor
- [ ] Layout responsivo e visual consistente
