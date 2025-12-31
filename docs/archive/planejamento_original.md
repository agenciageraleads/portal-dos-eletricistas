# Planejamento Técnico e Arquitetura - Portal do Eletricista

Este documento detalha a estratégia técnica para o desenvolvimento do **Portal do Eletricista**, focando em segurança, escalabilidade e integração robusta com o ERP Sankhya.

---

## 1. Fases do Projeto

Para mitigar riscos e entregar valor rápido, adotaremos uma estratégia incremental.

### 🏁 Fase 1: MVP (Minimum Viable Product)
**Foco:** Habilitar a venda e o comissionamento (Core Business).
*   **Catálogo de Produtos:** Consulta de produtos sincronizados do Sankhya (Preço, Foto, Descrição).
*   **Gestão de Estoque (Visualização):** Flag de disponibilidade (Sim/Não) sem expor quantidades exatas.
*   **Orçamentador:** Carrinho de compras com inserção de Mão de Obra (Split).
*   **Checkout & Pagamento:** Integração com Gateway (Pix/Cartão) + Split de Pagamento.
*   **Área do Eletricista:** Cadastro, Login, Histórico de Pedidos básico.
*   **Integração Sankhya (Unidirecional + Pedido):**
    *   Leitura de Produtos/Preços (Sync).
    *   Escrita de Pedidos (Venda).

### 🚀 Fase 2: Expansão & Gestão
**Foco:** Ferramentas de retencão e gestão para o eletricista e admin.
*   **Dashboard Avançado:** Gráficos de vendas, comissões futuras.
*   **Geração de Propostas em PDF:** PDF profissional com logo do eletricista/Portal.
*   **Área Admin Portal:** Aprovação de cadastros, gestão de regras de split dinâmicas.
*   **Notificações:** WhatsApp/Email automáticos sobre status do pedido.

### 🔮 Fase 3: Evoluções Futuras
*   **App Nativo (Mobile):** Quando a base de usuários justificar o custo de manutenção de lojas (Apple/Google).
*   **Programa de Fidelidade:** Gamificação baseada em volume de vendas.

---

## 2. Arquitetura da Solução

Utilizaremos uma arquitetura baseada em microsserviços leves ou modular monolith, separando claramente o Frontend, Backend e o ERP.

### Visão Geral
```mermaid
graph TD
    User[Eletricista / Cliente] -->|HTTPS| CDN[Cloudfront / CDN]
    CDN -->|Acesso Web/PWA| Front[Frontend - Next.js]
    
    subgraph "Camada de Aplicação (AWS/Vercel)"
        Front -->|API REST/GraphQL| API[Backend API - NestJS]
        API -->|Cache| Redis[Redis Cache]
        API -->|Dados App| DB[(PostgreSQL)]
        API -->|Pagamentos| Gateway[Gateway Pagamento (Pagar.me/Asaas)]
    end
    
    subgraph "Camada de Integração (Segurança)"
        API -->|Fila de Pedidos| Queue[SQS / RabbitMQ]
        Worker[Worker Service] -->|Lê Fila| Queue
        Worker -->|Sync Produtos| Sync[Sync Service]
    end
    
    subgraph "Ambiente Corporativo (On-Premise / Cloud ERP)"
        Sync -->|JDBC/API| Sankhya[ERP Sankhya]
        Worker -->|API Venda| Sankhya
    end
```

### Componentes

#### 1. Frontend (App ou Web?)
*   **Decisão:** **Web App (PWA) responsivo** desenvolvido em **Next.js (React)**.
*   **Por que?** Menor custo inicial que app nativo, atualizações instantâneas, indexável (SEO) e funciona perfeitamente no celular como um app.
*   **Hospedagem:** Vercel ou AWS Amplify.

#### 2. Backend (API & Lógica)
*   **Tecnologia:** **Node.js com framework NestJS**.
*   **Por que?** Fortemente tipado (TypeScript), arquitetura modular, excelente para lidar com I/O assíncrono (integrações).
*   **Responsabilidades:** Autenticação, Regras de Negócio do Portal, Orquestração de Pagamentos.

#### 3. Banco de Dados do Portal
*   **Tecnologia:** **PostgreSQL**.
*   **Estratégia:** O Portal **NÃO** consulta o Sankhya em tempo real para listar produtos (isso derrubaria o ERP).
*   **Replicação:** Teremos uma cópia leve dos dados de produtos (ID, Nome, Preço, UrlFoto) no PostgreSQL do Portal, atualizada a cada X minutos ou via Webhooks.

---

## 3. Integração com Sankhya (Ponto Crítico)

A regra de ouro é: **Proteger o ERP de acessos diretos da web pública.**

### Estratégia de "Eclusa" (Airlock)
1.  **Leitura (Produtos/Preços):**
    *   Um serviço de fundo (`Sync Service`) roda a cada 10-30 minutos (ou gatilho real-time se o Sankhya permitir).
    *   Ele consulta o Sankhya e atualiza o PostgreSQL do Portal.
    *   **Vantagem:** O site carrega em milissegundos (banco local) e o Sankhya não sofre com picos de acesso.
