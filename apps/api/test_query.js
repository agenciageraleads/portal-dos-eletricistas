
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const type = 'SERVICE';
    const where = {
        is_available: true,
        price: { gt: 0 },
        type: { equals: type }
    };

    console.log('Testing with where:', JSON.stringify(where));

    const data = await prisma.product.findMany({
        where,
        take: 20
    });

    console.log(`Found ${data.length} products with this filter.`);
    if (data.length > 0) {
        console.log('First match:', data[0].name);
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());
