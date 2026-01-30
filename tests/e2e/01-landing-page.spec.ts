import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Landing Page
 * Valida a primeira impressão do usuário não autenticado
 */

test.describe('Landing Page - Primeira Impressão', () => {

    test.beforeEach(async ({ page }) => {
        // Navegar para a página inicial antes de cada teste
        await page.goto('/');
    });

    test('deve exibir o logo e título corretamente', async ({ page }) => {
        // Verificar título da página
        await expect(page).toHaveTitle(/Portal dos Eletricistas/);

        // Verificar presença do logo/nome do portal
        const portalName = page.getByText(/PortalEletricista/i);
        await expect(portalName).toBeVisible();
    });

    test('deve exibir mensagem de boas-vindas para usuários não autenticados', async ({ page }) => {
        // Verificar mensagem de boas-vindas
        await expect(page.getByText(/Bem-vindo ao Portal!/i)).toBeVisible();
        await expect(page.getByText(/A ferramenta completa para eletricistas profissionais/i)).toBeVisible();
    });

    test('deve exibir botões de autenticação (Entrar e Cadastrar)', async ({ page }) => {
        // Verificar botão "Entrar"
        const loginButton = page.getByRole('link', { name: /Entrar/i });
        await expect(loginButton).toBeVisible();
        await expect(loginButton).toHaveAttribute('href', /login/);

        // Verificar botão "Cadastrar Grátis"
        const registerButton = page.getByRole('link', { name: /Cadastrar Grátis/i });
        await expect(registerButton).toBeVisible();
        await expect(registerButton).toHaveAttribute('href', /register/);
    });

    test('deve exibir seção de Acesso Rápido com 4 cards', async ({ page }) => {
        // Verificar título da seção
        await expect(page.getByText(/Acesso Rápido/i)).toBeVisible();

        // Verificar cada card
        await expect(page.getByText(/Novo Orçamento/i)).toBeVisible();
        await expect(page.getByText(/Meus Orçamentos/i)).toBeVisible();
        await expect(page.getByText(/Catálogo/i)).toBeVisible();
        await expect(page.getByText(/Calculadoras/i)).toBeVisible();
    });

    test('NÃO deve exibir card de instalação PWA (conforme solicitado)', async ({ page }) => {
        // Verificar que o card de PWA está oculto
        const pwaCard = page.getByText(/Instale o App e ganhe acesso offline/i);
        await expect(pwaCard).not.toBeVisible();
    });

    test('deve exibir seção "Outros Serviços" com badge "Em Breve"', async ({ page }) => {
        await expect(page.getByText(/Outros Serviços/i)).toBeVisible();
        await expect(page.getByText(/Em Breve/i)).toBeVisible();
    });

    test('deve ter navegação responsiva (bottom nav em mobile)', async ({ page }) => {
        // Este teste será mais relevante em viewport mobile
        // Verificar presença de elementos de navegação
        const navigation = page.locator('nav');
        await expect(navigation).toBeVisible();
    });

    test('deve permitir navegação para página de cadastro', async ({ page }) => {
        // Clicar no botão "Cadastrar Grátis"
        await page.getByRole('link', { name: /Cadastrar Grátis/i }).click();

        // Verificar redirecionamento
        await expect(page).toHaveURL(/register/);
        await expect(page.getByText(/Cadastro/i)).toBeVisible();
    });

    test('deve permitir navegação para página de login', async ({ page }) => {
        // Clicar no botão "Entrar"
        await page.getByRole('link', { name: /Entrar/i }).click();

        // Verificar redirecionamento
        await expect(page).toHaveURL(/login/);
        await expect(page.getByText(/Login/i)).toBeVisible();
    });

    test('deve carregar a página em menos de 3 segundos', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Verificar que carregou em menos de 3 segundos
        expect(loadTime).toBeLessThan(3000);
    });
});
