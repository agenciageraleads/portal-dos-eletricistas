const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: 'Disjuntor',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            name: true,
            sankhya_code: true
        }
    });

    console.log('--- Disjuntores no Banco ---');
    products.forEach(p => console.log(`${p.sankhya_code}: ${p.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
