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

    /**
     * Busca top eletricistas da VIEW VW_RANKING_TECNICOS
     * Ordenado por INDICE_COMERCIAL (maior contribuição)
     */
    async fetchTopElectricians(limit: number = 50) {
        this.logger.log(`Buscando top ${limit} eletricistas do Sankhya...`);

        const sql = `
            SELECT * FROM (
                SELECT 
                    CODPARC,
                    NOME_PARCEIRO,
                    CPF,
                    TELEFONE_WHATSAPP,
                    CODVENDTEC,
                    NOME_TECNICO_PRINCIPAL,
                    CIDADE,
                    ESTADO,
                    QTD_PEDIDOS_1100,
                    VLR_TOTAL_1100,
                    TICKET_MEDIO,
                    INDICE_COMERCIAL,
                    ROWNUM AS RN
                FROM VW_RANKING_TECNICOS
                WHERE ROWNUM <= ${limit}
                ORDER BY INDICE_COMERCIAL DESC
            )
            WHERE RN > 0
        `;

        const electricians = await this.sankhyaClient.executeQuery(sql);
        this.logger.log(`${electricians.length} eletricistas encontrados`);

        return electricians;
    }
}
