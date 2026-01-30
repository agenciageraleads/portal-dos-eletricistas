import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Registro de Usuário
 * Valida o fluxo completo de cadastro de um novo eletricista
 * 
 * VERSÃO 3: Usando data-testid para seletores robustos
 * NOTA: O formulário tem 2 etapas (CPF check + dados completos)
 */

// Gerar dados únicos para cada execução do teste
const timestamp = Date.now();
const testUser = {
    name: 'João Silva Teste',
    email: `teste.joao.${timestamp}@example.com`,
    phone: '11987654321',
    phoneFormatted: '(11) 98765-4321',
    cpf: '12345678900',
    cpfFormatted: '123.456.789-00',
    password: 'Teste@123',
};

test.describe('Registro de Usuário', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test('deve exibir formulário de cadastro - Etapa 1 (CPF)', async ({ page }) => {
        // Verificar título com fallback
        const title = page.getByTestId('register-title').or(page.getByText('Cadastro Eletricista'));
        await expect(title).toBeVisible();

        // Verificar subtítulo com fallback
        const subtitle = page.getByTestId('register-subtitle').or(page.getByText(/Informe seu CPF para começar/i));
        await expect(subtitle).toBeVisible();

        // Verificar campo de CPF
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        await expect(cpfInput).toBeVisible();

        // Verificar botão continuar
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));
        await expect(continueBtn).toBeVisible();
    });

    test('deve validar CPF inválido na etapa 1', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));

        // Preencher CPF inválido
        await cpfInput.fill('111.111.111-11');

        // Aguardar validação client-side
        await page.waitForTimeout(500);

        // Verificar mensagem de erro
        await expect(page.getByText(/CPF inválido/i)).toBeVisible();

        // Verificar que botão está desabilitado
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));
        await expect(continueBtn).toBeDisabled();
    });

    test('deve avançar para etapa 2 com CPF válido', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Preencher CPF válido
        await cpfInput.fill(testUser.cpfFormatted);

        // Aguardar validação
        await page.waitForTimeout(500);

        // Clicar em continuar
        await continueBtn.click();

        // Aguardar carregar etapa 2
        await page.waitForTimeout(2000);

        // Verificar que avançou para etapa 2
        const subtitle = page.getByTestId('register-subtitle').or(page.getByText(/Complete seus dados/i));
        await expect(subtitle).toBeVisible();
    });

    test('deve exibir formulário completo na etapa 2', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Verificar todos os campos usando fallbacks
        await expect(page.getByTestId('name-input').or(page.locator('input').nth(1))).toBeVisible();
        await expect(page.getByTestId('email-input').or(page.locator('input[type="email"]'))).toBeVisible();
        await expect(page.getByTestId('phone-input').or(page.locator('input[type="tel"]'))).toBeVisible();
        await expect(page.getByTestId('password-input').or(page.locator('input[type="password"]'))).toBeVisible();

        // Verificar checkbox de termos
        await expect(page.getByTestId('terms-checkbox').or(page.locator('input[type="checkbox"]'))).toBeVisible();

        // Verificar botões
        await expect(page.getByTestId('back-button').or(page.getByText('Voltar'))).toBeVisible();
        await expect(page.getByTestId('submit-button').or(page.getByRole('button', { name: /Finalizar/i }))).toBeVisible();
    });

    test('deve ter link para termos de uso funcionando', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Verificar link de termos
        const termosLink = page.getByRole('link', { name: /Termos de Uso/i });
        await expect(termosLink).toBeVisible();
        await expect(termosLink).toHaveAttribute('href', /termos/);
    });

    test('deve ter link para página de login', async ({ page }) => {
        const loginLink = page.getByRole('link', { name: /Faça Login/i });
        await expect(loginLink).toBeVisible();
        await expect(loginLink).toHaveAttribute('href', /login/);
    });

    test('deve validar email inválido', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Preencher com email inválido
        const emailInput = page.getByTestId('email-input').or(page.locator('input[type="email"]'));
        await emailInput.fill('email-invalido');

        await page.getByTestId('name-input').or(page.locator('input').nth(1)).click(); // Trigger blur

        // Verificar validação HTML5
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });

    test('deve validar senha mínima', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Preencher senha muito curta
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        await passInput.fill('123');

        // Tentar submeter
        const submitBtn = page.getByTestId('submit-button').or(page.getByRole('button', { name: /Finalizar/i }));
        await submitBtn.click();

        // Verificar validação (minLength=6)
        const validationMessage = await passInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });

    test('deve exigir aceitação dos termos de uso', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Preencher todos os campos EXCETO checkbox de termos
        const nameInput = page.getByTestId('name-input').or(page.locator('input').nth(1));
        const emailInput = page.getByTestId('email-input').or(page.locator('input[type="email"]'));
        const phoneInput = page.getByTestId('phone-input').or(page.locator('input[type="tel"]'));
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));

        await nameInput.fill(testUser.name);
        await emailInput.fill(testUser.email);
        await phoneInput.fill(testUser.phoneFormatted);
        await passInput.fill(testUser.password);

        // Tentar submeter sem aceitar termos
        const submitBtn = page.getByTestId('submit-button').or(page.getByRole('button', { name: /Finalizar/i }));
        await submitBtn.click();

        // Aguardar possível toast de erro
        await page.waitForTimeout(1000);

        // Verificar que mostra mensagem ou permanece na mesma página
        const hasWarning = await page.getByText(/aceitar os Termos/i).isVisible().catch(() => false);
        const stillOnRegister = page.url().includes('/register');

        expect(hasWarning || stillOnRegister).toBeTruthy();
    });

    test('deve cadastrar novo usuário com sucesso', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Etapa 1: CPF
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Etapa 2: Dados completos
        const nameInput = page.getByTestId('name-input').or(page.locator('input').nth(1));
        const emailInput = page.getByTestId('email-input').or(page.locator('input[type="email"]'));
        const phoneInput = page.getByTestId('phone-input').or(page.locator('input[type="tel"]'));
        const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
        const termsCheck = page.getByTestId('terms-checkbox').or(page.locator('input[type="checkbox"]'));

        await nameInput.fill(testUser.name);
        await emailInput.fill(testUser.email);
        await phoneInput.fill(testUser.phoneFormatted);
        await passInput.fill(testUser.password);

        // Aceitar termos
        await termsCheck.check();

        // Submeter formulário
        const submitBtn = page.getByTestId('submit-button').or(page.getByRole('button', { name: /Finalizar/i }));
        await submitBtn.click();

        // Aguardar resposta do servidor
        await page.waitForTimeout(3000);

        // Verificar redirecionamento ou mensagem de sucesso
        const hasSuccess = await page.getByText(/sucesso|realizado/i).isVisible().catch(() => false);
        const redirectedToLogin = page.url().includes('/login');

        expect(hasSuccess || redirectedToLogin).toBeTruthy();
    });

    test('deve formatar campos automaticamente (telefone, CPF)', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));

        // Preencher CPF sem formatação
        await cpfInput.fill('12345678900');

        // Verificar que foi formatado
        await page.waitForTimeout(500);
        const cpfValue = await cpfInput.inputValue();
        expect(cpfValue).toContain('.'); // Deve ter pontos da formatação
        expect(cpfValue).toContain('-'); // Deve ter traço da formatação

        // Avançar para etapa 2
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Preencher telefone sem formatação
        const phoneInput = page.getByTestId('phone-input').or(page.locator('input[type="tel"]'));
        await phoneInput.fill('11987654321');

        // Verificar que foi formatado
        await page.waitForTimeout(500);
        const phoneValue = await phoneInput.inputValue();
        expect(phoneValue).toContain('('); // Deve ter parênteses
        expect(phoneValue).toContain(')'); // Deve ter parênteses
        expect(phoneValue).toContain('-'); // Deve ter traço
    });

    test('deve permitir voltar da etapa 2 para etapa 1', async ({ page }) => {
        const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
        const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

        // Avançar para etapa 2
        await cpfInput.fill(testUser.cpfFormatted);
        await page.waitForTimeout(500);
        await continueBtn.click();
        await page.waitForTimeout(2000);

        // Clicar em voltar
        const backBtn = page.getByTestId('back-button').or(page.getByText('Voltar'));
        await backBtn.click();
        await page.waitForTimeout(500);

        // Verificar que voltou para etapa 1
        const subtitle = page.getByTestId('register-subtitle').or(page.getByText(/Informe seu CPF para começar/i));
        await expect(subtitle).toBeVisible();
        await expect(cpfInput).toBeVisible();
    });
});
