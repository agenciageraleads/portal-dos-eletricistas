const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Standard Services...');

    const services = [
        { name: 'Instalação de Chuveiro', price: 150.00, category: 'Instalação', type: 'SERVICE', description: 'Instalação completa de chuveiro elétrico, incluindo conexões.' },
        { name: 'Troca de Tomada', price: 50.00, category: 'Manutenção', type: 'SERVICE', description: 'Substituição de tomada antiga por novo padrão.' },
        { name: 'Instalação de Ventilador de Teto', price: 200.00, category: 'Instalação', type: 'SERVICE', description: 'Montagem e instalação de ventilador de teto com controle.' },
        { name: 'Ponto de Iluminação', price: 80.00, category: 'Instalação', type: 'SERVICE', description: 'Criação ou manutenção de ponto de luz.' },
        { name: 'Visita Técnica', price: 100.00, category: 'Avaliação', type: 'SERVICE', description: 'Visita para orçamento e avaliação técnica.' },
        { name: 'Troca de Disjuntor', price: 120.00, category: 'Quadro de Força', type: 'SERVICE', description: 'Substituição de disjuntor danificado.' },
        { name: 'Instalação de Ar Condicionado (Split)', price: 450.00, category: 'Climatização', type: 'SERVICE', description: 'Mão de obra para instalação de ar condicionado split.' }
    ];

    for (const s of services) {
        const exists = await prisma.product.findFirst({
            where: { name: s.name, type: 'SERVICE' }
        });

        if (!exists) {
            await prisma.product.create({
                data: {
                    name: s.name,
                    price: s.price,
                    category: s.category,
                    type: 'SERVICE',
                    description: s.description,
                    is_available: true,
                    popularity_index: 0,
                    sankhya_code: Math.floor(Math.random() * 1000000) // Dummy code
                }
            });
            console.log(`Created: ${s.name}`);
        } else {
            console.log(`Skipped (Exists): ${s.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
