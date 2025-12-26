
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count({
        where: {
            image_url: {
                not: null
            }
        }
    });

    const total = await prisma.product.count();

    console.log(`Total items: ${total}`);
    console.log(`Items with image_url: ${count}`);

    const sample = await prisma.product.findFirst({
        where: { image_url: { not: null } }
    });

    if (sample) {
        console.log('Sample:', sample.name, sample.image_url);
    } else {
        console.log('No items with images yet.');
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
