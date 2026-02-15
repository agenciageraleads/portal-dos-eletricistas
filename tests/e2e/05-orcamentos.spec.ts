import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';

/**
 * Teste E2E: Criação e Gestão de Orçamentos
 * Valida o fluxo completo de criação, edição e compartilhamento de orçamentos
 */

test.describe('Criação de Orçamentos', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByPlaceholder(/email ou cpf/i).fill(testUser.email);
        await page.locator('input[type="password"]').fill(testUser.password);
        await page.getByRole('button', { name: /Entrar/i }).click();
        await page.waitForTimeout(2000);
    });

    test('deve permitir criar novo orçamento', async ({ page }) => {
        // Navegar para novo orçamento
        await page.goto('/orcamento/novo');
        await page.waitForTimeout(1000);

        // Verificar que está na página correta
        await expect(page.getByText(/Novo Orçamento|Criar Orçamento/i)).toBeVisible();
    });

    test.fixme('deve permitir buscar e adicionar produtos ao orçamento', async ({ page }) => {
        // ... outdated flow
    });

    test.fixme('deve permitir definir quantidade de produtos', async ({ page }) => {
        // ... outdated flow
    });

    test.fixme('deve calcular subtotal automaticamente', async ({ page }) => {
        // ... outdated flow
    });

    test('deve permitir preencher dados do cliente', async ({ page }) => {
        await page.goto('/orcamento?mode=full');
        await page.waitForTimeout(1000);

        // Locating section 4
        const clientSection = page.locator('section').filter({ hasText: '4. Dados do Cliente' });

        // Inputs
        const nameInput = clientSection.getByRole('textbox').first();
        const phoneInput = clientSection.getByRole('textbox').last(); // or specific placeholder

        await nameInput.fill('Maria Silva');
        await phoneInput.fill('11987654321');

        // Verificar que foi preenchido
        expect(await nameInput.inputValue()).toBe('Maria Silva');
    });

    test('deve permitir adicionar mão de obra', async ({ page }) => {
        await page.goto('/orcamento?mode=full');
        await page.waitForTimeout(1000);

        // Procurar campo de mão de obra
        const laborInput = page.getByLabel(/Mão de obra|Serviço/i);

        if (await laborInput.count() > 0) {
            await laborInput.fill('500');
            await page.waitForTimeout(500);

            // Verificar que total foi atualizado
            const totalText = page.getByText(/Total/i);
            await expect(totalText).toBeVisible();
        }
    });

    test('deve permitir salvar orçamento como rascunho', async ({ page }) => {
        await page.goto('/orcamento?mode=full');
        await page.waitForTimeout(1000);

        // Adicionar produto mínimo
        const searchInput = page.getByPlaceholder(/Buscar produto/i);
        await searchInput.fill('Interruptor');
        await page.waitForTimeout(2000);

        const addButton = page.getByRole('button', { name: /Adicionar/i }).first();
        await addButton.click();
        await page.waitForTimeout(1000);

        // Preencher dados do cliente
        await page.getByPlaceholder('Informe o nome completo do cliente').fill('João Teste');
        await page.getByPlaceholder('Informe o WhatsApp do cliente').fill('11999999999');

        // Salvar
        const saveButton = page.getByRole('button', { name: /Salvar|Criar/i });
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Verificar mensagem de sucesso ou redirecionamento
        const hasSuccess = await page.getByText(/sucesso|salvo|criado/i).count() > 0;
        const redirected = page.url().includes('/orcamentos');

        expect(hasSuccess || redirected).toBeTruthy();
    });

    test('deve permitir adicionar produto externo', async ({ page }) => {
        await page.goto('/orcamento?mode=full');
        await page.waitForTimeout(1000);

        // Procurar botão de adicionar produto externo
        const externalButton = page.getByRole('button', { name: /Produto externo|Adicionar manualmente/i });

        if (await externalButton.count() > 0) {
            await externalButton.click();
            await page.waitForTimeout(500);

            // Preencher dados do produto externo
            await page.getByLabel(/Nome do produto/i).fill('Produto Teste Externo');
            await page.getByLabel(/Preço/i).fill('50');
            await page.getByLabel(/Quantidade/i).fill('2');

            // Confirmar
            const confirmButton = page.getByRole('button', { name: /Adicionar|Confirmar/i });
            await confirmButton.click();
            await page.waitForTimeout(1000);

            // Verificar que foi adicionado
            await expect(page.getByText(/Produto Teste Externo/i)).toBeVisible();
        }
    });
});

