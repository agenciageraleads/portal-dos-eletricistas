const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count({
        where: { type: 'SERVICE' }
    });
    console.log('Service Count:', count);

    const services = await prisma.product.findMany({
        where: { type: 'SERVICE' },
        take: 5
    });
    console.log('Sample Services:', services);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
