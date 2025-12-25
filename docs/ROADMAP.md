# Roadmap Estratégico - Portal do Eletricista

Este documento oferece a visão executiva e estratégica dos marcos do projeto.

---

## 🧭 Linha do Tempo Macro (High-Level Timeline)

| Fase | Período (Estimado) | Foco Principal | Status |
| :--- | :--- | :--- | :--- |
| **Q4 2025** | Dezembro | **Fundação & MVP** (Core Business) | 🟡 Em Progresso |
| **Q1 2026** | Janeiro - Fevereiro | **Estabilização & Expansão** (Apps & Dashboards) | ⚪️ Planejado |
| **Q2 2026** | Março - Abril | **Escala & Fidelização** (Programa de Pontos) | ⚪️ Planejado |

---

## 📍 Detalhamento dos Marcos (Milestones)

### 🏁 Marco 1: MVP (Lançamento Piloto)
> **Objetivo:** Permitir que um eletricista parceiro faça uma venda completa (Do orçamento ao Pix).

*   [x] Definição de Arquitetura e Tech Stack.
*   [x] **API Core:**
    *   [x] Auth (Login/Cadastro).
    *   [x] Sync básico de Produtos (Sankhya -> Portal).
    *   [x] Orçamentos (CRUD).
*   [x] **Frontend Web:**
    *   [x] Catálogo de Produtos.
    *   [x] Carrinho/Orçamentador.
    *   [ ] Checkout com Split de Pagamento.
    *   [ ] **Polimento (Feedback):**
        *   [ ] Fix: Compartilhamento de Link (Clipboard).
        *   [ ] UX: Botão Voltar em Detalhes.
        *   [ ] UX: Fluxo de Novo Orçamento.
        *   [ ] UI: Tamanho de categorias mobile.
*   [ ] **Integração:**
    *   [ ] Escrita de Pedido no Sankhya (via Fila).

### 🚀 Marco 2: Gestão & Retenção
> **Objetivo:** Dar ferramentas para o eletricista gerir seu negócio e aumentar recorrência.

*   [ ] **Dashboard Financeiro:** "Quanto ganhei esse mês?".
*   [ ] **PDF Profissional:** Gerador de propostas em PDF com logo personalizada.
*   [ ] **Notificações:** WhatsApp Gateway (Status de entrega).
*   [ ] **Painel Admin:** Gestão de usuários e aprovações manuais.

### 💎 Marco 3: Escala & Fidelidade
> **Objetivo:** Transformar o parceiro em um advogado da marca.

*   [ ] **Clube de Vantagens:** Gamificação (Pontos por Venda).
*   [ ] **App Nativo:** Avaliar necessidade de iOS/Android nativo.
*   [ ] **Marketplace de Serviços:** Conectar cliente final direto ao eletricista (Uberização).

---

## ⚠️ Riscos e Dependências

1.  **Acesso API Sankhya:** Bloqueador crítico para o sync de produtos.
2.  **Aprovação Gateway Pagamento:** Burocracia para criar conta PJ e habilitar Split pode demorar.
3.  **Adoção:** Necessário plano de treinamento para os primeiros eletricistas.
