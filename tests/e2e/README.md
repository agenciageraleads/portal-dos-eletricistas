# 🧪 Testes E2E - Portal dos Eletricistas

Este diretório contém testes end-to-end (E2E) automatizados usando Playwright para validar todas as funcionalidades do Portal dos Eletricistas.

## 📋 Estrutura dos Testes

```
tests/e2e/
├── 01-landing-page.spec.ts    # Testes da página inicial
├── 02-registro.spec.ts        # Testes de cadastro de usuário
├── 03-login.spec.ts           # Testes de autenticação
├── 04-catalogo.spec.ts        # Testes do catálogo de produtos
├── 05-orcamentos.spec.ts      # Testes de orçamentos
└── README.md                  # Este arquivo
```

## 🚀 Como Executar

### Instalação

Primeiro, instale as dependências do Playwright:

```bash
npm install
npx playwright install
```

### Executar Todos os Testes

```bash
# Modo headless (sem interface gráfica)
npm run test:e2e

# Modo headed (com navegador visível)
npm run test:e2e:headed

# Modo UI (interface interativa do Playwright)
npm run test:e2e:ui
```

### Executar Testes Específicos

```bash
# Apenas testes de landing page
npx playwright test 01-landing-page

# Apenas testes de registro
npx playwright test 02-registro

# Apenas testes de login
npx playwright test 03-login

# Apenas testes de catálogo
npx playwright test 04-catalogo

# Apenas testes de orçamentos
npx playwright test 05-orcamentos
```

### Executar em Navegador Específico

```bash
# Apenas Chrome
npx playwright test --project=chromium

# Apenas Firefox
npx playwright test --project=firefox

# Apenas Safari
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari (iPhone)
npx playwright test --project="Mobile Safari"
```

## 📊 Relatórios

Após executar os testes, você pode visualizar o relatório HTML:

```bash
npm run test:e2e:report
```

Isso abrirá um relatório interativo no navegador com:

- ✅ Testes que passaram
- ❌ Testes que falharam
- 📸 Screenshots de falhas
- 🎥 Vídeos de testes que falharam
- 📝 Traces detalhados

## 🎯 Cobertura de Testes

### ✅ Landing Page (01-landing-page.spec.ts)

- [x] Exibição de logo e título
- [x] Mensagem de boas-vindas
- [x] Botões de autenticação
- [x] Seção de acesso rápido
- [x] PWA oculto (conforme solicitado)
- [x] Seção "Outros Serviços"
- [x] Navegação responsiva
- [x] Performance (< 3s)

### ✅ Registro (02-registro.spec.ts)

- [x] Exibição do formulário
- [x] Validação de campos
- [x] Validação de email
- [x] Validação de senha
- [x] Aceitação de termos obrigatória
- [x] Cadastro com sucesso
- [x] Prevenção de email duplicado
- [x] Formatação automática de campos

### ✅ Login (03-login.spec.ts)

- [x] Exibição do formulário
- [x] Erro com credenciais inválidas
- [x] Validação de campos obrigatórios
- [x] Login com sucesso
- [x] Persistência de sessão
- [x] Proteção de rotas
- [x] Logout
- [x] Recuperação de senha

### ✅ Catálogo (04-catalogo.spec.ts)

- [x] Listagem de produtos
- [x] Exibição de informações
- [x] Busca por nome
- [x] Mensagem sem resultados
- [x] Limpar busca
- [x] Detalhes do produto
- [x] Paginação
- [x] Carregamento de imagens
- [x] Adicionar ao carrinho
- [x] Persistência de busca

### ✅ Orçamentos (05-orcamentos.spec.ts)

- [x] Criar novo orçamento
- [x] Adicionar produtos
- [x] Definir quantidade
- [x] Cálculo automático
- [x] Dados do cliente
- [x] Mão de obra
- [x] Salvar como rascunho
- [x] Produto externo
- [x] Listar orçamentos
- [x] Visualizar detalhes
- [x] Editar orçamento
- [x] Excluir orçamento
- [x] Gerar PDF
- [x] Compartilhar WhatsApp
- [x] Copiar link

## 🔧 Configuração

A configuração dos testes está em `playwright.config.ts`:

- **URL Base:** `https://beta.portaleletricos.com.br`
- **Timeout:** 30 segundos por teste
- **Retries:** 2 tentativas em CI, 0 localmente
- **Screenshots:** Apenas em falhas
- **Vídeos:** Apenas em falhas
- **Browsers:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari, iPad

### Variáveis de Ambiente

Você pode configurar a URL de teste:

```bash
# Testar em ambiente local
TEST_URL=http://localhost:3000 npm run test:e2e

# Testar em staging
TEST_URL=https://staging.portaleletricos.com.br npm run test:e2e

# Testar em produção
TEST_URL=https://beta.portaleletricos.com.br npm run test:e2e
```

## 📝 Escrevendo Novos Testes

### Estrutura Básica

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nome do Módulo', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada teste
    await page.goto('/rota');
  });

  test('deve fazer algo específico', async ({ page }) => {
    // Arrange (preparar)
    const button = page.getByRole('button', { name: /Clique/i });
    
    // Act (agir)
    await button.click();
    
    // Assert (verificar)
    await expect(page.getByText(/Sucesso/i)).toBeVisible();
  });
});
```

### Boas Práticas

1. **Use seletores semânticos:** Prefira `getByRole`, `getByLabel`, `getByText` ao invés de seletores CSS
2. **Aguarde elementos:** Use `await expect(...).toBeVisible()` ao invés de `waitForTimeout`
3. **Isole testes:** Cada teste deve ser independente
4. **Dados únicos:** Use timestamps para gerar dados únicos
5. **Cleanup:** Limpe dados de teste após execução

## 🐛 Debug

### Modo Debug

```bash
# Debug específico
npx playwright test 02-registro --debug

# Debug com UI
npm run test:e2e:ui
```

### Ver Traces

Se um teste falhar, você pode ver o trace detalhado:

```bash
npx playwright show-trace trace.zip
```

## 📸 Screenshots e Vídeos

Screenshots e vídeos de testes que falharam ficam em:

```
test-results/
├── 02-registro-spec-ts-cadastro-com-sucesso/
│   ├── video.webm
│   └── screenshot.png
└── trace.zip
```

## 🎯 CI/CD

Para integrar com CI/CD, adicione ao seu pipeline:

```yaml
# .github/workflows/test.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Recursos

- [Documentação do Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

---

**Desenvolvido com ❤️ para garantir a qualidade do Portal dos Eletricistas**