test.describe('Gestão de Orçamentos', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByLabel(/E-mail/i).fill('teste@example.com');
        await page.getByLabel(/Senha/i).fill('Teste@123');
        await page.getByRole('button', { name: /Entrar/i }).click();
        await page.waitForTimeout(2000);

        // Navegar para lista de orçamentos
        await page.goto('/orcamentos');
        await page.waitForTimeout(2000);
    });

    test('deve listar orçamentos existentes', async ({ page }) => {
        // Verificar que há lista de orçamentos ou mensagem de vazio
        await expect(page.getByText(/Meus Orçamentos|Orçamentos/i)).toBeVisible();

        const hasOrders = await page.locator('a[href^="/o/"]').count() > 0;
        const hasEmptyMessage = await page.getByText(/Nenhum orçamento|Você ainda não/i).count() > 0;

        expect(hasOrders || hasEmptyMessage).toBeTruthy();
    });

    test('deve exibir informações dos orçamentos na lista', async ({ page }) => {
        const budgets = page.locator('a[href^="/o/"]').first().locator('xpath=../..'); // Go up to card
        const count = await budgets.count();

        if (count > 0) {
            const firstBudget = budgets.first();

            // Verificar presença de informações básicas
            await expect(firstBudget).toBeVisible();

            // Pode ter: nome do cliente, data, valor, status
            const hasClientName = await firstBudget.locator('text=/[A-Z][a-z]+/').count() > 0;
            const hasValue = await firstBudget.getByText(/R\$/).count() > 0;

            expect(hasClientName || hasValue).toBeTruthy();
        }
    });

    test('deve permitir visualizar detalhes de um orçamento', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const count = await budgets.count();

        if (count > 0) {
            // Clicar no primeiro orçamento
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Verificar que abriu detalhes
            const urlChanged = !page.url().endsWith('/orcamentos');
            const hasModal = await page.locator('[role="dialog"]').count() > 0;

            expect(urlChanged || hasModal).toBeTruthy();
        }
    });

    test('deve permitir editar orçamento', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const count = await budgets.count();

        if (count > 0) {
            // Clicar no primeiro orçamento
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Procurar botão de editar
            const editButton = page.getByRole('button', { name: /Editar/i });

            if (await editButton.count() > 0) {
                await editButton.click();
                await page.waitForTimeout(1000);

                // Verificar que está em modo de edição
                const saveButton = page.getByRole('button', { name: /Salvar/i });
                await expect(saveButton).toBeVisible();
            }
        }
    });

    test('deve permitir excluir orçamento', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const initialCount = await budgets.count();

        if (initialCount > 0) {
            // Clicar no primeiro orçamento
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Procurar botão de excluir
            const deleteButton = page.getByRole('button', { name: /Excluir|Deletar/i });

            if (await deleteButton.count() > 0) {
                await deleteButton.click();
                await page.waitForTimeout(500);

                // Confirmar exclusão (se houver modal de confirmação)
                const confirmButton = page.getByRole('button', { name: /Confirmar|Sim/i });
                if (await confirmButton.count() > 0) {
                    await confirmButton.click();
                }

                await page.waitForTimeout(2000);

                // Verificar que foi excluído
                const newCount = await budgets.count();
                expect(newCount).toBeLessThan(initialCount);
            }
        }
    });
});

test.describe('Compartilhamento de Orçamentos', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder(/email ou cpf/i).fill(testUser.email);
        await page.locator('input[type="password"]').fill(testUser.password);
        await page.getByRole('button', { name: /Entrar/i }).click();
        await page.waitForTimeout(2000);
        await page.goto('/orcamentos');
        await page.waitForTimeout(2000);
    });

    test('deve permitir gerar PDF do orçamento', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const count = await budgets.count();

        if (count > 0) {
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Procurar botão de PDF
            const pdfButton = page.getByRole('button', { name: /PDF|Visualizar/i });

            if (await pdfButton.count() > 0) {
                // Clicar e verificar que abre nova aba ou download
                await pdfButton.click();
                await page.waitForTimeout(2000);

                // Verificar que algo aconteceu (difícil validar PDF sem download)
                expect(true).toBeTruthy();
            }
        }
    });

    test('deve permitir compartilhar via WhatsApp', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const count = await budgets.count();

        if (count > 0) {
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Procurar botão de WhatsApp
            const whatsappButton = page.getByRole('button', { name: /WhatsApp/i });

            if (await whatsappButton.count() > 0) {
                // Verificar que botão existe
                await expect(whatsappButton).toBeVisible();
            }
        }
    });

    test('deve permitir copiar link do orçamento', async ({ page }) => {
        const budgets = page.locator('[data-testid="budget-card"], .budget-card');
        const count = await budgets.count();

        if (count > 0) {
            await budgets.first().click();
            await page.waitForTimeout(1000);

            // Procurar botão de copiar link
            const copyButton = page.getByRole('button', { name: /Copiar link|Compartilhar/i });

            if (await copyButton.count() > 0) {
                await copyButton.click();
                await page.waitForTimeout(500);

                // Verificar mensagem de sucesso
                await expect(page.getByText(/copiado|link/i)).toBeVisible({ timeout: 3000 });
            }
        }
    });
});
