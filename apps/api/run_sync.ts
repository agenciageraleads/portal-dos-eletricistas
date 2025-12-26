import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SyncService } from './src/sync/sync.service';

async function main() {
    console.log('🚀 Iniciando sincronização completa de produtos e imagens...\n');

    const app = await NestFactory.createApplicationContext(AppModule);
    const syncService = app.get(SyncService);

    try {
        const result = await syncService.syncProducts();
        console.log('\n✅ Sincronização concluída com sucesso!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n❌ Erro na sincronização:', error);
    }

    await app.close();
}

main();
