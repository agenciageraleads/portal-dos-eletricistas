# Portal do Eletricista ⚡️

Plataforma de vendas e orçamentos para eletricistas parceiros da Portal Distribuidora.

> 🚀 **Status:** MVP em Produção | [Acessar Portal](https://portal-eletricista.vercel.app)

## 📚 Documentação
Toda a documentação técnica e de planejamento está na pasta [`docs/`](./docs):
*   [Roadmap Estratégico](./docs/ROADMAP.md) ⭐️
*   [Diretrizes Técnicas](./docs/DIRECTIVES.md)
*   [Planejamento Técnico e Arquitetura](./docs/planejamento.md)
*   [Diagramas Visuais](./docs/diagramas.md)
*   [Especificação da API](./docs/api.md)
*   [Guia de Desenvolvimento](./docs/guia_dev.md)

## 🏗 Estrutura do Projeto (Monorepo)
*   `apps/web`: Frontend (Next.js) - ✅ **Em Produção**
*   `apps/api`: Backend (NestJS) - ✅ **Em Produção**

## 🚀 Como Rodar Localmente

> **📖 Guia Completo:** Veja o [LOCAL_SETUP.md](./LOCAL_SETUP.md) para instruções detalhadas passo a passo.

### Quick Start

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o ambiente:**
   ```bash
   # Inicie o PostgreSQL
   docker-compose up -d
   
   # Configure variáveis de ambiente
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.local.example apps/web/.env.local
   
   # Execute migrações
   cd apps/api && npx prisma migrate dev && cd ../..
   ```

3. **Execute a aplicação:**
   ```bash
   npm run dev
   ```

4. **Verifique se tudo está OK:**
   ```bash
   npm run verify:local
   ```

### 🔍 Verificação de Saúde

Após iniciar, você pode verificar o status do sistema:

- **Script de Verificação:** `npm run verify:local`
- **Health Check API:** http://localhost:3333/health
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3333

### 📋 Antes de Fazer Deploy

Antes de fazer deploy em produção, siga o [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) para garantir que tudo está funcionando perfeitamente.

---
*Desenvolvido em parceria com Antigravity AI.*
