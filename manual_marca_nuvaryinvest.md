# Brandbook Técnico — Nuvary Invest

Este documento consolida **todas as informações técnicas necessárias** para que um desenvolvedor (front-end, back-end ou full stack) implemente corretamente a identidade visual da **Nuvary Invest** em aplicações web, dashboards e materiais digitais.

---

## 1. Identidade da Marca

**Nome:** Nuvary Invest  
**Segmento:** Fintech / Investimentos / Educação Financeira / Inteligência Artificial

### Posicionamento
Plataforma de consultoria de investimentos orientada por Inteligência Artificial, com foco em automação de carteiras, monitoramento contínuo e trilhas de educação financeira, priorizando clareza, segurança e acessibilidade.

---

## 2. Logotipo

### Conceito do Símbolo
- **Nuvem:** computação em nuvem, dados e escalabilidade
- **Barras verticais:** crescimento financeiro, alocação e acompanhamento de carteira
- **Estilo:** minimalista, flat, adequado para interfaces digitais

### Composição
- Ícone (nuvem + barras) + texto "Nuvary Invest"
- Espaçamento mínimo ao redor do logo: equivalente à largura da letra **N** de "Nuvary"

### Restrições
❌ Não rotacionar  
❌ Não distorcer proporção  
❌ Não aplicar sombras, bevel ou glow  
❌ Não alterar cores ou tipografia

---

## 3. Tipografia Oficial

### Fonte Principal
```css
font-family: 'Inter', sans-serif;
```

### Pesos Utilizados
| Elemento | Peso |
|--------|------|
| Logo – Nuvary | 700 (Bold) |
| Logo – Invest | 500 (Medium) |
| Títulos | 600–700 |
| Texto padrão | 400 |
| Texto secundário | 400 |

### Hierarquia Recomendada
```css
h1, h2 { font-weight: 700; }
h3, h4 { font-weight: 600; }
p, span { font-weight: 400; }
```

---

## 4. Paleta de Cores

### Cores Primárias

#### Azul Marinho — Texto principal
```css
#0B1F33
```
RGB: 11, 31, 51

Uso: logotipo (Nuvary), títulos, navbar

---

#### Ciano Tecnológico — Destaques
```css
#00B8D9
```
RGB: 0, 184, 217

Uso: ícone, barras do gráfico, botões primários, palavra "Invest"

---

### Gradiente (Opcional no Ícone)
```css
background: linear-gradient(180deg, #00B8D9 0%, #007EA7 100%);
```

---

### Cores Neutras de Apoio
```css
#FFFFFF  /* fundo claro */
#081A24  /* fundo escuro */
#6B7280  /* texto secundário */
#E5E7EB  /* divisores */
```

---

## 5. Tema Claro (Light Mode)

```css
--bg-primary: #FFFFFF;
--text-primary: #0B1F33;
--text-secondary: #6B7280;
--accent: #00B8D9;
```

### Uso
- Site institucional
- Landing pages
- Relatórios
- Páginas públicas

---

## 6. Tema Escuro (Dark Mode)

```css
--bg-primary: #081A24;
--text-primary: #FFFFFF;
--text-secondary: #9CA3AF;
--accent: #00B8D9;
```

### Uso
- Dashboard do sistema
- Área logada
- Interfaces analíticas

---

## 7. Componentes UI — Padrões

### Botão Primário
```css
background-color: #00B8D9;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 20px;
font-weight: 600;
```

### Botão Secundário
```css
background-color: transparent;
color: #00B8D9;
border: 1px solid #00B8D9;
border-radius: 8px;
```

---

## 8. Ícones e Gráficos

### Gráficos
- Positivo: `#00B8D9`
- Neutro: `#6B7280`
- Atenção: `#F59E0B`
- Erro/Risco: `#EF4444`

---

## 9. Uso em Aplicações

### Web
- Layout responsivo
- Preferência por cards
- Espaçamento generoso

### Dashboard
- Fundo escuro
- Destaques em ciano
- Gráficos simples e explicativos

---

## 10. Checklist para Desenvolvedores

- [ ] Fonte Inter carregada (Google Fonts)
- [ ] Variáveis CSS configuradas
- [ ] Light e Dark Mode implementados
- [ ] Logo utilizado sem distorção
- [ ] Botões e gráficos seguindo paleta

---

## 11. Resumo Técnico Rápido

```txt
Fonte: Inter
Cor principal: #0B1F33
Cor destaque: #00B8D9
Fundo claro: #FFFFFF
Fundo escuro: #081A24
```

---

**Documento oficial de identidade técnica — Nuvary Inve