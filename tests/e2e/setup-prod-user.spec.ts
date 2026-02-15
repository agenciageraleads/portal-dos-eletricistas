import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-user';

/**
 * Script de Automação: Criar Usuário de Teste em Produção
 * 
 * Este script tenta cadastrar o usuário padrão de testes (testUser).
 * Se o usuário já existir (conflito de CPF/Email), ele considera sucesso.
 */

test('setup: garantir usuário de teste em produção', async ({ page }) => {
    // 1. Tentar Login Primeiro
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
    const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
    const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));

    await emailInput.fill(testUser.email);
    await passInput.fill(testUser.password);
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Se logou com sucesso, fim do script
    if (await page.getByText(/Olá/i).isVisible().catch(() => false) || page.url() === process.env.TEST_URL + '/') {
        console.log('Usuário já existe e login funcionou.');
        return;
    }

    console.log('Login falhou, iniciando cadastro...');

    // 2. Iniciar Cadastro
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Etapa 1: CPF
    const cpfInput = page.getByTestId('cpf-input').or(page.getByPlaceholder('000.000.000-00'));
    const continueBtn = page.getByTestId('continue-button').or(page.getByRole('button', { name: /Continuar/i }));

    await cpfInput.fill(testUser.cpfFormatted);
    await page.waitForTimeout(1000);
    await continueBtn.click();
    await page.waitForTimeout(2000);

    // Verificar se deu erro de CPF já cadastrado (mas login falhou por senha errada talvez?)
    const cpfError = await page.getByText(/CPF já cadastrado/i).isVisible().catch(() => false);
    if (cpfError) {
        console.log('CPF já existe, mas login falhou. Verifique a senha no fixtures/test-user.ts');
        // Não podemos fazer nada aqui sem resetar senha manually
        return;
    }

    // Etapa 2: Dados Completos
    console.log('Aguardando campos da etapa 2...');
    await page.waitForTimeout(1000);

    // Usar seletores mais específicos baseados nos placeholders visíveis no screenshot
    const nameInput = page.getByPlaceholder(/Informe seu nome completo/i);
    const emailInputReg = page.getByPlaceholder(/seu@email.com/i);
    const phoneInput = page.getByPlaceholder(/\(11\) 99999-9999/i);
    const passInputReg = page.locator('input[type="password"]');
    const termsCheck = page.locator('input[type="checkbox"]');

    // Verificar se os campos estão visíveis
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    console.log('Preenchendo nome...');
    await nameInput.click();
    await nameInput.fill(testUser.name);
    await page.waitForTimeout(300);

    console.log('Preenchendo email...');
    await emailInputReg.click();
    await emailInputReg.fill(testUser.email);
    await page.waitForTimeout(300);

    console.log('Preenchendo telefone...');
    await phoneInput.click();
    await phoneInput.clear(); // Limpar primeiro
    await phoneInput.pressSequentially(testUser.phoneFormatted, { delay: 50 }); // Digitar com delay
    await page.waitForTimeout(500);

    console.log('Preenchendo senha...');
    await passInputReg.click();
    await passInputReg.fill(testUser.password);
    await page.waitForTimeout(300);

    // Check termos
    console.log('Aceitando termos...');
    await termsCheck.click(); // Usar click ao invés de check
    await page.waitForTimeout(500);

    // Verificar se foi marcado
    const isChecked = await termsCheck.isChecked();
    console.log('Checkbox marcado?', isChecked);
    if (!isChecked) {
        console.log('Tentando marcar novamente...');
        await termsCheck.click();
        await page.waitForTimeout(300);
    }

    console.log('Submetendo formulário...');
    const submitBtn = page.getByRole('button', { name: /Finalizar Cadastro/i });
    await submitBtn.click();

    // Aguardar resposta
    await page.waitForTimeout(5000);

    // Verificar erros na tela
    const errorMsg = await page.locator('.text-red-500, [role="alert"]').textContent().catch(() => null);
    if (errorMsg) {
        console.log('Erro encontrado na tela:', errorMsg);
    }

    const success = await page.getByText(/sucesso|realizado/i).isVisible().catch(() => false) || page.url().includes('/login');

    if (!success) {
        console.log('URL atual:', page.url());
        const bodyText = await page.locator('body').textContent();
        console.log('Conteúdo da página:', bodyText?.substring(0, 500));
    }

    expect(success).toBeTruthy();
    console.log('Usuário cadastrado com sucesso!');
});
