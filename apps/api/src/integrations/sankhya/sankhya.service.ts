import { Injectable, Logger } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import { ProductMapper } from './mappers/product.mapper';

@Injectable()
export class SankhyaService {
    private readonly logger = new Logger(SankhyaService.name);

    constructor(private readonly sankhyaClient: SankhyaClient) { }

    /**
     * Busca todos os produtos ativos e converte para formato do Portal
     */
    async fetchAllProducts() {
        this.logger.log('Iniciando busca de produtos no Sankhya...');

        const sankhyaProducts = await this.sankhyaClient.getAllActiveProducts();

        this.logger.log(`${sankhyaProducts.length} produtos encontrados`);

        // Converter para formato do Portal
        const portalProducts = ProductMapper.toPortalProducts(sankhyaProducts);

        return portalProducts;
    }

    /**
     * Testa a conexão com o Sankhya
     */
    async testConnection() {
        try {
            await this.sankhyaClient.authenticate();
            const { products, total } = await this.sankhyaClient.getProducts(0, 1);

            return {
                success: true,
                message: 'Conexão com Sankhya estabelecida com sucesso',
                totalProducts: total,
                sampleProduct: products[0],
            };
        } catch (error: any) {
            return {
                success: false,
                message: 'Falha ao conectar com Sankhya',
                error: error.message,
            };
        }
    }
}
