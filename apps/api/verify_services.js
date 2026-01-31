
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const services = await prisma.product.findMany({
        where: { type: 'SERVICE' }
    });
    console.log(`Found ${services.length} services.`);
    if (services.length > 0) {
        console.log('Sample service:', services[0]);
    }

    const zeroPrice = await prisma.product.count({
        where: { type: 'SERVICE', price: 0 }
    });
    console.log(`Services with price 0: ${zeroPrice}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
