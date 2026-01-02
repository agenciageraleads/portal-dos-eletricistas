# Portal do Eletricista ⚡️

Plataforma completa de gestão de orçamentos e vendas para eletricistas parceiros da Portal Distribuidora.

> 🚀 **Status:** v1.2.0 em Produção | [Acessar App](https://app.portaleletricos.com.br)

---

## ✨ Funcionalidades Principais (v1.2.0)

- **Catálogo Inteligente**: Busca com sinônimos e normalização de medidas.
- **Gestão de Orçamentos**: Criação, edição e geração de PDF profissional.
- **Painel Administrativo**: Visibilidade total dos orçamentos e gestão de usuários.
- **Customização**: Personalização de PDFs com logo do eletricista e controle de privacidade de valores.
- **Itens Manuais**: Flexibilidade para adicionar serviços e produtos fora do catálogo.
- **Onboarding**: Guia interativo para novos usuários parceiros.

---

## 🏗 Estrutura do Projeto (Monorepo)

- `apps/web`: **Frontend** (Next.js 14, TailwindCSS, React).
- `apps/api`: **Backend** (NestJS, Prisma, PostgreSQL, S3/MinIO).
- `docs/`: **Documentação Técnica** centralizada.

---

## 📚 Documentação e Governança

Para manter a qualidade e performance do projeto, siga nossos guias:

1.  **[Guia de Desenvolvimento](./docs/guia_dev.md)**: Setup local e onboarding.
2.  **[Diretrizes Técnicas](./docs/DIRECTIVES.md)**: Padrões de código e Git Flow.
3.  **[Processo de Release](./docs/RELEASE_PROCESS.md)**: Como gerenciar versões e tags.
4.  **[Instruções de Deploy](./DEPLOY.md)** e **[Checklist](./DEPLOY_CHECKLIST.md)**.
5.  **[Arquitetura do Sistema](./docs/arquitetura.md)**: Detalhes técnicos e modelo de dados.

---

## 🚀 Como Rodar Localmente

Certifique-se de ter o **Docker** e **Node.js v18+** instalados.

1.  **Instalação**: `npm install`
2.  **Infra (Banco/Redis)**: `docker-compose up -d`
3.  **Env Vars**: Configure os arquivos `.env` seguindo os exemplos em cada pasta.
4.  **Execução**: `npm run dev`
5.  **Verificação**: `npm run verify:local`

---

## 🍃 Integridade e Performance

Recentemente realizamos uma auditoria para garantir a saúde do repositório:
- **VS Code Otimizado**: Configurações em `.vscode/settings.json` para evitar travamentos.
- **Git Leve**: Imagens de produtos são ignoradas pelo Git (gerenciadas via script de sync).
- **TypeScript**: Configurações otimizadas para build rápido.

---
*Mantido com ⚡️ para a Portal Distribuidora.*
