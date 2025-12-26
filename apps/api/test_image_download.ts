import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SankhyaImageService } from './src/integrations/sankhya/sankhya-image.service';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const imageService = app.get(SankhyaImageService);
    const prisma = app.get(PrismaService);

    console.log('🔍 Testando download de imagens do Sankhya...\n');

    // Pegar 10 produtos aleatórios do banco
    const products = await prisma.product.findMany({
        take: 10,
        select: {
            sankhya_code: true,
            name: true,
            image_url: true
        }
    });

    console.log(`📦 Testando ${products.length} produtos:\n`);

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
        console.log(`\n🔄 Produto: ${product.name} (Código: ${product.sankhya_code})`);
        console.log(`   URL atual no banco: ${product.image_url || 'null'}`);

        try {
            const imageUrl = await imageService.downloadAndSaveProductImage(product.sankhya_code);

            if (imageUrl) {
                console.log(`   ✅ Imagem baixada com sucesso: ${imageUrl}`);
                successCount++;
            } else {
                console.log(`   ⚠️  Produto não possui imagem no Sankhya`);
                failCount++;
            }
        } catch (error: any) {
            console.log(`   ❌ Erro ao baixar: ${error.message}`);
            failCount++;
        }
    }

    console.log(`\n\n📊 RESUMO:`);
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Falha/Sem imagem: ${failCount}`);

    await app.close();
}

bootstrap();
