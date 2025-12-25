import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SankhyaService } from '../integrations/sankhya/sankhya.service';
import { SankhyaImageService } from '../integrations/sankhya/sankhya-image.service';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private lastSyncDate: Date | null = null;
    private isSyncing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly sankhyaService: SankhyaService,
        private readonly sankhyaImageService: SankhyaImageService,
    ) { }

    /**
     * Sincronização completa de produtos
     */
    async syncProducts() {
        if (this.isSyncing) {
            throw new Error('Sincronização já em andamento');
        }

        this.isSyncing = true;
        const startTime = Date.now();

        try {
            this.logger.log('🔄 Iniciando sincronização de produtos...');

            // 1. Buscar produtos do Sankhya
            const products = await this.sankhyaService.fetchAllProducts();
            this.logger.log(`📦 ${products.length} produtos obtidos do Sankhya`);

            // 2. Sincronizar no banco (upsert em lote)
            let created = 0;
            let updated = 0;
            let errors = 0;

            for (const product of products) {
                try {
                    // Validar dados críticos
                    if (!product.sankhya_code || isNaN(product.sankhya_code)) {
                        this.logger.warn(`Produto ignorado: código inválido (Sankhya Code: ${product.sankhya_code})`);
                        continue;
                    }

                    // Upsert: Cria ou Atualiza em uma única operação atômica
                    await this.prisma.product.upsert({
                        where: { sankhya_code: product.sankhya_code },
                        update: product,
                        create: product,
                    });

                    // Simplificação: conta apenas como processado com sucesso
                    updated++;
                } catch (err: any) {
                    errors++;
                    this.logger.error(`Falha ao sincronizar produto ${product.sankhya_code} ("${product.name}"): ${err.message}`);
                }
            }

            this.logger.log(`✅ Sincronização de catálogo finalizada: ${updated} produtos processados, ${errors} falhas`);

            // 3. Baixar imagens dos produtos (apenas os que não têm)
            this.logger.log('📸 Iniciando download de imagens...');
            const codprods = products.map(p => p.sankhya_code);

            const imageResult = await this.sankhyaImageService.downloadProductImages(
                codprods,
                (current, total) => {
                    if (current % 100 === 0) {
                        this.logger.log(`📸 Progresso: ${current}/${total} imagens processadas`);
                    }
                }
            );

            this.logger.log(`✅ Imagens: ${imageResult.success} baixadas, ${imageResult.failed} sem imagem`);

            this.logger.log(`✅ Imagens: ${imageResult.success} baixadas, ${imageResult.failed} sem imagem`);

            // 4. Limpeza (Soft Delete): Desativar produtos que não foram atualizados nesta sincronização
            this.logger.log('🧹 Iniciando limpeza de produtos órfãos...');
            const cleanupResult = await this.prisma.product.updateMany({
                where: {
                    updatedAt: {
                        lt: new Date(startTime), // Menor que o início do sync
                    },
                    is_available: true, // Apenas os que estão ativos
                },
                data: {
                    is_available: false,
                },
            });

            if (cleanupResult.count > 0) {
                this.logger.warn(`🗑️ ${cleanupResult.count} produtos foram desativados pois não vieram na sincronização.`);
            } else {
                this.logger.log('✨ Nenhum produto precisou ser desativado. Catálogo sincronizado 100%.');
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.lastSyncDate = new Date();

            this.logger.log(
                `✅ Sincronização concluída em ${duration}s. (Ativos: ${updated}, Desativados: ${cleanupResult.count})`,
            );

            return {
                success: true,
                duration: `${duration}s`,
                totalProducts: products.length,
                created,
                updated,
                images: imageResult,
                lastSync: this.lastSyncDate,
            };
        } catch (error: any) {
            this.logger.error('❌ Erro na sincronização', error.message);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Retorna status da última sincronização
     */
    getStatus() {
        return {
            lastSync: this.lastSyncDate,
            isSyncing: this.isSyncing,
        };
    }
}
