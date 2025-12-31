# Especificação de API - Portal do Eletricista

Esta lista preliminar de endpoints orienta o desenvolvimento do Backend e a integração com o Frontend.

## Padrões
*   **Protocolo:** REST over HTTPS
*   **Formato:** JSON
*   **Auth:** `Authorization: Bearer <JWT>`

---

## 🔐 Autenticação (Auth)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Login do Eletricista/Admin. Retorna JWT. |
| `POST` | `/auth/register` | Cadastro de novo Eletricista (pending approval). |
| `POST` | `/auth/forgot-password` | Solicitação de recuperação de senha. |
| `POST` | `/auth/refresh-token` | Renovar token expirado. |
| `GET` | `/auth/me` | Dados do usuário logado. |

## 📦 Produtos (Products)

*Leitura otimizada do PostgreSQL local (sync com Sankhya).*

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/products` | Listagem com filtros (categoria, busca, preço). |
| `GET` | `/products/:id` | Detalhes do produto. |
| `GET` | `/categories` | Árvore de categorias. |

## 📝 Orçamentos (Budgets)

*Core do Eletricista: Montagem de carrinhos.*

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/budgets` | Criar novo orçamento. |
| `GET` | `/budgets` | Listar orçamentos do eletricista logado. |
| `GET` | `/budgets/:id` | Detalhes de um orçamento. |
| `PUT` | `/budgets/:id` | Atualizar itens ou mão de obra. |
| `POST` | `/budgets/:id/share` | Gerar link público/PDF para o cliente. |
| `GET` | `/public/budgets/:token` | **PÚBLICO.** Visualização para o Cliente Final. |

## 💳 Pedidos & Pagamento (Orders)

*Checkout e Transação.*

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/checkout/init` | Inicia transação no Gateway (baseado no Orçamento). |
| `POST` | `/webhooks/gateway` | **CALLBACK.** Recebe status do pagamento (Pago/Recusado). |
| `GET` | `/orders` | Histórico de pedidos e status de entrega. |
| `GET` | `/orders/:id` | Detalhes do pedido. |

## 💰 Financeiro (Split & Comissões)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/financial/extract` | Extrato de comissões e mão de obra recebida. |
| `GET` | `/financial/balance` | Saldo atual e valores futuros. |
| `POST` | `/financial/bank-account` | Cadastrar conta para recebimento. |

## 🔄 Integração (Internal/System)

*Endpoints protegidos, usados apenas pelo Worker/Sync Service.*

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/integration/sync/products` | Recebe lote de atualização de produtos do Sankhya. |
| `POST` | `/integration/sync/stock` | Atualiza status de disponibilidade. |
| `GET` | `/integration/orders/pending` | Lista pedidos pagos pendentes de envio ao Sankhya. |
| `PUT` | `/integration/orders/:id/sankhya` | Atualiza ID do pedido gerado no Sankhya. |
