# Guia de Testes 🧪

Para garantir a estabilidade do Portal dos Eletricistas, utilizamos uma estratégia de testes em múltiplas camadas.

## 🟢 Testes Unitários e Integração (Backend)

Usamos **Jest** e o ecossistema do **NestJS**.

### Como rodar

- Todos os testes: `npm run test` (na pasta `apps/api`)
- Modo watch: `npm run test:watch`
- Cobertura: `npm run test:cov`

### Padrão de escrita
- Arquivos devem terminar em `.spec.ts`.
- Siga o padrão **AAA** (Arrange, Act, Assert).
- **Mocks:** Use o `deepMock` do Prisma para testes de service.

## 🔵 Testes de UI e E2E (Frontend)

Usamos **Playwright** para garantir que os fluxos críticos (Criação de Orçamento, Login) funcionem.

### Como rodar o Playwright

- Interface visual: `npx playwright test --ui` (na raiz do monorepo ou em `apps/web`)
- Modo headless: `npm run test:e2e`

### Fluxos Críticos Protegidos
1. Login de Eletricista.
2. Busca de Produto no Catálogo.
3. Geração de PDF de Orçamento.
4. Onboarding de novo usuário.

## 🤖 Regras para IAs

- **Sempre** rode os testes antes de abrir um PR.
- **Sempre** adicione um teste para qualquer correção de bug (Prevenção de regressão).
- Se a cobertura cair abaixo de 70%, o PR será rejeitado.

---
*Dúvida em como mockar algo? Veja os exemplos em `apps/api/src/users/users.service.spec.ts`.*
