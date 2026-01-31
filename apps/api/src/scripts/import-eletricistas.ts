
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const mockData = [
    {
        name: 'Roberto Silva (Eletricista)',
        cpf_cnpj: '11122233344',
        phone: '(11) 98888-7777',
        email: 'roberto@pre-cadastro.com'
    },
    {
        name: 'Marcos Oliveira Instalações',
        cpf_cnpj: '22233344455',
        phone: '(11) 97777-6666',
        email: 'marcos@pre-cadastro.com'
    },
    {
        name: 'Suporte Elétrico Express',
        cpf_cnpj: '33344455566',
        phone: '(11) 96666-5555',
        email: 'suporte@pre-cadastro.com'
    }
];

async function main() {
    console.log('🚀 Iniciando importação de eletricistas...');

    let count = 0;
    let skipped = 0;

    for (const item of mockData) {
        const cleanCpf = item.cpf_cnpj.replace(/\D/g, '');

        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { cpf_cnpj: cleanCpf },
                    { email: item.email }
                ]
            }
        });

        if (existing) {
            console.log(`⚠️ Pulando ${item.name} - CPF ou Email já existe.`);
            skipped++;
            continue;
        }

        // Pré-cadastro usa uma senha aleatória que ninguém conhece
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

        await prisma.user.create({
            data: {
                name: item.name,
                cpf_cnpj: cleanCpf,
                phone: item.phone,
                email: item.email,
                password: tempPassword,
                role: 'ELETRICISTA',
                pre_cadastrado: true,
                cadastro_finalizado: false,
                registration_origin: 'IMPORTED'
            }
        });

        console.log(`✅ Importado: ${item.name}`);
        count++;
    }

    console.log(`\n🎉 Importação concluída!`);
    console.log(`📈 Total Importados: ${count}`);
    console.log(`⏭️ Total Ignorados: ${skipped}`);
}

main()
    .catch((e) => {
        console.error('❌ Erro na importação:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
