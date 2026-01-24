# Roadmap Estratégico - Portal do Eletricista

Este documento oferece a visão executiva e estratégica dos marcos do projeto.

---

## 🚀 Status Atual: Fase de Expansão e Diferenciais

O MVP Crítico foi entregue e estabilizado. O foco agora é em ferramentas que geram retenção (Calculadoras, AI, Chat) e melhorias de UX.

---

## ✅ Concluído (Done)

### Infraestrutura & Core

- [x] **Staging Environment:** Ambiente beta estável com Docker/Alpine.
- [x] **Image Persistence:** Integração com MinIO/S3.
- [x] **Simplified Auth:** Login/Registro robusto (CPF/CNPJ).
- [x] **Backend Optimization:** Fix de erros 500 e timeouts.

### Funcionalidades (Features)

- [x] **Busca Inteligente (+ Sinônimos):** Engine otimizado com curadoria de sinônimos via BD.
- [x] **Catálogo "Stories":** Nova UI de filtros por categoria com scroll horizontal.
- [x] **Orçamentos:** Fluxo completo com edição de quantidade, toggle de privacidade e observações.
- [x] **Hub de Ferramentas (Básico):** Calculadora de Bitola e Disjuntores.
- [x] **CRM & Dashboard:** Visão geral de orçamentos e perfil profissional.
- [x] **Chat Sessions:** Histórico de conversas com IA (multi-sessão).

### Admin & Gestão

- [x] **Admin Dashboard:** Painel administrativo (Visão Geral, Usuários, Orçamentos).
- [x] **Failed Search Logging:** Monitoramento de buscas falhas.
- [x] **AI Curator:** Ferramenta de IA para sugerir sinônimos para buscas falhas.
- [x] **AI Budget Lab:** Ambiente de testes para o parser de orçamentos.

---

## 🚧 Em Progresso / Próximo Foco (In Progress / Next)

### Ferramentas & Calculadoras

- [ ] **Calculadora de Fonte para Fita LED:** Dimensionamento de fontes com base na metragem e potência.
- [ ] **Refinamento Ferramentas:** Adicionar opção Trifásico (380v) nas calculadoras existentes.

### Gestão & Admin

- [ ] **Gestão de Produtos (Admin):** Interface para Editar/Desativar produtos diretamente pelo painel.
- [ ] **Reset de Senha (Admin):** Funcionalidade para administradores resetarem senhas de usuários.

### Melhorias de UX/UI

- [ ] **PDF Personalizado:** Melhorar layout e incluir logo da empresa do eletricista.
- [ ] **Onboarding Gamificado:** Finalizar implementação do Tutorial interativo (Componente existe, falta fluxo completo).

---

## 🔮 Backlog & Futuro (Q1-Q2 2026)

### Diferenciais Competitivos

- [ ] **Especialista AI (Alpha):** Assistente GPT integrado ao contexto do catálogo.
- [ ] **Produtos Cruzados (Cross-Sell):** "Quem comprou X também comprou Y".
- [ ] **App Mobile Nativo:** Versão iOS/Android.
- [ ] **Geolocalização:** Encontrar eletricistas próximos (marketplace).

### Expansão Comercial

- [ ] **Desconto por Quantidade:** Tabelas de preço para atacado.
- [ ] **Referral System:** Sistema de indicação com recompensas.

### Integrações (Postponed)

- [ ] **Integração de Orçamento Sankhya (TOP 900):**
  - **Objetivo:** Automatizar criação de orçamentos (Nota) no Sankhya.
  - **Tech Spec:** `CommercialTransactionSP.saveRecord` com Header (TGFCAB, TOP 900) e Itens (TGFITE).
  - **Obs:** Requer campo `sankhya_budget_id` e lógica de Parceiro Padrão.
