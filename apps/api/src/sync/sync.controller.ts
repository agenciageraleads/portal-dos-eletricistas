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
}


