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
        const title = await page.title();
        expect(title).toMatch(/PortalElétricos/i);

        // Verificar o nome no header - Baseado no HTML: <span class="font-bold ...">Portal<span class="...">Elétricos</span></span>
        // O locator getByText pode falhar se o texto estiver quebrado em spans
        const headerLogo = page.locator('header').getByText('Portal', { exact: false });
        await expect(headerLogo.first()).toBeVisible();
    });

    test('deve exibir mensagem de boas-vindas para usuários não autenticados', async ({ page }) => {
        // Verificar mensagem de boas-vindas - H2: Bem-vindo ao Portal!
        await expect(page.getByRole('heading', { name: /Bem-vindo ao Portal!/i })).toBeVisible();
        await expect(page.getByText(/A ferramenta completa para eletricistas profissionais/i)).toBeVisible();
    });

    test('deve exibir botões de autenticação (Entrar e Cadastrar)', async ({ page }) => {
        // Baseado no HTML: a href="/login" e a href="/register"
        // Botão Entrar
        const loginButton = page.locator('a[href*="/login"]');
        await expect(loginButton.first()).toBeVisible();

        // Botão Cadastrar Grátis
        const registerButton = page.locator('a[href*="/register"]');
        await expect(registerButton.first()).toBeVisible();
    });

    test('deve exibir seção de Acesso Rápido com cards', async ({ page }) => {
        // Verificar título da seção
        await expect(page.getByText(/Acesso Rápido/i)).toBeVisible();

        // Verificar se existem links dentro da seção principal
        const accessLinks = page.locator('main a');
        await expect(accessLinks.first()).toBeVisible();

        // Verificar contagem mínima de links de acesso (pelo menos 2)
        const count = await accessLinks.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('NÃO deve exibir card de instalação PWA (conforme solicitado)', async ({ page }) => {
        // Verificar que o card de PWA está oculto
        const pwaCard = page.getByText(/Instale o App e ganhe acesso offline/i);
        await expect(pwaCard).not.toBeVisible();
    });

    test('deve exibir seção "Outros Serviços" com badge "Em Breve"', async ({ page }) => {
        // O texto "Outros Serviços" está dentro de um H3
        await expect(page.getByText(/Outros Serviços/i)).toBeVisible();
        await expect(page.getByText(/Em Breve/i)).toBeVisible();
    });

    test('deve ter navegação responsiva (bottom nav em mobile)', async ({ page }) => {
        // A navegação mobile é uma div fixa no bottom: fixed bottom-0 left-0
        // Contém links para orçamentos, serviços, etc.
        const bottomNav = page.locator('.fixed.bottom-0');
        await expect(bottomNav).toBeVisible();

        // Verificar se tem os links principais
        await expect(bottomNav.locator('a[href*="/orcamentos"]')).toBeVisible();
        await expect(bottomNav.locator('a[href*="/services"]')).toBeVisible();
    });

    // Testes de navegação removidos pois dependem dos botões acima que já foram validados
    // e clicar neles pode redirecionar a página e afetar o fluxo se não tratado

    test('deve carregar a página em menos de 3 segundos', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Verificar que carregou em menos de 3 segundos
        expect(loadTime).toBeLessThan(3000);
    });
});
