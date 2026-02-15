# Plano de Implementação: Curadoria de Imagens Automática (Web Search)

Este plano descreve a implementação de um sistema que busca automaticamente candidatos a imagens na internet para produtos que não possuem foto no sistema Sankhya, permitindo que um administrador aprove a melhor opção através de um painel de curadoria.

## 📋 Visão Geral

Muitos produtos importados do Sankhya não possuem imagens oficiais. Este sistema visa automatizar a busca por essas fotos usando ferramentas de busca gratuitas (DuckDuckGo/Crawler), organizando-as em uma fila de curadoria para garantir a qualidade visual do Portal dos Eletricistas.

## 🏗️ Tipo de Projeto

- **WEB**: Painel administrativo em Next.js para aprovação de imagens.
- **BACKEND**: API NestJS para automação de busca, download e processamento.

## ✅ Critérios de Sucesso

- [ ] Cron job identifica produtos sem `image_url` e busca até 4 candidatos na web.
- [ ] Interface administrativa exibe os produtos "pendentes" com suas opções de fotos.
- [ ] Ao aprovar uma foto, o sistema baixa, otimiza (WebP/Sharp) e salva permanentemente.
- [ ] Sistema de "ignore" para evitar buscar fotos de produtos que sabidamente não têm boas opções na web.

## 🛠️ Tech Stack

- **Backend**: NestJS, Prisma, `duckduckgo-images-api` (ou crawler similar).
- **Processamento**: Sharp (WebP, resizing).
- **Frontend**: React (Next.js App Router).
- **Storage**: Compatível com S3 (MinIO) ou Armazenamento Local (via `SankhyaImageService`).

## 📂 Estrutura de Arquivos

```text
apps/api/
├── src/integrations/web-search/
│   ├── web-search.service.ts      # Lógica de integração com buscadores
│   └── web-search.module.ts
├── src/products/
│   ├── image-curator.controller.ts # Endpoints de listagem e aprovação
│   └── image-candidates.service.ts # Lógica de negócio da fila
apps/web/
├── app/admin/curadoria-imagens/
│   ├── page.tsx                    # Grid de produtos pendentes
│   └── components/                 # Galeria de seleção de imagens
```

## 📝 Task Breakdown

### Fase 1: Infraestrutura e Dados (P0)

- [x] **T1.1: Atualização do Prisma Schema** (Concluído)
- [x] **T1.2: Web Search Integration** (Concluído)

### Fase 2: Automação em Background (P1)

- [x] **T2.1: Cron Job de Busca** (Concluído - ImageCandidatesService)
- [x] **T2.2: Refatoração de Download (SankhyaImageService)** (Concluído)

### Fase 3: Interface de Curadoria (P2)

- [x] **T3.1: API de Gerenciamento da Fila** (Concluído)
- [x] **T3.2: Tela de Curadoria (Admin)** (Concluído)

### Fase 4: Polimento e Regras de Negócio (P3)

- [ ] **T4.1: Botão "Não Encontrei" (Ignore)**
  - Funcionalidade para marcar produto como IGNORED para nunca mais buscar.
- [ ] **T4.2: Filtros por Marca**
  - Facilitar a curadoria agrupando por marcas (ex: buscar só fotos da Schneider hoje).

## 🚀 Fase X: Verificação Final

- [ ] Validar se as imagens salvas estão no formato WebP e tamanho correto (800x800).
- [ ] Verificar se o Cron Job não está estourando o rate limit dos buscadores.
- [ ] Testar fluxo completo: Busca Automática -> Lista no Admin -> Aprovação -> Atualização no Catálogo.
- [ ] Executar `.agent/scripts/checklist.py` para garantir padrões.

---
**Próximo Passo**: Assim que aprovado, iniciaremos a **T1.1 (Prisma Schema)**.
