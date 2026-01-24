import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env manualmente para garantir
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient(); // Pega URL do env automaticamente

async function main() {
    console.log('🌱 Iniciando Seed...');

    // 1. Criar Eletricista de Teste
    const eletricista = await prisma.user.upsert({
        where: { email: 'eletricista@teste.com' },
        update: {},
        create: {
            email: 'eletricista@teste.com',
            name: 'João da Silva Eletricista',
            password: 'hashed_password_123', // Em prod usar bcrypt
            role: 'ELETRICISTA',
            status: 'ACTIVE',
            cpf_cnpj: '123.456.789-00',
            phone: '11999999999',
        },
    });
    console.log('✅ Eletricista criado:', eletricista.name);

    // 2. Criar Produtos (Simulando vindos do Sankhya)
    const produtos = [
        {
            sankhya_code: 1001,
            name: 'Disjuntor Unipolar 10A Tramontina',
            price: 15.90,
            unit: 'UN',
            category: 'Elétrica',
            is_available: true,
        },
        {
            sankhya_code: 1002,
            name: 'Fio Flexível 2.5mm Rolo 100m Sil',
            price: 189.00,
            unit: 'RL',
            category: 'Fios e Cabos',
            is_available: true,
        },
        {
            sankhya_code: 1003,
            name: 'Tomada Dupla 10A c/ Placa Pial',
            price: 22.50,
            unit: 'UN',
            category: 'Acabamento',
            is_available: true,
        },
    ];

    for (const prod of produtos) {
        await prisma.product.upsert({
            where: { sankhya_code: prod.sankhya_code },
            update: {},
            create: prod,
        });
    }
    console.log(`✅ ${produtos.length} Produtos criados.`);

    // 3. Criar um Orçamento de Exemplo
    const budget = await prisma.budget.create({
        data: {
            userId: eletricista.id,
            client_name: 'Maria Dona de Casa',
            status: 'DRAFT',
            total_materials: 220.80,
            total_labor: 150.00, // R$ 150 de Mão de Obra
            total_price: 370.80,
            items: {
                create: [
                    {
                        productId: (await prisma.product.findFirst({ where: { sankhya_code: 1001 } }))!.id,
                        quantity: 2,
                        price: 15.90,
                    },
                    {
                        productId: (await prisma.product.findFirst({ where: { sankhya_code: 1002 } }))!.id,
                        quantity: 1,
                        price: 189.00,
                    },
                ],
            },
        },
    });
    console.log('✅ Orçamento Exemplo criado:', budget.id);

    // 4. Popular Serviços Padrão
    console.log('🔧 Populando serviços padrão...');
    const servicosPadrao = [
        { name: 'Instalação de Tomada Simples', price: 35.00, category: 'Instalação', unit: 'UN' },
        { name: 'Instalação de Interruptor', price: 35.00, category: 'Instalação', unit: 'UN' },
        { name: 'Instalação de Chuveiro Elétrico', price: 80.00, category: 'Instalação', unit: 'UN' },
        { name: 'Instalação de Ventilador de Teto', price: 120.00, category: 'Instalação', unit: 'UN' },
        { name: 'Instalação de Luminária Simples', price: 50.00, category: 'Iluminação', unit: 'UN' },
        { name: 'Instalação de Lustre', price: 150.00, category: 'Iluminação', unit: 'UN' },
        { name: 'Troca de Disjuntor', price: 60.00, category: 'Manutenção', unit: 'UN' },
        { name: 'Troca de Resistência de Chuveiro', price: 50.00, category: 'Manutenção', unit: 'UN' },
        { name: 'Visita Técnica / Orçamento no Local', price: 100.00, category: 'Visita', unit: 'H' },
        { name: 'Instalação de Padrão de Entrada (Monofásico)', price: 450.00, category: 'Padrão', unit: 'UN' },
        { name: 'Instalação de Padrão de Entrada (Bifásico)', price: 650.00, category: 'Padrão', unit: 'UN' },
        { name: 'Ponto de Iluminação (Completo)', price: 90.00, category: 'Instalação', unit: 'UN' },
        { name: 'Sensor de Presença', price: 60.00, category: 'Automação', unit: 'UN' },
        { name: 'Fotocélula', price: 60.00, category: 'Automação', unit: 'UN' },
    ];

    for (const serv of servicosPadrao) {
        // Gera um código alto para não conflitar com Sankhya
        const code = 90000 + Math.floor(Math.random() * 9000); 
        
        // Verifica se já existe pelo nome para não duplicar
        const existe = await prisma.product.findFirst({ where: { name: serv.name, type: 'SERVICE' } });
        
        if (!existe) {
            await prisma.product.create({
                data: {
                    name: serv.name,
                    price: serv.price,
                    category: serv.category,
                    unit: serv.unit,
                    type: 'SERVICE',
                    description: 'Mão de obra padronizada',
                    is_available: true,
                    sankhya_code: code // Código dummy
                }
            });
        }
    }
    console.log(`✅ ${servicosPadrao.length} Serviços padrão verificados/criados.`);

    console.log('🚀 Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
