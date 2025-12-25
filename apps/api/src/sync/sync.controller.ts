import { Controller, Get, Post, Param } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SankhyaImageService } from '../integrations/sankhya/sankhya-image.service';
import { SankhyaService } from '../integrations/sankhya/sankhya.service';

@Controller('admin/sync')
export class SyncController {
    constructor(
        private readonly syncService: SyncService,
        private readonly sankhyaService: SankhyaService,
        private readonly sankhyaImageService: SankhyaImageService,
    ) { }

    /**
     * Testa a conexão com o Sankhya
     */
    @Get('test')
    async testConnection() {
        return this.sankhyaService.testConnection();
    }

    /**
     * Sincroniza produtos do Sankhya
     */
    @Post('products')
    async syncProducts() {
        return this.syncService.syncProducts();
    }

    /**
     * Retorna o status da última sincronização
     */
    @Get('status')
    async getSyncStatus() {
        return this.syncService.getStatus();
    }

    /**
     * Testa download de imagem de um produto específico
     */
    @Get('test-image/:codprod')
    async testImageDownload(@Param('codprod') codprod: string) {
        const imageUrl = await this.sankhyaImageService.downloadAndSaveProductImage(parseInt(codprod));

        return {
            success: !!imageUrl,
            codprod: parseInt(codprod),
            imageUrl,
            message: imageUrl ? 'Imagem baixada com sucesso' : 'Produto não possui imagem',
        };
    }
}
