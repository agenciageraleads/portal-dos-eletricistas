import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3333';

async function testPreRegistrationFlow() {
    console.log('🧪 TESTE: Fluxo de Pré-Cadastro\n');

    try {
        // 1. Testar conexão com Sankhya
        console.log('1️⃣ Testando conexão com Sankhya...');
        const sankhyaTest = await axios.get(`${API_URL}/admin/sync/test`);
        console.log(`   ✅ ${sankhyaTest.data.message}\n`);

        // 2. Sincronizar top 5 eletricistas (teste)
        console.log('2️⃣ Sincronizando top 5 eletricistas...');
        const syncResult = await axios.post(`${API_URL}/admin/sync/electricians?limit=5`);
        console.log(`   ✅ Criados: ${syncResult.data.created}`);
        console.log(`   🔄 Atualizados: ${syncResult.data.updated}`);
        console.log(`   ⏭️  Pulados: ${syncResult.data.skipped}`);
        console.log(`   ⏱️  Duração: ${syncResult.data.duration}\n`);

        // 3. Verificar pré-cadastros no banco
        console.log('3️⃣ Verificando pré-cadastros no banco...');
        const preRegistered = await prisma.user.findMany({
            where: {
                pre_cadastrado: true,
                cadastro_finalizado: false
            },
            select: {
                name: true,
                cpf_cnpj: true,
                phone: true,
                city: true,
                state: true,
                commercial_index: true,
                isAvailableForWork: true
            },
            take: 5
        });

        console.log(`   📊 Total de pré-cadastros: ${preRegistered.length}`);
        preRegistered.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} - ${user.city}/${user.state}`);
            console.log(`      CPF: ${user.cpf_cnpj}`);
            console.log(`      WhatsApp: ${user.phone || 'N/A'}`);
            console.log(`      Índice Comercial: ${user.commercial_index}`);
            console.log(`      Disponível: ${user.isAvailableForWork ? 'Sim' : 'Não'}\n`);
        });

        // 4. Testar check-registration
        if (preRegistered.length > 0) {
            const testCpf = preRegistered[0].cpf_cnpj;
            console.log(`4️⃣ Testando check-registration com CPF: ${testCpf}`);
            const checkResult = await axios.get(`${API_URL}/auth/check-registration/${testCpf}`);
            console.log(`   ✅ Existe: ${checkResult.data.exists}`);
            console.log(`   📝 Pré-cadastrado: ${checkResult.data.pre_cadastrado}`);
            console.log(`   ✔️  Finalizado: ${checkResult.data.cadastro_finalizado}\n`);
        }

        // 5. Testar Evolution API (se configurada)
        if (process.env.EVOLUTION_API_KEY) {
            console.log('5️⃣ Testando Evolution API...');
            const testPhone = preRegistered.find(u => u.phone)?.phone;
            if (testPhone) {
                console.log(`   📞 Buscando foto para: ${testPhone}`);
                // Implementar quando o endpoint estiver pronto
                console.log(`   ⏳ Implementação pendente\n`);
            } else {
                console.log(`   ⚠️  Nenhum telefone disponível para teste\n`);
            }
        }

        console.log('✅ TODOS OS TESTES PASSARAM!\n');

    } catch (error: any) {
        console.error('❌ ERRO NO TESTE:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testPreRegistrationFlow();
