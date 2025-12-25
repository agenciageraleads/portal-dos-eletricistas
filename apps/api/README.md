# Portal do Eletricista - API Backend 🛠

Backend em **NestJS** responsável por toda a lógica de negócios, integrações e segurança.

## Tecnologias Key
*   **Framework:** NestJS (Modular, TypeScript).
*   **Database:** PostgreSQL (via Prisma ou TypeORM).
*   **Cache:** Redis.
*   **Fila:** BullMQ / SQS (Para integração assíncrona com Sankhya).

## Estrutura de Pastas
*   `src/users`: Gestão de Eletricistas.
*   `src/products`: Catálogo (Leitura da réplica local).
*   `src/budgets`: Orçamentador e Carrinho.
*   `src/orders`: Checkout e processamento.
*   `src/integrations`: Serviços de conexão com ERP Sankhya.

## Setup Específico
(Geralmente rodado via docker-compose na raiz, mas para rodar isolado):

```bash
# Instalar deps
npm install

# Rodar em watch mode
npm run start:dev
```

## Variáveis de Ambiente
Verifique o arquivo `.env.example` para as chaves necessárias (DB_HOST, JWT_SECRET, SANKHYA_API_URL, etc).
