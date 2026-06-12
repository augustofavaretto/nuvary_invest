# Tarefa de Refatoração e Limpeza do Projeto Nuvary Invest

**Repositório:**  
https://github.com/augustofavaretto/nuvary_invest.git

## Objetivo

Realizar uma revisão completa do projeto, removendo arquivos desnecessários, padronizando comentários e preparando o repositório para entrega acadêmica (TCC) e futura apresentação profissional.

---

# 1. Revisão Geral do Frontend

- Revisar todos os componentes, páginas, hooks, contextos, serviços e utilitários.
- Remover código morto, imports não utilizados e arquivos não referenciados.
- Padronizar comentários.
- Todos os comentários devem possuir no máximo 1 linha.
- Remover comentários redundantes.
- Revisar tipagens TypeScript.
- Corrigir warnings e erros de lint quando possível.
- Não alterar regras de negócio.

---

# 2. Revisão Geral do Backend

- Revisar controllers, services, repositories, middlewares e utilitários.
- Remover código morto.
- Remover logs de desenvolvimento desnecessários.
- Padronizar comentários.
- Todos os comentários devem possuir no máximo 1 linha.
- Corrigir problemas de tipagem e lint.
- Não alterar regras de negócio.

---

# 3. Revisão das APIs

- Revisar rotas.
- Revisar validações.
- Revisar tratamento de erros.
- Revisar respostas HTTP.
- Remover endpoints não utilizados.
- Garantir consistência entre frontend e backend.

---

# 4. Remoção de Arquivos e Pastas

## Documentação

- docs/
- roadmap/
- arquivos de roadmap

## SQL

- sql/
- supabase_setup.sql
- scripts SQL legados não utilizados

## Branding

- manual de marca
- brandbook

---

# 5. Remover Referências ao Claude

Remover:

- Claude
- Claude Code
- Anthropic
- Comentários ou créditos relacionados
- Arquivos de configuração do Claude

---

# 6. Atualização do README

Reescrever completamente o README conforme o estado atual do projeto.

Deve conter:

- Visão Geral
- Funcionalidades
- Tecnologias Utilizadas
- Estrutura do Projeto
- Instalação
- Deploy
- Equipe
- Licença

---

# 7. Limpeza Geral

- Remover dependências não utilizadas.
- Remover imports não utilizados.
- Remover código comentado.
- Revisar estrutura de diretórios.
- Revisar scripts de build.

---

# 8. Relatório Final

Gerar:

- Arquivos removidos.
- Arquivos modificados.
- Problemas corrigidos.
- Melhorias aplicadas.
- Melhorias futuras.
- Status de build, lint e testes.

---

# Restrições

- Não criar funcionalidades novas.
- Não alterar regras de negócio.
- Preservar o funcionamento atual da aplicação.
- Priorizar limpeza, organização e manutenção.
