# Diagramas Visuais - Portal do Eletricista

## 1. Diagrama de Arquitetura de Solução

Este diagrama detalha a infraestrutura, camadas de aplicação e a estratégia de integração segura com o ERP Sankhya.

```mermaid
graph TB
    subgraph "Cliente Final & Eletricista"
        App[Web App / PWA]
        Mobile[Mobile Browser]
    end

    subgraph "Camada de Borda (Edge)"
        CDN[CDN / WAF]
        Auth[Identity Provider (Auth0/Cognito)]
    end

    subgraph "Cloud (Portal do Eletricista)"
        API[API Gateway / Backend NestJS]
        Cache[Redis Cache]
        DB[(PostgreSQL - Réplica Produtos + Dados Portal)]
        Queue[Fila de Pedidos (SQS/RabbitMQ)]
        Worker[Worker Service]
    end

    subgraph "Serviços Externos"
        Gateway[Gateway Pagamento (Pagar.me/Asaas)]
        WhatsApp[API WhatsApp]
    end

    subgraph "Ambiente Seguro (On-Premise/Cloud Privada)"
        Connector[Sync Service / Connector]
        Sankhya[ERP Sankhya]
        Firewall[Firewall Corporativo]
    end

    %% Fluxos
    App -->|HTTPS/TLS| CDN
    CDN -->|Request| API
    App -.->|Login| Auth
    API -.->|Token Validação| Auth

    API -->|Leitura Rápida| Cache
    API -->|Persistência| DB
    API -->|Split Payment| Gateway
    API -->|Notificação| WhatsApp

    %% Integração Sankhya
    API -->|Grava Pedido| Queue
    Worker -->|Lê Pedido| Queue
    Worker -->|Insere Pedido| Connector
    Connector -->|Sync Produtos| DB
    Connector <-->|API/JDBC| Sankhya
    
    %% Segurança
    Firewall -->|Allow Whitelist| Connector
```

## 2. Diagrama de Fluxo do Usuário (Jornada de Venda)

Este fluxo ilustra a jornada do Eletricista desde a criação do orçamento até o recebimento da comissão.

```mermaid
sequenceDiagram
    participant E as Eletricista
    participant P as Portal (App)
    participant C as Cliente Final
    participant G as Gateway pgto
    participant S as Sankhya ERP

    Note over E, P: Fase de Orçamento
    E->>P: Pesquisa Produto (Busca no PostgreSQL)
    P-->>E: Retorna Produto + Disponibilidade
    E->>P: Adiciona ao Carrinho
    E->>P: Define Valor Mão de Obra (Split)
    E->>P: Finaliza Orçamento
    P->>P: Gera Link único do Orçamento
    P-->>E: Link ou PDF para WhatsApp

    Note over E, C: Fase de Venda
    E->>C: Envia Link do Orçamento
    C->>P: Acessa Link
    C->>P: Confere Itens e Valores
    C->>P: Escolhe Pagamento (Pix/Cartão)
    P->>G: Processa Pagamento com Split (Portal / Eletricista)
    G-->>P: Pagamento Aprovado

    Note over P, S: Fase de Processamento
    P->>E: Notifica Venda Realizada
    P->>C: Envia Comprovante
    P->>S: Envia Pedido (via Fila Async)
    S-->>P: Confirmação de Pedido Criado
    
    Note over S: Faturamento
    S->>S: Fatura Pedido (Nota Fiscal Material)
    S->>S: Gera Logística de Entrega
```

## 3. Modelo de Dados (Entidade-Relacionamento Simplificado)

```mermaid
erDiagram
    USER ||--o{ BUDGET : cria
    USER {
        uuid id
        string nome
        string cpf_cnpj
        string role
        json dados_bancarios_split
    }
    
    BUDGET ||--|{ BUDGET_ITEM : contem
    BUDGET ||--|| ORDER : gera
    BUDGET {
        uuid id
        uuid user_id
        string cliente_nome
        decimal total_material
        decimal total_mao_obra
        string status
        datetime validade
    }

    PRODUCT ||--o{ BUDGET_ITEM : incluido_em
    PRODUCT {
        int sankhya_cod_prod
        string nome
        decimal preco_tabela
        boolean disponivel
        string url_foto
    }

    ORDER ||--|| TRANSACTION : possui
    ORDER {
        uuid id
        uuid budget_id
        int sankhya_pedido_id
        string status_entrega
        datetime data_criacao
    }

    TRANSACTION {
        string gateway_id
        decimal valor_total
        decimal valor_split_portal
        decimal valor_split_eletricista
        string status
    }
```
