import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Portal dos Eletricistas
 */
export default defineConfig({
    // Diretório onde ficam os testes
    testDir: './tests/e2e',

    // Timeout para cada teste (90 segundos)
    timeout: 90 * 1000,

    // Executar testes em paralelo
    fullyParallel: true,

    // Falhar build se houver testes com .only
    forbidOnly: !!process.env.CI,

    // Número de tentativas em caso de falha
    retries: process.env.CI ? 2 : 0,

    // Número de workers (processos paralelos)
    workers: process.env.CI ? 1 : undefined,

    // Reporter - formato dos resultados
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
        ['json', { outputFile: 'test-results.json' }]
    ],

    // Configurações compartilhadas entre todos os testes
    use: {
        // URL base para os testes
        baseURL: process.env.TEST_URL || 'https://beta.portaleletricos.com.br',

        // Capturar screenshot apenas em falhas
        screenshot: 'only-on-failure',

        // Capturar vídeo apenas em falhas
        video: 'retain-on-failure',

        // Trace (debug detalhado) apenas em falhas
        trace: 'on-first-retry',

        // Timeout para ações (cliques, preenchimentos, etc)
        actionTimeout: 10 * 1000,

        // Timeout para navegação
        navigationTimeout: 15 * 1000,
    },

    // Configuração de diferentes browsers/dispositivos
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Testes Mobile
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },

        // Tablet
        {
            name: 'iPad',
            use: { ...devices['iPad Pro'] },
        },
    ],

    // Servidor web local (opcional - para testes locais)
    // webServer: {
    //   command: 'npm run dev',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
