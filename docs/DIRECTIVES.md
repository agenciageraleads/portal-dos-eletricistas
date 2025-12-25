# Diretrizes Técnicas e Padrões (Engineering Directives)

Este documento atua como a "Constituição Técnica" do projeto. Todas as decisões de código, arquitetura e fluxo de trabalho devem respeitar estas diretrizes para garantir a qualidade de uma Software House de prestígio.

---

## 1. 🌳 Estratégia de Git (Git Workflow)

Utilizamos um modelo baseado em **Gitflow simplificado**.

### Branchs Principais
*   `main`: **Produção**. Código estável, testado e em uso pelos clientes.
*   `develop` (ou `staging`): **Homologação**. Onde integrações e testes finais ocorrem.

### Branchs de Trabalho
Para cada nova atividade, crie uma branch a partir da `develop` seguindo o padrão:
*   `feat/nome-da-funcionalidade`: Novas features (Ex: `feat/login-auth0`)
*   `fix/nome-do-bug`: Correção de erros (Ex: `fix/erro-calculo-split`)
*   `docs/assunto`: Apenas documentação (Ex: `docs/atualiza-readme`)
*   `refactor/alvo`: Melhorias de código sem mudança de comportamento (Ex: `refactor/servico-produtos`)

### Commits (Conventional Commits)
Mensagens de commit devem ser semânticas e em inglês (padrão internacional):
*   `feat: add login page`
*   `fix: resolve crash on payment api`
*   `chore: update dependencies`
*   `docs: update api guidelines`

---

## 2. 🛡 Padrões de Código (Code Standards)

### Geral
*   **Idioma do Código (Codebase):** Inglês para variáveis, funções e classes (Padrão Internacional).
*   **Idioma da Documentação e Instruções:** **Português (Brasil)**. Todos os arquivos de documentação, README, manuais, comentários explicativos complexos e mensagens de Pull Request devem ser em Português para facilitar a leitura da equipe local.
*   **Idioma da UI:** Português (Brasil).

### TypeScript (Strict Mode)
*   **Sem `any`:** O uso de `any` é estritamente proibido. Defina interfaces ou types.
*   **Interfaces:** Use `I` prefixo apenas se for convenção do time, caso contrário prefira nomes diretos (`User`, `ProductData`).
*   **Async/Await:** Sempre prefira `async/await` ao invés de `.then()`.

### Backend (NestJS)
*   **Arquitetura:** Mantenha a separação estrita: Controller -> Service -> Repository/Prisma.
*   **DTOs:** Validação obrigatória em todos os endpoints usando `class-validator`.
*   **Tratamento de Erros:** Nunca retorne erro 500 genérico. Use `HttpException` com mensagens claras.

### Frontend (Next.js)
*   **Componentes:** Pequenos e com responsabilidade única.
*   **Server vs Client:** Prefira *Server Components* por padrão. Use `"use client"` apenas onde houver interatividade (hooks, events).
*   **Estilização:** TailwindCSS ou CSS Modules. Evite estilos inline.

---

## 3. 🔍 Processo de Code Review (PR Guidelines)

Antes de abrir um Pull Request (PR):
1.  [ ] O código compila sem erros?
2.  [ ] O linter/formatter (ESLint/Prettier) passou?
3.  [ ] Removeu `console.log` esquecidos?
4.  [ ] Testou o fluxo feliz e o fluxo de erro?

Durante o Review:
*   Seja gentil e construtivo.
*   Foque na lógica, segurança e legibilidade, não apenas em sintaxe.
*   Aprovação requer pelo menos 1 review de outro dev (ou auto-review crítico se equipe for unitária).

---

## 4. 🚀 Definição de Concluído (Definition of Done - DoD)

Uma tarefa só é considerada **DONE** quando:
1.  Código mergeado na `develop`.
2.  Funcionalidade testada em ambiente local.
3.  Documentação atualizada (se houve mudança de API ou Variáveis de Ambiente).

---

## 5. 🍃 Gestão de Recursos e Performance (Machine Health)

Como trabalhamos com múltiplos agentes e ferramentas pesadas (Docker, IDEs), a saúde da máquina é prioridade:

*   **Navegador:** Ao realizar testes manuais ou automatizados via agentes, **SEMPRE feche as abas** que não estão mais em uso. Não acumule abas abertas ("zumbis"), pois isso drena memória RAM e impacta a performance dos demais agentes.
*   **Containers:** Derrube containers que não estão sendo usados (`docker-compose down`).

