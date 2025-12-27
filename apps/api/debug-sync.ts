
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SyncService } from './src/sync/sync.service';

/**
 * Script for debugging Sync Service independently
 */
async function bootstrap() {
    console.log('🚀 Initializing Nest application for Sync Debug...');

    // Create application context (no HTTP server)
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const syncService = app.get(SyncService);

        console.log('🔄 Triggering SyncService.syncProducts()...');

        const result = await syncService.syncProducts();

        console.log('✅ Sync completed successfully!');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Sync FAILED!');
        console.error(error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
