#!/usr/bin/env ts-node

/**
 * Script para criar usuário de teste E2E
 * Executa antes dos testes para garantir que o usuário existe
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const testUser = {
    name: 'Usuário de Teste E2E',
    email: 'teste.e2e@portaleletricos.com.br',
    cpf_cnpj: '12345678900',
    phone: '11999999999',
    password: 'Teste@E2E123',
    termsAccepted: true,
};

async function createTestUser() {
    console.log('🔧 Criando usuário de teste E2E...');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Senha: ${testUser.password}`);

    try {
        // Tentar registrar o usuário
        const response = await axios.post(`${API_URL}/auth/register`, testUser);

        console.log('✅ Usuário criado com sucesso!');
        console.log('📝 Dados:', response.data);

        return true;
    } catch (error: any) {
        if (error.response?.status === 409) {
            console.log('ℹ️  Usuário já existe - OK para testes');
            return true;
        }

        console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
        return false;
    }
}

async function verifyLogin() {
    console.log('\n🔐 Verificando login...');

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username: testUser.email,
            password: testUser.password,
        });

        console.log('✅ Login funcionando!');
        console.log('🎫 Token recebido');

        return true;
    } catch (error: any) {
        console.error('❌ Erro no login:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Setup de Testes E2E\n');
    console.log(`🌐 API URL: ${API_URL}\n`);

    const created = await createTestUser();

    if (!created) {
        console.error('\n❌ Falha ao criar usuário de teste');
        process.exit(1);
    }

    const loginOk = await verifyLogin();

    if (!loginOk) {
        console.error('\n❌ Falha ao verificar login');
        process.exit(1);
    }

    console.log('\n✅ Setup concluído com sucesso!');
    console.log('\n📝 Use estas credenciais nos testes:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Senha: ${testUser.password}`);
}

main();
