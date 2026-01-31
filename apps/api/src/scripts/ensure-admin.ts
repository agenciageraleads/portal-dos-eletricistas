
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'lucasborgessb@gmail.com';
    const adminCpf = '03312918197';

    console.log(`Checking for user with email ${adminEmail} or CPF ${adminCpf}...`);

    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: adminEmail },
                { cpf_cnpj: adminCpf }
            ]
        }
    });

    if (user) {
        console.log(`User found: ${user.name} (${user.id}). Updating to ADMIN role...`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'ADMIN',
                email: adminEmail, // Ensure email matches
                cpf_cnpj: adminCpf // Ensure CPF matches
            }
        });
        console.log('User updated successfully.');
    } else {
        console.log('User not found. Creating new ADMIN user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Lucas Borges',
                email: adminEmail,
                cpf_cnpj: adminCpf,
                password: hashedPassword,
                role: 'ADMIN',
                phone: '11999999999', // Placeholder
                pre_cadastrado: false,
                cadastro_finalizado: true
            }
        });
        console.log('Admin user created successfully.');
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
