const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const services = [
    { name: 'Instalação de Tomada Simples', price: 35.00, category: 'Instalações' },
    { name: 'Instalação de Interruptor Simples', price: 35.00, category: 'Instalações' },
    { name: 'Instalação de Tomada Dupla', price: 45.00, category: 'Instalações' },
    { name: 'Instalação de Luminária/Plafon', price: 60.00, category: 'Iluminação' },
    { name: 'Instalação de Lustre/Pendente', price: 120.00, category: 'Iluminação' },
    { name: 'Instalação de Ventilador de Teto', price: 150.00, category: 'Climatização' },
    { name: 'Instalação de Chuveiro Elétrico', price: 80.00, category: 'Instalações' },
    { name: 'Troca de Disjuntor (unidade)', price: 50.00, category: 'Quadro de Distribuição' },
    { name: 'Troca de Resistência de Chuveiro', price: 40.00, category: 'Manutenção' },
    { name: 'Instalação de Sensor de Presença', price: 60.00, category: 'Automação' },
    { name: 'Ponto de Energia (Completo)', price: 120.00, category: 'Infraestrutura' },
    { name: 'Visita Técnica / Diagnóstico', price: 100.00, category: 'Serviços Gerais' },
];

async function main() {
    console.log('Seeding Services...');

    for (const service of services) {
        // Check if exists to avoid duplicates
        const exists = await prisma.product.findFirst({
            where: {
                name: service.name,
                type: 'SERVICE'
            }
        });

        if (!exists) {
            await prisma.product.create({
                data: {
                    name: service.name,
                    price: service.price,
                    type: 'SERVICE',
                    category: service.category,
                    sankhya_code: Math.floor(Math.random() * 900000) + 100000, // Fake code for compatibility
                    description: 'Serviço padronizado (Mão de Obra)',
                    unit: 'UN',
                    is_available: true,
                    image_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' // Generic Tool Icon
                }
            });
            console.log(`Created: ${service.name}`);
        } else {
            console.log(`Skipped: ${service.name} (Exists)`);
        }
    }
    console.log('Done!');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
