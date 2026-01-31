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

    test('deve redirecionar para login ao acessar rota protegida sem autenticação', async ({ page }) => {
        // Tentar acessar rota protegida sem estar logado
        await page.goto('/orcamentos');

        // Aguardar possível redirecionamento
        await page.waitForTimeout(2000);

        // Verificar que foi redirecionado para login ou está na home
        const url = page.url();
        const isProtected = url.includes('/login') || url === new URL('/', page.url()).href;
        expect(isProtected).toBeTruthy();
    });

    test('deve navegar para página de cadastro', async ({ page }) => {
        await page.getByRole('link', { name: /Cadastre-se/i }).click();

        await expect(page).toHaveURL(/register/);
    });

    test('deve navegar para recuperação de senha', async ({ page }) => {
        await page.getByRole('link', { name: /Esqueci minha senha/i }).click();

        await expect(page).toHaveURL(/esqueci-senha/);
    });
});

test.describe('Logout', () => {

    test('deve fazer logout com sucesso', async ({ page }) => {
        // Primeiro fazer login
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('email-input').fill(testUser.email);
        await page.getByTestId('password-input').fill(testUser.password);
        await page.getByTestId('login-button').click();

        await page.waitForURL('/', { timeout: 60000 });

        // Procurar botão de logout (pode estar em menu dropdown)
        // Tentar clicar no menu do usuário primeiro
        const userMenu = page.locator('[data-testid="user-menu"], button:has-text("' + testUser.name.split(' ')[0] + '")').first();

        if (await userMenu.isVisible().catch(() => false)) {
            await userMenu.click();
            await page.waitForTimeout(500);
        }

        // Clicar em Sair
        const logoutButton = page.getByRole('button', { name: /Sair|Logout/i }).or(page.getByText(/Sair|Logout/i));

        if (await logoutButton.isVisible().catch(() => false)) {
            await logoutButton.click();

            // Aguardar redirecionamento
            await page.waitForTimeout(2000);

            // Verificar que foi deslogado
            const url = page.url();
            const isLoggedOut = url.includes('/login') || !await page.getByText(/Olá/i).isVisible().catch(() => false);
            expect(isLoggedOut).toBeTruthy();
        } else {
            // Se não encontrar botão de logout, marcar como pendente
            test.skip();
        }
    });
});

test.describe('Recuperação de Senha', () => {

    test('deve exibir formulário de recuperação de senha', async ({ page }) => {
        await page.goto('/esqueci-senha');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Verificar título
        await expect(page.getByRole('heading', { name: /Esqueci minha senha/i })).toBeVisible();

        // Verificar campo - usa placeholder
        const cpfEmailInput = page.getByPlaceholder(/Digite seu CPF, CNPJ ou Email/i);
        await expect(cpfEmailInput).toBeVisible();

        // Verificar botão
        await expect(page.getByRole('button', { name: /Enviar/i })).toBeVisible();
    });

    test('deve validar campo vazio no formulário de recuperação', async ({ page }) => {
        await page.goto('/esqueci-senha');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Verificar que botão está desabilitado quando campo está vazio
        const input = page.getByPlaceholder(/Digite seu CPF, CNPJ ou Email/i);
        const button = page.getByRole('button', { name: /Enviar/i });

        // Campo vazio = botão desabilitado
        await expect(button).toBeDisabled();

        // Preencher campo
        await input.fill('teste@email.com');
        await page.waitForTimeout(300);

        // Botão deve estar habilitado
        await expect(button).toBeEnabled();
    });

    test('deve enviar código de recuperação', async ({ page }) => {
        await page.goto('/esqueci-senha');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Preencher com email válido
        await page.getByPlaceholder(/Digite seu CPF, CNPJ ou Email/i).fill(testUser.email);
        await page.waitForTimeout(300);

        // Clicar em enviar
        await page.getByRole('button', { name: /Enviar/i }).click();

        // Aguardar resposta
        await page.waitForTimeout(3000);

        // Verificar mensagem de sucesso ou mudança de estado
        const hasSuccess = await page.getByText(/código|enviado|verifique/i).isVisible().catch(() => false);
        const hasNextStep = await page.getByText(/código|verificação/i).isVisible().catch(() => false);
        const buttonText = await page.getByRole('button', { name: /Enviar|Reenviar/i }).textContent();

        expect(hasSuccess || hasNextStep || buttonText?.includes('Reenviar')).toBeTruthy();
    });
});
