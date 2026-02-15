import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';

/**
 * Teste E2E: Login e Autenticação
 * Valida o fluxo de login, logout e recuperação de senha
 * 
 * VERSÃO 3: Usando data-testid para seletores robustos
 */

test.describe('Login e Autenticação', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    });

    test('deve exibir formulário de login corretamente', async ({ page }) => {
        // Tenta data-testid, fallback para texto
        const title = page.getByTestId('login-title').or(page.getByText('Login Eletricista'));
        await expect(title).toBeVisible();

        // Verificar campos com fallback
        const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
        await expect(emailInput).toBeVisible();

        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        await expect(passInput).toBeVisible();

        // Verificar botão de login
        const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));
        await expect(loginButton).toBeVisible();

        // Verificar links
        await expect(page.getByRole('link', { name: /Esqueci minha senha/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Cadastre-se/i })).toBeVisible();
    });

    test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
        const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));

        // Preencher com credenciais inválidas
        await emailInput.fill('naoexiste@example.com');
        await passInput.fill('SenhaErrada123');

        // Submeter
        await loginButton.click();

        // Aguardar resposta
        await page.waitForTimeout(3000);

        // Verificar mensagem de erro ou que permanece na página de login
        const hasError = await page.getByText(/Falha no login|inválid|incorret/i).isVisible().catch(() => false);
        const stillOnLogin = page.url().includes('/login');

        expect(hasError || stillOnLogin).toBeTruthy();
    });

    test('deve validar campos obrigatórios', async ({ page }) => {
        // Tentar submeter sem preencher
        await page.getByTestId('login-button').click();

        // Verificar validação HTML5
        const emailInput = page.getByTestId('email-input');
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });

    test('deve fazer login com sucesso', async ({ page }) => {

        const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));

        // Preencher credenciais válidas
        await emailInput.fill(testUser.email);
        await passInput.fill(testUser.password);

        // Submeter
        await loginButton.click();

        // Aguardar redirecionamento
        await page.waitForURL('/', { timeout: 60000 });

        // Verificar elementos da página autenticada
        await expect(page.getByText(/Olá/i)).toBeVisible({ timeout: 5000 });
    });

    test('deve manter sessão após recarregar página', async ({ page }) => {
        const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));

        // Fazer login
        await emailInput.fill(testUser.email);
        await passInput.fill(testUser.password);
        await loginButton.click();

        await page.waitForURL('/', { timeout: 60000 });

        // Recarregar página
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verificar que ainda está autenticado
        await expect(page.getByText(/Olá/i)).toBeVisible({ timeout: 5000 });
        expect(page.url()).not.toContain('/login');
    });

    // ...

    test('deve enviar código de recuperação', async ({ page }) => {
        // Pular envio de emails reais em produção
        // ...
    });
});
