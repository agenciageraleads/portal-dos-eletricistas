/**
 * Script standalone para sincronizar produtos e baixar imagens
 * Não depende de injeção de dependência do NestJS
 */

import { PrismaClient } from '@prisma/client';
import { SankhyaClient } from './src/integrations/sankhya/sankhya.client';
import { ProductMapper } from './src/integrations/sankhya/mappers/product.mapper';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from './src/common/s3.service';
import sharp from 'sharp';

const prisma = new PrismaClient();
const sankhyaClient = new SankhyaClient();
const s3Service = new S3Service();

const imagesPath = path.join(process.cwd(), '../web/public/products');

// Garantir que a pasta existe (apenas se S3 não estiver ativo)
if (!s3Service.isEnabled()) {
    if (!fs.existsSync(imagesPath)) {
        try {
            fs.mkdirSync(imagesPath, { recursive: true });
            console.log(`📁 Pasta de imagens criada: ${imagesPath}`);
        } catch (e) {
            console.warn(`⚠️ Não foi possível criar pasta local: ${e.message}`);
        }
    }
}

async function downloadProductImage(codprod: number): Promise<Buffer | null> {
    try {
        const directUrl = `http://portal.snk.ativy.com:40235/mge/Produto@IMAGEM@CODPROD=${codprod}.dbimage`;

        const response = await axios.get(directUrl, {
            responseType: 'arraybuffer',
            validateStatus: (status: number) => status < 500,
            timeout: 30000,
        });

        const contentType = response.headers['content-type'];

        if (contentType?.includes('application/json')) {
            return null;
        }

        if (response.data && response.data.byteLength > 0 && contentType?.includes('image')) {
            return Buffer.from(response.data);
        }

        return null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error(`❌ Erro ao baixar imagem ${codprod}:`, error.message);
        return null;
    }
}

async function saveProductImage(codprod: number, imageBuffer: Buffer): Promise<string | null> {
    try {
        const filename = `${codprod}.webp`;

        // 1. Processar imagem com Sharp
        const processedBuffer = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .webp({ quality: 85, effort: 4 })
            .toBuffer();


        // 2. Se S3 estiver ativado, fazer upload
        if (s3Service.isEnabled()) {
            const s3Key = `products/${filename}`;
            const publicUrl = await s3Service.uploadBuffer(processedBuffer, s3Key, 'image/webp');
            return publicUrl;
        }

        // 3. Fallback: Salvar localmente
        const filepath = path.join(imagesPath, filename);
        await fs.promises.writeFile(filepath, processedBuffer);

        return `/products/${filename}`;
    } catch (error: any) {
        console.error(`❌ Erro ao salvar imagem ${codprod}:`, error.message);
        return null;
    }
}

function hasLocalImage(codprod: number): boolean {
    // Se usar S3, não verificamos localmente (assumimos que precisa baixar, ou poderíamos checar no banco)
    if (s3Service.isEnabled()) return false;

    const filename = `${codprod}.webp`;
    const filepath = path.join(imagesPath, filename);
    return fs.existsSync(filepath);
}

async function main() {
    console.log('🚀 Iniciando sincronização completa...\n');
    const startTime = Date.now();

    try {
        // 1. Buscar produtos do Sankhya
        console.log('📦 Buscando produtos do Sankhya...');
        const sankhyaProducts = await sankhyaClient.getAllActiveProducts();
        console.log(`✅ ${sankhyaProducts.length} produtos obtidos\n`);

        // 2. Converter e sincronizar no banco
        console.log('💾 Sincronizando produtos no banco de dados...');
        const portalProducts = ProductMapper.toPortalProducts(sankhyaProducts);

        let updated = 0;
        for (const product of portalProducts) {
            try {
                await prisma.product.upsert({
                    where: { sankhya_code: product.sankhya_code },
                    update: product,
                    create: product,
                });
                updated++;

                if (updated % 500 === 0) {
                    console.log(`   Processados: ${updated}/${portalProducts.length}`);
                }
            } catch (err: any) {
                console.error(`❌ Erro ao sincronizar produto ${product.sankhya_code}:`, err.message);
            }
        }
        console.log(`✅ ${updated} produtos sincronizados\n`);

        // 3. Baixar imagens
        console.log('📸 Baixando imagens dos produtos...');
        let imageSuccess = 0;
        let imageFailed = 0;
        let imageSkipped = 0;
        for (let i = 0; i < portalProducts.length; i++) {
            const product = portalProducts[i];
            let imageUrl: string | null = null;
            let isNewImage = false;

            // 1. Verificar se já tem imagem local
            if (hasLocalImage(product.sankhya_code)) {
                // Se existe localmente, definimos a URL
                imageUrl = `/products/${product.sankhya_code}.webp`;
                imageSkipped++;
            } else {
                // 2. Se não tem, tentar baixar
                const imageBuffer = await downloadProductImage(product.sankhya_code);

                if (imageBuffer) {
                    imageUrl = await saveProductImage(product.sankhya_code, imageBuffer);
                    if (imageUrl) {
                        isNewImage = true;
                        imageSuccess++;
                    } else {
                        imageFailed++;
                    }
                } else {
                    imageFailed++;
                }
            }

            // 3. Atualizar no banco se tivermos uma URL (nova ou existente)
            if (imageUrl) {
                // Otimização: Só update se for nova, ou podemos forçar update para garantir consistência
                // Como queremos corrigir o caso dos nulos, vamos fazer o update.

                await prisma.product.update({
                    where: { sankhya_code: product.sankhya_code },
                    data: { image_url: imageUrl }
                });
            }

            // Progresso a cada 100 imagens
            if ((i + 1) % 100 === 0) {
                console.log(`   Progresso: ${i + 1}/${portalProducts.length} (✅ ${imageSuccess} novas | ⏭️ ${imageSkipped} locais | ❌ ${imageFailed})`);
            }

            // Delay para não sobrecarregar (só se baixou algo, se foi local é rápido)
            if (isNewImage && i < portalProducts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log(`\n✅ Imagens: ${imageSuccess} baixadas | ${imageSkipped} já existiam | ${imageFailed} sem imagem\n`);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n🎉 Sincronização concluída em ${duration}s`);
        console.log(`📊 Resumo:`);
        console.log(`   - Produtos: ${updated}`);
        console.log(`   - Imagens novas: ${imageSuccess}`);
        console.log(`   - Imagens existentes: ${imageSkipped}`);
        console.log(`   - Sem imagem: ${imageFailed}`);

    } catch (error: any) {
        console.error('\n❌ Erro na sincronização:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