2.  **Escrita (Pedidos):**
    *   Quando o pedido fecha, a API **não** grava direto no Sankhya.
    *   A API joga o pedido em uma **Fila (AWS SQS ou RabbitMQ)**.
    *   Um `Worker` consome essa fila um a um e insere no Sankhya.
    *   **Vantagem:** Se o Sankhya cair, a venda não é perdida. O pedido fica na fila e é processado quando o ERP voltar.

### Permissões
*   Criar um usuário de integração específico no Sankhya com acesso restrito apenas às tabelas/views necessárias (ex: `TGFPRO`, `TGFTAB`). Leitura apenas (`SELECT`) para produtos, Escrita via Stored Procedure ou API oficial para pedidos.

---

## 4. Plano de Segurança

### Autenticação & Autorização
*   **Identity Provider:** Utilizar **Auth0**, **AWS Cognito** ou **Firebase Auth**.
    *   Evita "criar login do zero" e já traz segurança contra brute-force.
*   **JWT (JSON Web Tokens):** Sessões stateless seguras.
*   **ACL (Access Control List):**
    *   `ROLE_ELETRICISTA`: Cria orçamentos, vê preços.
    *   `ROLE_ADMIN`: Vê todos, aprova usuários.

### Proteção de Dados
*   **Em trânsito:** TLS 1.3 (HTTPS) obrigatório.
*   **Em repouso:** Banco de dados criptografado (AES-256).
*   **Sankhya:** O servidor do Sankhya NÃO deve ter IP público exposto para a API do Portal. A conexão deve ser feita via **VPN Site-to-Site** ou a API do Portal deve ter seu IP na Whitelist do Firewall do Sankhya.

### Proteção contra Ataques
*   **Rate Limiting:** Limitar requisições por IP (ex: máx 100 req/min) para evitar DDoS e scrapers de preço.
*   **WAF (Web Application Firewall):** Bloqueio de SQL Injection e XSS.

---

## 5. Fluxo de Pagamento e Split

Utilizaremos um Gateway com funcionalidade nativa de Split (ex: **Pagar.me**, **Iugu** ou **Asaas**).

### Fluxo Detalhado:
1.  **Checkout:** Cliente escolhe pagar R$ 1.000,00 (R$ 800 Material + R$ 200 Mão de Obra).
2.  **Transação:** O Portal envia para o Gateway uma transação de R$ 1.000,00 com regra de split configurada no payload API.
    *   `Recipient A (Portal)`: R$ 800,00
    *   `Recipient B (Eletricista)`: R$ 200,00
3.  **Processamento:** Gateway cobra o cartão do cliente *uma única vez* (na fatura aparece "Portal do Eletricista" ou similar).
4.  **Liquidação:** O Gateway separa o dinheiro internamente.
5.  **Conciliação:**
    *   Gateway envia Webhook `transaction.paid` para o Portal.
    *   Portal recebe, marca pedido como PAGO.
    *   Worker envia pedido para o Sankhya já com a flag de financeiro resolvido (ou título a receber baixado, dependendo da regra contábil).

### Tratamento de Exceções
*   **Estorno (Chargeback):** Definir nos Termos de Uso quem arca. Geralmente o Gateway estorna ambos. O Portal deve cancelar o pedido no Sankhya e notificar o eletricista.

---

## 6. Passo a Passo Pré-Código (Próximos Steps)

Antes de escrever `import React`, precisamos:

1.  **Validar Credenciais Sankhya:** O time de TI precisa fornecer acesso (Usuário/Senha/API) a um ambiente de homologação do Sankhya.
2.  **Escolher Gateway:** Definir qual empresa de pagamentos será usada (taxas de split variam).
3.  **Protótipo de UI (Figma):** Desenhar as telas principais (Catálogo, Carrinho, Dashboard) para validar a experiência do usuário.

## 7. Modelo de Dados (Alto Nível)

*   `Users`: (id, nome, role, sankhya_parceiro_id, dados_bancarios)
*   `Products`: (id, sku_sankhya, nome, preco_venda, imagem_url, disponivel_flag)
*   `Budgets` (Orçamentos): (id, user_id, cliente_nome, status, validade, total_material, total_mao_obra)
*   `BudgetItems`: (id, budget_id, product_id, qtd, preco_unitario)
*   `Orders`: (id, budget_id, gateway_transaction_id, status_sankhya, data_pagamento)

---

### Riscos Mapeados
1.  **Performance Sankhya:** Consultas diretas deixarem o ERP lento. -> **Mitigação:** Uso de Banco Intermediário + Sync Assíncrono.
2.  **Split Payment:** Complexidade fiscal (quem emite nota de quê?). -> **Mitigação:** Portal emite NFe do Material. Eletricista é responsável pela NFe (ou RPA) do serviço (o sistema apenas repassa o dinheiro). Consultar contador.
3.  **Adoção:** Eletricistas acharem difícil usar. -> **Mitigação:** Foco total em UX simplificada no Mobile (botões grandes, poucas telas).
