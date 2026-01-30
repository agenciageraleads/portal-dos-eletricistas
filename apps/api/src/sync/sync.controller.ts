import { Controller, Get, Post, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ElectricianSyncService } from './electrician-sync.service';
import { SankhyaImageService } from '../integrations/sankhya/sankhya-image.service';
import { SankhyaService } from '../integrations/sankhya/sankhya.service';

@Controller('admin/sync')
export class SyncController {
    constructor(
        private readonly syncService: SyncService,
        private readonly electricianSyncService: ElectricianSyncService,
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
     * Sincroniza top eletricistas do Sankhya
     * Query params: 
     *   - limit (padrão: 50)
     *   - photos (padrão: true) - baixar fotos do WhatsApp
     */
    @Post('electricians')
    async syncElectricians(
        @Query('limit') limit?: string,
        @Query('photos') photos?: string
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 50;
        const downloadPhotos = photos !== 'false'; // true por padrão
        return this.electricianSyncService.syncTopElectricians(limitNumber, downloadPhotos);
    }

    /**
     * Retorna o status da última sincronização
     */
    @Get('status')
    async getSyncStatus() {
        return this.syncService.getStatus();
    }
}


