# Prompt — Auditoria e Atualização da Documentação Nuvary Invest

---

## Contexto

Você tem acesso completo ao repositório do projeto **Nuvary Invest** (React/Next.js frontend + Express backend serverless no Vercel). A documentação do projeto fica em `frontend/public/docs-html/` e é servida em `/docs-html/index.html`. O roadmap principal está em `doc13.html`.

---

## Objetivo

Auditar o código-fonte completo e atualizar toda a documentação HTML (`doc01.html` a `doc25.html` e `index.html`) e o roadmap (`doc13.html`), **excluindo tudo o que não existe ou não é utilizado no código atual**. O resultado deve refletir com precisão o estado real do projeto.

---

## Passo 1 — Inventário do Código Real

Antes de alterar qualquer arquivo de documentação, faça uma varredura completa do repositório e registre internamente:

### 1.1 Frontend (`frontend/src/`)
- Liste todas as **páginas** existentes (`app/` ou `pages/`)
- Liste todos os **componentes** em `components/`
- Liste todos os **services** em `services/` ou `lib/`
- Liste todos os **hooks** customizados
- Liste todos os **contextos** (`context/`)
- Identifique quais bibliotecas externas estão realmente em `package.json` **e** são importadas em pelo menos um arquivo

### 1.2 Backend (`backend/src/` ou `api/`)
- Liste todos os **controllers** e seus endpoints
- Liste todos os **routes** registrados em `app.js` / `index.js`
- Liste todas as **integrações de API externas** com chamadas reais (não apenas variáveis de ambiente declaradas)
- Verifique quais pacotes em `package.json` têm `require`/`import` real no código

### 1.3 Banco de Dados
- Verifique quais tabelas Supabase têm queries reais no código (`supabase.from(...)`)
- Confirme quais tabelas têm políticas RLS configuradas (verifique migrations ou scripts SQL se existirem)

### 1.4 Variáveis de Ambiente
- Liste apenas as `env vars` que têm pelo menos uma referência real no código (`process.env.X` ou `NEXT_PUBLIC_X`)

---

## Passo 2 — Critérios de Exclusão

Remova da documentação qualquer item que se enquadre em **pelo menos uma** das condições abaixo:

| Condição | Exemplo |
|---|---|
| Arquivo/componente foi deletado do repositório | `docs-server/`, pasta `docs/` legada |
| Integração declarada mas sem nenhuma chamada real no código | Alpha Vantage se não houver `fetch` para esse endpoint |
| Dependência listada mas nunca importada | Pacote removido mas ainda documentado |
| Funcionalidade descrita como "Em breve" sem nenhum código iniciado | Modal placeholder vazio |
| Item marcado como `Substituído` na doc e sem referências no código | Sistema de auth JWT legacy |
| Tabela de banco documentada mas sem query referenciando-a | Tabela criada mas abandonada |
| Endpoint de backend documentado mas sem rota registrada | Route comentada ou deletada |

---

## Passo 3 — Critérios de Atualização de Status

Para cada item **mantido** na documentação, atualize o status conforme a realidade:

| Status Atual na Doc | Manter se... | Mudar para... |
|---|---|---|
| `✅ Concluído` | Código existe e funciona | Manter `✅` |
| `⏳ Aguardando aprovação` | Processo externo ainda pendente | Manter `⏳` |
| `🔥 Crítico` | Bug/gap ainda não resolvido no código | Manter `🔥` |
| `⭐ Melhoria Futura` | Feature não iniciada mas desejada | Manter `⭐` |
| `🛠️ Débito Técnico` | Problema identificado mas não corrigido | Manter `🛠️` |
| Qualquer | Código foi **removido** do repositório | **Excluir** o item |

---

## Passo 4 — Atualização dos Arquivos HTML

### 4.1 `doc13.html` — Roadmap Principal

Após o inventário (Passo 1) e aplicar os critérios (Passos 2 e 3):

1. **Seção ✅ Concluído**: manter apenas itens com código confirmado. Remover itens cujos arquivos não existem mais.
2. **Seção 🔥 Críticos**: revisar se os bugs/gaps ainda existem no código atual. Remover os que já foram resolvidos.
3. **Seção ⏳ Pendente**: verificar se algum item pendente já foi implementado. Se sim, mover para ✅ Concluído.
4. **Seção ⭐ Melhorias Futuras**: manter todas (são intenções, não código).
5. **Seção 🛠️ Débito Técnico**: remover itens que foram corrigidos (ex: SQLite já foi removido conforme v3.8.0).
6. **Atualizar o contador do resumo** (`✅ X Concluídos`, `🔥 X Críticos`, `⏳ X Pendentes`, `⭐ X Melhorias`) com os números reais após limpeza.
7. **Atualizar a versão** no cabeçalho para refletir a versão atual real.

### 4.2 `doc01.html` a `doc25.html` — Docs de Versão

Para cada doc individualmente:
- Remover menção a arquivos/componentes que foram **deletados após aquela versão** se a remoção tornar a doc enganosa
- Não alterar o histórico de decisões — apenas remover referências a artefatos que nunca existiram ou foram erroneamente documentados
- Se uma doc inteira descreve uma funcionalidade completamente removida (ex: `doc08.html` — auth legacy `Substituído`), **adicionar um aviso** no topo: `⚠️ Esta versão foi substituída. Ver doc X.Y para a implementação atual.`

### 4.3 `index.html` — Índice

- Remover cards de docs que descrevem exclusivamente funcionalidades deletadas
- Atualizar o número de versão e data de qualquer card que tenha sido atualizado neste processo
- Manter a ordem cronológica

---

## Passo 5 — Verificações Finais

Antes de confirmar as alterações, valide:

- [ ] Nenhum `doc` referencia um arquivo que não existe em `frontend/src/` ou `backend/src/`
- [ ] Nenhum endpoint documentado aponta para uma rota inexistente no Express
- [ ] Os contadores de resumo no `doc13.html` batem com a contagem real dos itens listados
- [ ] As variáveis de ambiente documentadas existem com esse nome exato no código
- [ ] A versão no cabeçalho de cada doc atualizado reflete a versão real do `package.json` ou do commit mais recente

---

## Formato de Resposta Esperado

Ao concluir, apresente:

1. **Resumo da auditoria**: quantos itens foram removidos, quantos atualizados e quais docs foram modificados
2. **Lista de exclusões**: o que foi removido e o motivo (arquivo não encontrado, rota inexistente, etc.)
3. **Lista de correções de status**: itens que mudaram de status (ex: "item X movido de ⏳ para ✅")
4. **Arquivos modificados**: lista de todos os `docXX.html` alterados

Não reescreva o conteúdo narrativo das docs — apenas adicione, remova ou corrija status de itens técnicos com base no código real.
