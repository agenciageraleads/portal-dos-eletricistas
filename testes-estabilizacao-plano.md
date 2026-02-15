# Plano de Implementação - Testes e Estabilização do Ambiente

## Objetivo

Garantir que os testes E2E (End-to-End) sejam executados corretamente e que o ambiente de testes (Beta) esteja funcional para validar as novas funcionalidades sem riscos ao ambiente de produção.

## Tarefas

### Fase 1: Diagnóstico e Correção de Ambiente

- [ ] **Tarefa 1.1: Investigar 404 no Ambiente Beta**
  - O URL `https://beta.portaleletricos.com.br` está retornando 404.
  - Verificar configurações de deploy ou se o serviço caiu na VPS.
  - Verificar: `curl -I https://beta.portaleletricos.com.br` deve retornar 200.
- [ ] **Tarefa 1.2: Validar URLs e Configurações**
  - Confirmar se o URL do Beta está correto no `playwright.config.ts`.
  - Verificar se há necessidade de VPN ou autenticação básica (HTTP Basic Auth) para o Beta.

### Fase 2: Atualização dos Testes E2E

- [ ] **Tarefa 2.1: Atualizar Seletores e Asserções da Landing Page**
  - Corrigir o título esperado de `/Portal dos Eletricistas/` para `PortalElétricos`.
  - Ajustar seletores que possam ter mudado entre versões (ex: nav responsiva).
  - Verificar: Rodar `npx playwright test tests/e2e/01-landing-page.spec.ts` contra Produção deve passar.
- [ ] **Tarefa 2.2: Sincronizar Usuário de Teste**
  - Garantir que o `testUser` definido em `fixtures/test-user.ts` existe no ambiente sendo testado (Beta).
  - Criar um script de "seeding" de teste se necessário.

### Fase 3: Execução e Relatório de Bugs

- [ ] **Tarefa 3.1: Execução Completa da Suíte**
  - Rodar todos os testes (`/test`) no ambiente Beta após as correções.
- [ ] **Tarefa 3.2: Identificação de Bugs de Negócio**
  - Analisar falhas que não sejam de "seletor quebrado" para identificar erros de lógica na versão Beta.
  - Verificar: Vídeos e Screenshots das falhas do Playwright.

## Done When

- [ ] Suíte de testes rodando sem erros de infraestrutura.
- [ ] Ambiente Beta acessível.
- [ ] Relatório detalhado de bugs reais encontrados no app.

## Notas

- O ambiente de Produção está funcional, mas os testes falham nela por divergência de versão e falta de usuário de teste.
- O foco imediato é trazer o Beta de volta à vida.
