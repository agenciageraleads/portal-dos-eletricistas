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
> **Pré-requisitos:** Node.js 18+ e Docker.

1.  Instale as dependências: `npm install`
2.  Configure variáveis de ambiente (`.env`)
3.  Suba os serviços: `docker-compose up -d`
4.  Execute localmente: `npm run dev`

---
*Desenvolvido em parceria com Antigravity AI.*
