
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Searching for 'LUM' + 'QUAD' + 'EMB'...");
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'LUM' }
        }
    });

    // Client side filter
    const matches = products.filter(p =>
        p.name.includes('QUAD') && p.name.includes('EMB')
    );

    console.log("Matches found:", matches.length);
    matches.forEach(p => console.log(`- ${p.name}`));
}
main().finally(() => prisma.$disconnect());
