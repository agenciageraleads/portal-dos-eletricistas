
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const p = await prisma.product.findUnique({
        where: { sankhya_code: 12351 }
    });
    console.log(p);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
