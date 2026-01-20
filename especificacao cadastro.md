# Especificação Técnica - Sistema de Autenticação Nuvary Invest

## Contexto do Projeto

- **Projeto:** Nuvary Invest - Consultoria de investimentos com IA
- **Stack Backend:** Node.js (APIs já existentes: AlphaVantage, Finnhub, News API, OpenAI)
- **Stack Frontend:** React com Tailwind CSS
- **Funcionalidades já implementadas:** Questionário de Perfil do Investidor e Chatbot de Investimentos
- **Necessidade:** Sistema de cadastro e autenticação para persistir dados do usuário

---

## Objetivo

Desenvolver o sistema completo de autenticação (cadastro, login, recuperação de senha) para vincular o perfil do investidor e histórico do chatbot ao usuário cadastrado.

---

## Tela de Cadastro

### Campos obrigatórios:
- Nome completo (string, mínimo 3 caracteres)
- Email (string, formato válido, único no sistema)
- Senha (string, mínimo 8 caracteres, pelo menos 1 letra e 1 número)
- Confirmar senha (deve ser igual ao campo senha)
- Checkbox de aceite dos Termos de Uso e Política de Privacidade (obrigatório marcar)

### Comportamento:
- Validação em tempo real dos campos
- Botão "Criar conta" desabilitado até todos os campos válidos
- Após cadastro bem-sucedido, redirecionar para o Questionário de Perfil
- Exibir mensagens de erro claras (email já cadastrado, senha fraca, etc.)
- Link para tela de Login ("Já tem conta? Entrar")

---

## Tela de Login

### Campos:
- Email (string, formato válido)
- Senha (string)

### Comportamento:
- Validação de credenciais
- Mensagem de erro genérica para segurança ("Email ou senha incorretos")
- Após login bem-sucedido, redirecionar para Dashboard ou Chatbot
- Link para tela de Cadastro ("Não tem conta? Criar conta")
- Link para recuperação de senha ("Esqueci minha senha")

---

## Tela de Recuperação de Senha

### Etapa 1 - Solicitar recuperação:
- Campo: Email
- Comportamento: Enviar email com link/código de recuperação
- Mensagem: "Se o email existir, você receberá instruções"

### Etapa 2 - Redefinir senha:
- Campo: Nova senha
- Campo: Confirmar nova senha
- Comportamento: Validar token/código, atualizar senha, redirecionar para Login

---

## Estrutura do Banco de Dados

### Tabela: users

| Campo | Tipo | Restrições |
|-------|------|------------|
| id | UUID | Primary Key, auto-generated |
| nome | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| senha | VARCHAR(255) | NOT NULL (hash bcrypt) |
| aceite_termos | BOOLEAN | NOT NULL, DEFAULT false |
| data_aceite_termos | TIMESTAMP | |
| email_verificado | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### Tabela: password_reset_tokens

| Campo | Tipo | Restrições |
|-------|------|------------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key → users.id |
| token | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| used | BOOLEAN | DEFAULT false |

---

## Autenticação JWT

### Configuração:
- Algoritmo: HS256
- Expiração access token: 1 hora
- Expiração refresh token: 7 dias
- Payload: { userId, email, nome }

### Endpoints:

```
POST /api/auth/register
Body: { nome, email, senha, confirmarSenha, aceiteTermos }
Response: { success, message, user }

POST /api/auth/login
Body: { email, senha }
Response: { success, accessToken, refreshToken, user }

POST /api/auth/logout
Header: Authorization: Bearer {token}
Response: { success, message }

POST /api/auth/refresh-token
Body: { refreshToken }
Response: { accessToken }

POST /api/auth/forgot-password
Body: { email }
Response: { success, message }

POST /api/auth/reset-password
Body: { token, novaSenha, confirmarSenha }
Response: { success, message }
```

---

## Validações de Segurança

### Senha:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Hash com bcrypt (salt rounds: 10)

### Proteções:
- Rate limiting nas rotas de auth (máximo 5 tentativas por minuto)
- Sanitização de inputs contra SQL Injection
- Headers de segurança (helmet)
- CORS configurado para domínios permitidos
- Tokens de recuperação expiram em 1 hora

---

## Integração com Funcionalidades Existentes

### Questionário de Perfil:
- Após cadastro, redirecionar para questionário
- Salvar respostas vinculadas ao user_id
- Se usuário já respondeu, carregar perfil salvo

### Chatbot:
- Carregar perfil do usuário no contexto da conversa
- Salvar histórico de conversas vinculado ao user_id
- Personalizar respostas baseado no perfil

---

## Componentes React Necessários

```
src/
├── pages/
│   ├── Cadastro.jsx
│   ├── Login.jsx
│   └── RecuperarSenha.jsx
├── components/
│   └── auth/
│       ├── FormCadastro.jsx
│       ├── FormLogin.jsx
│       ├── FormRecuperarSenha.jsx
│       └── InputSenha.jsx (com toggle mostrar/ocultar)
├── contexts/
│   └── AuthContext.jsx (estado global de autenticação)
├── hooks/
│   └── useAuth.js (login, logout, register, isAuthenticated)
├── services/
│   └── authService.js (chamadas à API)
└── utils/
    └── validators.js (validação de email, senha, etc.)
```

---

## Fluxo de Navegação

```
[Página Inicial]
      │
      ├── [Não autenticado] → [Login] ←→ [Cadastro]
      │                          │
      │                          ↓
      │                    [Esqueci Senha]
      │
      └── [Autenticado] → [Questionário] → [Dashboard/Chatbot]
```

---

## Requisitos de UX/UI

- Design responsivo (mobile-first)
- Cores seguindo identidade Nuvary Invest (azul #0066CC, branco, cinza)
- Loading states nos botões durante requisições
- Feedback visual de validação (borda verde/vermelha)
- Ícones nos campos (email, cadeado, usuário)
- Animações suaves de transição
- Mensagens de erro abaixo de cada campo

---

## Critérios de Aceite

1. Usuário consegue criar conta com dados válidos
2. Usuário recebe feedback de erros de validação
3. Usuário consegue fazer login com credenciais corretas
4. Usuário não consegue acessar rotas protegidas sem autenticação
5. Token JWT é armazenado de forma segura (httpOnly cookie ou localStorage)
6. Usuário consegue recuperar senha via email
7. Sessão persiste ao recarregar página (refresh token)
8. Dados do questionário e chatbot são vinculados ao usuário logado

---

## Observações LGPD

- Consentimento explícito obrigatório (checkbox de termos)
- Armazenar data/hora do aceite
- Senha nunca armazenada em texto plano
- Permitir exclusão de conta no futuro (direito ao esquecimento)
- Email de confirmação para novos cadastros (recomendado)
