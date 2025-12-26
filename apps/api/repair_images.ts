
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const imagesPath = path.resolve(__dirname, '../web/public/products');

async function main() {
    console.log('Checking images in:', imagesPath);

    if (!fs.existsSync(imagesPath)) {
        console.error('Images path does not exist!');
        return;
    }

    const products = await prisma.product.findMany({
        where: {
            image_url: {
                not: null
            }
        }
    });

    console.log(`Found ${products.length} products with images in DB.`);

    let fixed = 0;

    for (const p of products) {
        if (!p.sankhya_code) continue;

        const filename = `${p.sankhya_code}.webp`;
        const filepath = path.join(imagesPath, filename);

        if (!fs.existsSync(filepath)) {
            // Fix it
            await prisma.product.update({
                where: { id: p.id },
                data: { image_url: null }
            });
            fixed++;
            if (fixed % 100 === 0) process.stdout.write('.');
        }
    }

    console.log(`\nFinished! Fixed ${fixed} products (removed broken image_url).`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
