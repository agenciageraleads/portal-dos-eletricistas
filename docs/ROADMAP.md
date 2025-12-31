# Roadmap Estratégico - Portal do Eletricista

Este documento oferece a visão executiva e estratégica dos marcos do projeto.

---

## 🧭 Linha do Tempo Macro (High-Level Timeline)

| Fase | Período | Foco Principal | Status |
| :--- | :--- | :--- | :--- |
| **Q4 2025** | Dezembro 2025 | **Fundação & MVP** (Core Business) | ✅ **LANÇADO** |
| **Q1 2026** | Janeiro - Março 2026 | **Polimento & Expansão** (UX + Integrações) | 🟡 Em Progresso |
| **Q2 2026** | Abril - Junho 2026 | **Escala & Fidelização** (Programa de Pontos) | ⚪️ Planejado |

---

## 📍 Detalhamento dos Marcos (Milestones)

### ✅ Marco 1: MVP (Lançamento Piloto) - **CONCLUÍDO**
> **Objetivo:** Permitir que um eletricista parceiro faça uma venda completa (Do orçamento ao Pix).
> **Status:** 🚀 **EM PRODUÇÃO** (https://app.portaleletricos.com.br)

*   [x] Definição de Arquitetura e Tech Stack.
*   [x] **API Core:**
    *   [x] Auth (Login/Cadastro).
    *   [x] Sync básico de Produtos (Sankhya -> Portal).
    *   [x] Orçamentos (CRUD).
    *   [x] Sistema de Feedback.
*   [x] **Frontend Web:**
    *   [x] Catálogo de Produtos com busca.
    *   [x] Carrinho/Orçamentador.
    *   [x] Compartilhamento de Orçamento (Link público).
    *   [x] Dashboard do Eletricista.
    *   [x] Perfil de Usuário.

### 🟡 Marco 2: Polimento & Expansão (Q1 2026)
> **Objetivo:** Melhorar UX baseado em feedback dos eletricistas e completar integrações críticas.

**🚀 Prioridade Imediata (Semana 1-2):**
*   [ ] **Infra:** Configurar Certificado SSL (HTTPS).
*   [x] **PWA (Progressive Web App):** Transformar em app instalável
    *   [x] Service Worker para cache offline
    *   [x] Manifest.json com ícones
    *   [x] Instalável no mobile (Add to Home Screen)
    *   [ ] Notificações push (preparação)
*   [ ] **Exibição de Estoque em Faixas:** Proteger informações sensíveis
    *   [ ] Implementar badges: 1000+, 100+, 50+, 10+, "Últimas unidades"
    *   [ ] Sistema de cores (verde/amarelo/vermelho)
    *   [ ] Atualizar API e frontend

**🔍 Otimização de Busca (Polimento):**
*   [x] **Smart Ranking:** Priorização de resultados exatos.
*   [x] **Sinônimos:** "Conduite" = "Eletroduto", "S8" = "S08".


**📊 Validação de Mercado (Semana 3-6):**
*   [x] Deploy VPS em produção
*   [ ] Onboarding primeiros 5-10 eletricistas
*   [ ] Coleta de feedback estruturado:
    *   [ ] Produtos duplicados incomodam?
    *   [ ] Preferências de marca
    *   [ ] Pontos de fricção no fluxo
*   [ ] Análise de métricas de uso

**🎯 Features Avançadas (Pós-Validação):**
*   [ ] **Sistema de Agrupamento de Produtos** (Se validado)
    *   [ ] IA para pré-agrupar produtos similares
    *   [ ] Modal de seleção de marca
    *   [ ] Sugestão de alternativas (estoque insuficiente)
    *   [ ] Manter rastreabilidade de SKU para Sankhya

**Prioridade Alta (Feedback dos Usuários):**
*   [ ] **UX: Botão Voltar** em páginas de detalhes.
*   [ ] **UX: Fluxo de Novo Orçamento** mais intuitivo.
*   [ ] **UI: Tamanho de categorias mobile** (melhor visualização).
*   [ ] **Fix: Compartilhamento de Link** (Clipboard API).
*   [x] **UX: Botão Limpar na Busca.**
*   [x] **UX: Input de Quantidade Editável.**
*   [x] **UI: Visibilidade do ícone Admin.**

**Integrações & Backend:**
*   [ ] **Checkout com Split de Pagamento** (Gateway).
*   [ ] **Escrita de Pedido no Sankhya** (via Fila).
*   [ ] **Busca Fuzzy:** Tolerância a erros de digitação.

**Gestão:**
*   [ ] **Dashboard Financeiro:** "Quanto ganhei esse mês?".
*   [ ] **Painel Admin:** Gestão de usuários e aprovações.

### 💎 Marco 3: Escala & Fidelidade (Q2 2026)
> **Objetivo:** Transformar o parceiro em um advogado da marca.

*   [ ] **PDF Profissional:** Gerador de propostas com logo personalizada.
*   [ ] **Notificações WhatsApp:** Status de entrega.
*   [ ] **Clube de Vantagens:** Gamificação (Pontos por Venda).
*   [ ] **App Nativo:** Avaliar necessidade de iOS/Android.
*   [ ] **Marketplace de Serviços:** Conectar cliente final direto ao eletricista.

---

## ⚠️ Riscos e Dependências

1.  ~~**Acesso API Sankhya:**~~ ✅ **RESOLVIDO** - Sync de produtos funcionando.
2.  **Aprovação Gateway Pagamento:** Burocracia para criar conta PJ e habilitar Split pode demorar.
3.  **Adoção:** Necessário plano de treinamento para os primeiros eletricistas.
4.  **Performance:** Monitorar carga do servidor com aumento de usuários.
