import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'lucasborgessb@gmail.com';

    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User ${email} not found!`);
        process.exit(1);
    }

    console.log(`Current role: ${user.role}`);

    if (user.role === 'ADMIN') {
        console.log('User is already ADMIN.');
    } else {
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`User ${email} promoted to ADMIN successfully!`);
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
