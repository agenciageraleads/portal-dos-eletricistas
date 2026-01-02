# Roadmap Estratégico - Portal do Eletricista

Este documento oferece a visão executiva e estratégica dos marcos do projeto, atualizado com o **Plano de Ação Urgente** baseado no feedback dos usuários.

---

## 🧭 Linha do Tempo Macro (High-Level Timeline)

| Fase | Período | Foco Principal | Status |
| :--- | :--- | :--- | :--- |
| **Q1 2026** | Janeiro 2026 | **MVP Crítico** (Correções Fundamentais) | 🚨 **URGENTE** |
| **Q1 2026** | Fevereiro 2026 | **Fase 2: Diferenciais** (Calculadoras e Modelos) | ⚪️ Planejado |
| **Q2 2026** | Março 2026 | **Fase 3: Consolidação** (App e Integrações) | ⚪️ Planejado |

---

## 📍 Detalhamento dos Marcos (Milestones)

### 🚨 Marco 1: MVP Crítico (30 Dias) - JANEIRO 2026
> **Objetivo:** Tornar o portal tecnicamente viável e corrigir "Deal Breakers" apontados por eletricistas.
> **Status:** � **EM ANDAMENTO**

**Semana 1: Correções Fundamentais**
*   [x] **Busca Inteligente + Sinônimos:** "Cabo" = "Fio", "S8" = "S08".
*   [x] **Edição de Quantidade no Orçamento:** Ajuste fácil +/- e input manual.
*   [ ] **Especificações Técnicas (MVP):** Exibir dados críticos (Bitola, Amperagem) no catálogo.

**Semana 2: UX Essencial & Privacidade**
*   [x] **Campos de Observação:** Notas, prazo, pagamento no orçamento.
*   [x] **Privacidade Toggle:** Opção de ocultar detalhes de preço (Material vs Mão de Obra).
*   [ ] **Onboarding:** Tutorial rápido para novos usuários.

**Semana 3: Kits de Serviço & Itens Manuais**
*   [ ] **Service Templates / Kits:** Kits baseados em serviços (Visita, Troca de Chuveiro, etc).
*   [ ] **Produto Extra / Manual:** Permitir adicionar itens fora do catálogo (com aviso de faturamento externo).
*   [ ] **Hub de Ferramentas (MVP):** Área para Calculadoras, Tabelas e Normas Técnicas.
*   [ ] **Especialista AI (Alpha):** Assistente GPT para dúvidas técnicas de elétrica.

**Semana 4: Gestão & Polimento**
*   [x] **CRM Básico:** Status dos orçamentos (Enviado, Aprovado) e Meus Orçamentos.
*   [ ] **Dashboard de Métricas:** Taxa de conversão.
*   [ ] **PDF Melhorado:** Layout mais robusto.
*   [x] **Simplified Auth:** Cadastro simplificado (CPF/CNPJ, WhatsApp).
*   [x] **Image Persistence:** Integração com MinIO para fotos estáveis.

### 🟡 Marco 2: Diferenciais (60 Dias) - FEVEREIRO 2026
> **Objetivo:** Implementar ferramentas que "prendem" o usuário e diferenciais competitivos.

*   [ ] **Desconto por Quantidade:** Tabela de preços progressiva.
*   [ ] **Calculadoras Completas:** Disjuntores, Demanda.
*   [ ] **Agrupamento de Produtos:** Melhor visualização de variações (cores, tamanhos).
*   [ ] **PWA Completo:** Instalação e cache offline robusto.

### 💎 Marco 3: Consolidação (90 Dias) - MARÇO 2026
> **Objetivo:** Escala, App Nativo e Integrações com Distribuidores.

*   [ ] **App Mobile Nativo (React Native):** Foco em uso offline na obra.
*   [ ] **Integração com Distribuidores:** Estoque e preço em tempo real.
*   [ ] **Geolocalização:** Encontrar eletricistas próximos.

---

## ⚠️ Riscos e Mitigação

1.  **Confiança nos Preços:**
    *   *Mitigação:* Integrar com grandes distribuidores e permitir edição manual de preços no orçamento.
2.  **Exposição de Margem (Deal Breaker):**
    *   *Mitigação:* Implementar "Privacidade Toggle" urgente na Semana 2.
3.  **Concorrência:**
    *   *Mitigação:* Focar onde eles falham: Comparação multi-fornecedor e ferramentas de cálculo integradas.
