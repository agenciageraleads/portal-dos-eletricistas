# Plano de Ação: UI/UX & Mobile Excellence Refactor

## 🎯 Escopo do Projeto

Transformar o Portal dos Eletricistas em uma aplicação Web Premium, corrigindo falhas de UX, acessibilidade e performance detectadas pela auditoria `/audit-ui`, adotando uma nova identidade visual baseada em Teal/Cyan e garantindo uma experiência mobile nativa (PWA).

---

## 🏗️ Fase 1: Identidade Visual & Tipografia (Global)

**Agente: `frontend-specialist`**

- [ ] **Substituição do "Purple Ban"**:
  - Realizar busca global por classes Tailwind e hex codes roxos.
  - Substituir por uma paleta HSL balanceada: Domínio `Teal/Cyan` com acentos `Emerald`.
  - Componentes Críticos: `CreateServiceModal.tsx`, `InstallPrompt.tsx`.
- [ ] **Configuração de Tipografia Fluida**:
  - Padronizar o uso de `clamp(min, preferred, max)` para `font-size` em todo o projeto.
  - Garantir que `line-height` siga as proporções (1.1-1.3 para títulos, 1.4-1.6 para corpo).
  - Implementar `tracking-tight` em textos grandes (>32px).

## 📱 Fase 2: Experiência Mobile & Carga Cognitiva

**Agente: `mobile-developer`**

- [ ] **Refatoração do Modal de Serviço (Wizard Flow)**:
  - Converter o `CreateServiceModal.tsx` de um scroll vertical longo para um **Wizard de 3 Etapas**:
    - Passo 1: Informações Básicas (O que você precisa?)
    - Passo 2: Detalhes & Localização.
    - Passo 3: Fotos & Publicação.
  - Adicionar barra de progresso no topo do modal.
- [ ] **Feedback Háptico & Interações**:
  - Implementar micro-interações de vibração (`navigator.vibrate`) em ações críticas (sucesso ao publicar, erros de validação).
  - Garantir que todos os alvos de clique (Touch Targets) tenham no mínimo **44x44px**.
- [ ] **Melhoria de Feedback Visual**:
  - Adicionar estados de `loading`, `skeleton screens` e transições de entrada `ease-out`.

## ♿ Fase 3: Acessibilidade & Trust

**Agente: `frontend-specialist`**

- [ ] **Sanitização de Form-Labels**:
  - Adicionar `<label>` ou `aria-label` em todos os inputs órfãos (ex: `BudgetPdf.tsx`, `ProductCard.tsx`).
  - Garantir contraste WCAG AA (4.5:1) em toda a nova paleta Teal/Cyan.
- [ ] **Social Proof & Credibilidade**:
  - Adicionar indicadores de confiança (ícone de cadeado/SSL) nos formulários de orçamento.
  - Formatar contadores de prova social ("+10.000 eletricistas") para o padrão persuasivo sugerido.

---

## 🧪 Verificação Final (Checklist de Reentrega)

1. **Visual**: Executar `/audit-ui` e verificar zero ocorrências de "Purple Detected".
2. **UX**: Validar novo fluxo de 3 etapas no Modal de Serviços.
3. **PWA**: Testar em dispositivo físico Android/iOS o feedback háptico.
4. **Resgate de Performance**: Executar `/seo` para garantir que o Lighthouse não caiu após mudanças.

---

## 🤖 Atribuição de Agentes

- **Orquestrador**: `orchestrator`
- **UI/UX Specialist**: `frontend-specialist`
- **Mobile Experience**: `mobile-developer`
- **QA**: `test-engineer`
