
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
    { name: 'Instalação de Tomada Simples', price: 45.00, category: 'Elétrica', sankhya_code: 9001 },
    { name: 'Instalação de Tomada Dupla', price: 55.00, category: 'Elétrica', sankhya_code: 9002 },
    { name: 'Instalação de Interruptor Simples', price: 40.00, category: 'Iluminação', sankhya_code: 9003 },
    { name: 'Instalação de Chuveiro Elétrico', price: 90.00, category: 'Hidráulica/Elétrica', sankhya_code: 9004 },
    { name: 'Troca de Resistência de Chuveiro', price: 50.00, category: 'Hidráulica/Elétrica', sankhya_code: 9005 },
    { name: 'Instalação de Ventilador de Teto', price: 120.00, category: 'Climatização', sankhya_code: 9006 },
    { name: 'Instalação de Luminária Simples', price: 60.00, category: 'Iluminação', sankhya_code: 9007 },
    { name: 'Instalação de Lustre', price: 150.00, category: 'Iluminação', sankhya_code: 9008 },
    { name: 'Padrão de Entrada Monofásico', price: 800.00, category: 'Infraestrutura', sankhya_code: 9009 },
    { name: 'Padrão de Entrada Bifásico', price: 1200.00, category: 'Infraestrutura', sankhya_code: 9010 },
    { name: 'Instalação de Disjuntor', price: 35.00, category: 'Quadro de Distribuição', sankhya_code: 9011 },
    { name: 'Troca de Fiação (por ponto)', price: 70.00, category: 'Infraestrutura', sankhya_code: 9012 },
    { name: 'Instalação de Sensor de Presença', price: 65.00, category: 'Automação', sankhya_code: 9013 },
    { name: 'Instalação de Fotocélula', price: 60.00, category: 'Automação', sankhya_code: 9014 },
    { name: 'Aterramento (Haste)', price: 180.00, category: 'Segurança', sankhya_code: 9015 },
];

async function main() {
    console.log('Populando serviços padrão...');

    for (const service of services) {
        await prisma.product.upsert({
            where: { sankhya_code: service.sankhya_code },
            update: {
                name: service.name,
                price: service.price,
                category: service.category,
                type: 'SERVICE',
                is_available: true,
                popularity_index: 0
            },
            create: {
                name: service.name,
                price: service.price,
                category: service.category,
                description: 'Serviço padrão (valor de mão de obra sugerido)',
                image_url: 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png', // Placeholder
                sankhya_code: service.sankhya_code,
                type: 'SERVICE',
                is_available: true,
                unit: 'UN',
                popularity_index: 0
            }
        });
        console.log(`Upserted: ${service.name}`);
    }

    console.log('Concluído!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
