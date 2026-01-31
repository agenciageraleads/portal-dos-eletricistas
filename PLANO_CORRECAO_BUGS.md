# Plano de Ação: Correção de Bugs e Melhorias - PortalElétricos

Este documento detalha o plano de ação para corrigir os bugs e implementar as melhorias solicitadas, priorizando do mais crítico para o menos crítico.

## 🎯 Prioridade 1: Críticos (Correção Imediata)

### 1.1. Orçamento não salva/gera link e perde dados

- **Problema**: Ao clicar em "Gerar Link", nada acontece e os dados são perdidos se sair da tela.
- **Diagnóstico**: Provável erro silencioso no frontend (`handleFinish`) ou falha na API que não está sendo tratada (catch block apenas com console.error).
- **Ação**:
  - Verificar tratativa de erro no `orcamento/page.tsx`.
  - Garantir que `setLoading(false)` seja chamado mesmo em erro.
  - Verificar resposta da API `/budgets`.
  - **Correção**: Implementar validação robusta e feedback visual (Toast/Alert) em caso de erro. Persistir estado do orçamento no LocalStorage temporariamente para evitar perda de dados.

### 1.2. Catálogo de Serviços Vazio

- **Problema**: Ao selecionar "Catálogo de Serviços Padrão", a lista aparece vazia.
- **Ação**:
  - Já iniciei o seed (`prisma/seed_services.ts`) para popular o banco.
  - Verificar se o endpoint `/products` está filtrando corretamente por `type: 'SERVICE'`.
  - Frontend: Verificar se `AddServiceModal` está chamando a API corretamente.

### 1.3. Loop de Login (Redirecionamento Indevido)

- **Problema**: Usuário logado é redirecionado para login ao acessar orçamentos ou outras áreas protegidas.
- **Diagnóstico**: Problema com escopo do Cookie. O cookie definido no login pode não estar acessível em `/orcamentos` ou `/feedback`.
- **Ação**: Definir `path: '/'` explicitamente ao setar o cookie de autenticação no `AuthContext`. (Já aplicado preventivamente).
  - Verificar Middleware do Next.js para garantir que não está bloqueando incorretamente.

### 1.4. Upload de Foto de Perfil (iPhone)

- **Problema**: Erro ao upar foto pelo celular.
- **Diagnóstico**: Formato da imagem (HEIC) ou tamanho do arquivo excedendo limite.
- **Ação**:
  - Verificar configurações do `multer` no backend.
  - Adicionar conversão/compressão de imagem no frontend ou backend se necessário.
  - Verificar logs do backend para o erro de upload.

### 1.5. Sincronização dos 279 Eletricistas

- **Problema**: Cadastros não apareceram na aba de serviços.
- **Ação**:
  - Verificar script de sincronização (`sync_standalone.ts` ou similar).
  - Rodar script para importar os usuários faltantes.
  - Garantir que o campo `isAvailableForWork` esteja `true` para eles.

---

## 🚀 Prioridade 2: Bugs Funcionais e Fluxo

### 2.1. Calculadoras não abrem catálogo

- **Problema**: Botões "Buscar cabos/disjuntores" nas calculadoras não funcionam.
- **Ação**:
  - Verificar links nos botões das páginas de calculadoras (`apps/web/app/ferramentas/...`).
  - Corrigir roteamento para passar o termo de busca correto para `/catalogo?q=...`.

### 2.2. Busca de Cabos (10mm vs 10,0mm)

- **Problema**: Busca exata falha com pontuação.
- **Ação**:
  - Melhorar normalização de busca no `products.service.ts`.
  - Remover pontuação ou tratar `,` e `.` como equivalentes na busca.

### 2.3. Navegação: "Apenas Produtos" -> Catálogo

- **Problema**: Fluxo atual vai direto para orçamento vazio.
- **Ação**:
  - Alterar link na tela `orcamento/novo/page.tsx`.
  - Ao clicar em "Apenas Produtos", redirecionar para `/catalogo` com um contexto (query param) indicando que é seleção para orçamento.

### 2.4. Ícone de Disponibilidade (Verde)

- **Problema**: Ícone não fica verde mesmo com cadastro completo.
- **Ação**:
  - Revisar lógica que define `isAvailableForWork` no backend.
  - Verificar se o frontend atualiza o estado do usuário após edição do perfil.

### 2.5. Histórico de Feedbacks (Privacidade)

- **Problema**: Usuário vê feedbacks de todos.
- **Ação**:
  - Filtrar `Get /feedback` no backend para retornar apenas items do `req.user.id`, a menos que seja ADMIN.

### 2.6. Produtos com Preço Zerado no Catálogo

- **Problema**: Itens aparecendo com preço R$ 0,00.
- **Ação**:
  - Filtrar no backend (`findAll`) para `price > 0`.

---

## 🎨 Prioridade 3: UX, Visual e "Renaming"

### 3.1. Rebranding: "PortalElétricos"

- **Ação**:
  - Find & Replace global de "PortalEletricista" para "PortalElétricos".
  - Atualizar títulos de páginas, metadados e textos de UI.

### 3.2. Foto do Eletricista no Header

- **Problema**: Aparece apenas ícone genérico.
- **Ação**:
  - Atualizar componente `UserMenu` para usar `user.logo_url` se disponível.

### 3.3. Atalhos de Preenchimento (Orçamento)

- **Melhoria**: Opções rápidas para Prazo, Pagamento, etc.
- **Ação**:
  - Adicionar "Chips" ou botões pré-definidos acima dos inputs de texto em `orcamento/page.tsx`.
  - Ex: [7 dias] [15 dias] [30 dias] para Validade.

### 3.4. Melhorias na Busca (UX)

- **Melhoria**: Barra de busca fixa na página de catálogo e botão voltar.
- **Ação**:
  - CSS: `position: sticky` na barra de busca.
  - Lógica de "Voltar": Usar `router.back()` com verificação inteligente para não cair na Home indevidamente.

### 3.5. Seleção de Tipo de Orçamento

- **Melhoria**: Cards muito grandes no mobile.
- **Ação**:
  - Ajustar CSS (padding, tamanho de fonte) para caberem na tela sem rolagem excessiva.

### 3.6. Tela de Avisos Vazia

- **Ação**:
  - Implementar listagem básica de "Novidades" ou mockar dados iniciais para não ficar vazio.
  - Desenvolver também o sistema de notificacoes que envolvem novos servicos postados na regiao e visitas no perfil (ah, o eletricista deve ter um perfil publico também, clicavel na aba de servicos)
---

## 🔧 Prioridade 4: Admin e Baixa Criticidade

### 4.1. Admin: Edição Completa de Usuários

- **Ação**: Habilitar edição de todos os campos no painel admin.

### 4.2. Admin: Botão Suporte em Feedback

- **Ação**: Adicionar botão com link para WhatsApp do suporte.

### 4.3. Admin: Edição de Produtos

- **Ação**: Corrigir formulário de edição de produtos no admin para permitir alterar nome/descrição, não só preço.

### 4.4. Admin: Gestão de Feedbacks

- **Ação**: Adicionar status (Pendente/Resolvido) e filtro.

---

## 📅 Execução

Vou começar atacando os itens da **Prioridade 1** imediatamente.
O primeiro passo será **Rebranding** (item 3.1) pois afeta "todas as páginas" e é melhor fazer antes de mexer pontualmente, para evitar conflitos, e em seguida focar nos bugs críticos de **Orçamento** e **Upload**.
