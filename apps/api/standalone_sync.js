
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const prisma = new PrismaClient();

// Config S3
const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

async function getSankhyaToken() {
    console.log('🔑 Buscando token Sankhya...');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.SANKHYA_CLIENT_ID);
    params.append('client_secret', process.env.SANKHYA_CLIENT_SECRET);

    const response = await axios.post('https://api.sankhya.com.br/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data.access_token;
}

async function fetchSankhyaElectricians(token, limit = 297) {
    console.log(`📊 Buscando ${limit} eletricistas no Sankhya...`);
    const query = `
        SELECT TOP ${limit}
            CODPARC,
            NOMEPARC,
            CGC_CPF,
            TELEFONE,
            CIDADE,
            ESTADO,
            EMAIL,
            MARGEM_CONTRIBUICAO,
            QTD_PEDIDOS,
            VALOR_TOTAL,
            TICKET_MEDIO
        FROM VW_RANKING_TECNICOS
        ORDER BY MARGEM_CONTRIBUICAO DESC
    `;

    const response = await axios.post('https://api.sankhya.com.br/gateway/v1/mge/queryExecutor', {
        query
    }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Token': process.env.SANKHYA_X_TOKEN,
            'Content-Type': 'application/json'
        }
    });

    return response.data.rows || [];
}

async function getWhatsAppPhoto(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return null;

    try {
        const url = `${process.env.EVOLUTION_API_URL}/chat/fetchProfilePicture/${process.env.EVOLUTION_INSTANCE_NAME}`;
        const response = await axios.post(url, { number: `55${cleanPhone}` }, {
            headers: { 'apikey': process.env.EVOLUTION_API_KEY }
        });
        return response.data.profilePictureUrl || null;
    } catch (e) {
        return null;
    }
}

async function uploadToS3(url, cpf) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const hash = crypto.createHash('md5').update(cpf).digest('hex');
        const key = `whatsapp-profiles/${hash}.jpg`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: Buffer.from(response.data),
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        }));

        return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
    } catch (e) {
        return null;
    }
}

async function main() {
    try {
        const token = await getSankhyaToken();
        const rows = await fetchSankhyaElectricians(token, 10); // Limitando a 10 para teste rápido primeiro
        console.log(`✅ ${rows.length} eletricistas encontrados.`);

        for (const row of rows) {
            // row format depends on Sankhya response metadata, usually array or object
            // Let's assume common index access for simplicity if it's a raw query
            const [codparc, nome, cpf_raw, tel, cidade, estado, email, margem, qtd, total, ticket] = row;
            const cpf = cpf_raw.replace(/\D/g, '');

            console.log(`\n👤 Processando: ${nome} (${cpf})`);

            const existing = await prisma.user.findFirst({ where: { cpf_cnpj: cpf } });

            if (existing && existing.cadastro_finalizado) {
                console.log('⏭️ Já cadastrado e finalizado.');
                continue;
            }

            const photoUrlRaw = await getWhatsAppPhoto(tel);
            let finalPhotoUrl = null;
            if (photoUrlRaw) {
                console.log('📸 Foto encontrada, fazendo upload...');
                finalPhotoUrl = await uploadToS3(photoUrlRaw, cpf);
            }

            const userData = {
                name: nome,
                email: email || `${cpf}@portaleletricos.com.br`,
                phone: tel,
                city: cidade,
                state: estado,
                role: 'ELETRICISTA',
                pre_cadastrado: true,
                commercial_index: parseFloat(margem) || 0,
                total_orders: parseInt(qtd) || 0,
                total_revenue: parseFloat(total) || 0,
                average_ticket: parseFloat(ticket) || 0,
                sankhya_partner_id: parseInt(codparc),
                logo_url: finalPhotoUrl || (existing ? existing.logo_url : null)
            };

            if (existing) {
                await prisma.user.update({ where: { id: existing.id }, data: userData });
                console.log('🔄 Atualizado.');
            } else {
                userData.cpf_cnpj = cpf;
                userData.password = await bcrypt.hash(Math.random().toString(36), 10);
                await prisma.user.create({ data: userData });
                console.log('✨ Criado.');
            }
        }

    } catch (e) {
        console.error('❌ Erro:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
