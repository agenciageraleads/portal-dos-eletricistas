# Guia de Desenvolvimento (Onboarding)

Bem-vindo ao **Portal do Eletricista**! Este guia leva você do "zero" ao "código rodando" em 15 minutos.

⚠️ **Importante:** Antes de codar, leia nossas [Diretrizes Técnicas (DIRECTIVES.md)](./DIRECTIVES.md) para entender nossos padrões de Commit e Código.

---

## 🚀 1. Configuração do Ambiente

### Pré-requisitos
*   **Node.js:** v18 ou superior.
*   **Docker:** Desktop rodando (para Banco de Dados).
*   **Editor:** VS Code (recomendado) com extensões de ESLint e Prettier.

### Instalação Rápida
Abra o terminal na raiz do projeto (`/Portal dos Eletricistas`) e execute:

1.  **Instalar dependências (Raiz e Sub-projetos):**
    ```bash
    npm install
    ```

2.  **Configurar Variáveis de Ambiente:**
    *   Duplique o arquivo `.env.example` para `.env` na raiz.
    *   Duplique `apps/api/.env.example` -> `apps/api/.env`.
    *   Duplique `apps/web/.env.example` -> `apps/web/.env`.

3.  **Subir Infraestrutura (Docker):**
    ```bash
    docker-compose up -d
    ```
    *Isso iniciará o PostgreSQL e o Redis.*

4.  **Rodar a aplicação (Modo Dev):**
    ```bash
    npm run dev
    ```
    *   **Frontend:** [http://localhost:3000](http://localhost:3000)
    *   **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 📂 2. Navegando no Projeto (Monorepo)

Este projeto usa a estrutura de **Monorepo**.

| Caminho | Responsabilidade |
| :--- | :--- |
| `apps/web` | **Frontend.** Next.js 14, React, TailwindCSS. Onde vive a interface. |
| `apps/api` | **Backend.** NestJS (Node). Onde vive a lógica de negócio e integração. |
| `docs/` | **Documentação.** A verdade absoluta sobre o projeto. |

---

## 🛠 3. Fluxo de Trabalho (Dia a Dia)

### Criando uma nova feature
1.  Garanta que está com a `develop` atualizada: `git checkout develop && git pull`.
2.  Crie sua branch: `git checkout -b feat/minha-feature`.
3.  Codifique.
4.  Commit seguindo padrão: `git commit -m "feat: adiciona botão de login"`.
5.  Abra o PR para `develop`.

### Dicas de Ouro
*   **Erros de Banco?** Verifique se o container está rodando: `docker ps`.
*   **Erros de Tipo?** Rode o Check de TS na raiz: `npm run type-check`.

