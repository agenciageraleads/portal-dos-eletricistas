
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.budget.count();
    console.log('Total Budgets:', count);

    if (count > 0) {
        const lastBudget = await prisma.budget.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { items: true, user: true }
        });
        console.log('Last Budget:', JSON.stringify(lastBudget, null, 2));
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
