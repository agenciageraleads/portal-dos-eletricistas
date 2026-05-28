# 📚 Documentação do Portal dos Eletricistas

Este diretório contém toda a documentação técnica e estratégica do projeto.

---

## 📖 Documentos Principais

### 🎯 Estratégia e Planejamento
- **[ROADMAP.md](./ROADMAP.md)** - Plano estratégico Q1-Q2 2026 com marcos e funcionalidades planejadas

### 🏗 Arquitetura e Desenvolvimento

- **[arquitetura.md](./arquitetura.md)** - Arquitetura atual do sistema (v1.1.0), stack tecnológica, modelo de dados e fluxos
- **[DIRECTIVES.md](./DIRECTIVES.md)** - Padrões de código, Git workflow, e definição de "done"
- **[RELEASE_PROCESS.md](./RELEASE_PROCESS.md)** - Como criar versões e gerenciar Releases no GitHub
- **[guia_dev.md](./guia_dev.md)** - Guia de onboarding para desenvolvedores (setup local, estrutura do projeto)
- **[DATABASE.md](./DATABASE.md)** - Detalhamento do esquema Prisma, relacionamentos e estratégias de migração.
- **[TESTING.md](./testing/TESTING.md)** - Guia de como escrever testes Unitários (Jest/NestJS) e E2E (Playwright).

---

## 🔧 Documentação de Setup

### [setup/](./setup/)
- **[minio.md](./setup/minio.md)** - Configuração completa do armazenamento MinIO S3

---

## 📦 Documentos Arquivados

### [archive/](./archive/)
Contém documentação histórica e planejamentos antigos que não refletem mais o estado atual:

**Planejamentos Originais:**
- `planejamento_original.md` - Planejamento técnico inicial (arquitetura futura)
- `diagramas_planejados.md` - Diagramas da arquitetura planejada (não implementada)
- `api_planejada.md` - Endpoints de API futuros (integração Sankhya, pagamentos)

**Relatórios Históricos:**
- `report_25dez2025.md` - Relatório de auditoria de 25/12/2025
- `tarefas_concluidas.md` - Checklist de tarefas (100% concluído)

**Setup Descontinuado:**
- `railway_volume_setup.md` - Configuração Railway (projeto migrou para VPS)
- `minio_setup_old.md` - Versão antiga da doc do MinIO
- `minio_public_bucket_old.md` - Versão antiga da doc do MinIO

> [!NOTE]
> Estes documentos são mantidos para referência histórica, mas não refletem o estado atual do projeto.

---

## 🔍 Documentos na Raiz do Projeto

Alguns documentos importantes estão na raiz do monorepo:

- **[../README.md](../README.md)** - Introdução geral do projeto
- **[../CHANGELOG.md](../CHANGELOG.md)** - Histórico de versões (v1.0.0, v1.1.0)
- **[../DEPLOY.md](../DEPLOY.md)** - Processo de deploy em produção
- **[../DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md)** - Checklist de deploy
- **[../LOCAL_SETUP.md](../LOCAL_SETUP.md)** - Setup do ambiente local

---

## 📋 Como Navegar

**Se você é um novo desenvolvedor:**
1. Comece pelo [guia_dev.md](./guia_dev.md) para setup inicial
2. Leia [DIRECTIVES.md](./DIRECTIVES.md) para entender os padrões
3. Consulte [arquitetura.md](./arquitetura.md) para visão técnica

**Se você está planejando novas funcionalidades:**
1. Veja [ROADMAP.md](./ROADMAP.md) para o plano estratégico
2. Consulte `archive/planejamento_original.md` para ideias futuras
3. Revise [arquitetura.md](./arquitetura.md) para entender limitações atuais

**Se você está fazendo deploy:**
1. Leia [../DEPLOY.md](../DEPLOY.md)
2. Use [../DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md)
3. Verifique [setup/minio.md](./setup/minio.md) se precisar configurar storage

---

## 🎯 Estado do Projeto

**Versão Atual:** v1.2.0 (02/01/2026)  
**Status:** Auditoria de Integridade Concluída  
**Próxima Fase:** UX e Funcionalidades Q1 2026 (ver ROADMAP)

---

**Última Atualização:** 31 de Dezembro de 2025
