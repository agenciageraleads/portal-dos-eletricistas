import { test as base } from '@playwright/test';

/**
 * Fixture de usuário de teste
 * Credenciais válidas para usar nos testes E2E
 */

export const testUser = {
    // Usuário principal para testes
    email: 'teste.e2e@portaleletricos.com.br',
    cpf: '12345678900', // CPF de teste (sem formatação)
    cpfFormatted: '123.456.789-00',
    password: 'Teste@E2E123',
    name: 'Usuário de Teste E2E',
    phone: '11999999999',
    phoneFormatted: '(11) 99999-9999',
};

// Usuário alternativo para testes de duplicação
export const alternativeUser = {
    email: 'teste.alternativo@portaleletricos.com.br',
    cpf: '98765432100',
    cpfFormatted: '987.654.321-00',
    password: 'Teste@Alt123',
    name: 'Usuário Alternativo',
    phone: '11988888888',
    phoneFormatted: '(11) 98888-8888',
};

/**
 * Helper para fazer login
 * Reutilizável em todos os testes que precisam de autenticação
 */
export async function loginAsTestUser(page: any) {
    await page.goto('/login');

    // Aguardar página carregar completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Preencher formulário usando data-testid OU fallback
    const emailInput = page.getByTestId('email-input').or(page.getByPlaceholder(/email ou cpf/i));
    const passInput = page.getByTestId('password-input').or(page.locator('input[type="password"]'));
    const loginButton = page.getByTestId('login-button').or(page.getByRole('button', { name: /Entrar/i }));

    await emailInput.fill(testUser.email);
    await passInput.fill(testUser.password);

    // Submeter
    await loginButton.click();

    // Aguardar redirecionamento
    await page.waitForURL('/', { timeout: 60000 });

    // Aguardar elementos da home autenticada
    await page.waitForTimeout(2000);
}

/**
 * Fixture customizada com usuário logado
 */
export const test = base.extend({
    authenticatedPage: async ({ page }, use) => {
        await loginAsTestUser(page);
        await use(page);
    },
});

export { expect } from '@playwright/test';
