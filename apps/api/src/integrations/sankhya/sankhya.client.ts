import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SankhyaClient {
    private readonly logger = new Logger(SankhyaClient.name);
    private readonly httpClient: AxiosInstance;
    private bearerToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor() {
        this.httpClient = axios.create({
            baseURL: 'https://api.sankhya.com.br',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Autentica usando OAuth 2.0 Client Credentials + X-Token
     * Documentação: https://developer.sankhya.com.br/reference/post_authenticate
     */
    async authenticate(): Promise<void> {
        // Se token ainda é válido, reutiliza
        if (this.bearerToken && Date.now() < this.tokenExpiresAt) {
            this.logger.log('Bearer token válido reutilizado');
            return;
        }

        try {
            this.logger.log('Autenticando via OAuth 2.0 + X-Token...');

            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.SANKHYA_CLIENT_ID!,
                client_secret: process.env.SANKHYA_CLIENT_SECRET!,
            });

            const response = await this.httpClient.post('/authenticate', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Token': process.env.SANKHYA_X_TOKEN!,
                },
            });

            if (response.data.access_token) {
                this.bearerToken = response.data.access_token;
                this.tokenExpiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
                this.logger.log('✅ Autenticado com sucesso!');
            } else if (response.data.bearerToken) {
                this.bearerToken = response.data.bearerToken;
                this.tokenExpiresAt = Date.now() + 3600000;
                this.logger.log('✅ Autenticado com sucesso!');
            } else {
                throw new Error('Token não retornado pela API');
            }
        } catch (error: any) {
            this.logger.error('❌ Erro ao autenticar', error.response?.data || error.message);
            throw new Error('Falha na autenticação OAuth 2.0 com Sankhya');
        }
    }

    /**
     * Busca produtos da VIEW VW_PORTAL_PRODUTOS
     */
    async getProducts(page: number = 0, limit: number = 100) {
        await this.authenticate();

        // Oracle usa ROWNUM para paginação
        const offset = page * limit;
        const sql = `
            SELECT * FROM (
                SELECT 
                    CODPROD,
                    DESCRPROD,
                    MARCA,
                    MARCA_CONTROLE,
                    CODVOL,
                    ATIVO,
                    ESTOQUE,
                    PRECO_CONSUMIDOR,
                    ENDIMAGEM,
                    CATEGORIA_MACRO,
                    ROWNUM AS RN
                FROM VW_PORTAL_PRODUTOS
                WHERE ROWNUM <= ${offset + limit}
            )
            WHERE RN > ${offset}
        `;

        try {
            this.logger.log(`Buscando produtos (página ${page}, limite ${limit})...`);

            const response = await this.httpClient.post(
                '/gateway/v1/mge/service.sbr',
                {
                    serviceName: 'DbExplorerSP.executeQuery',
                    requestBody: {
                        sql: sql.trim(),
                    },
                },
                {
                    params: {
                        serviceName: 'DbExplorerSP.executeQuery',
                        outputType: 'json',
                    },
                    headers: {
                        'Authorization': `Bearer ${this.bearerToken}`,
                    },
                },
            );

            const rows = response.data.responseBody?.rows || [];

            this.logger.log(`${rows.length} produtos retornados`);

            return {
                products: rows,
                total: rows.length,
            };
        } catch (error: any) {
            this.logger.error('Erro ao buscar produtos', error.response?.data || error.message);
            throw new Error('Falha ao buscar produtos do Sankhya');
        }
    }

    /**
     * Busca total de produtos da VIEW
     */
    async getTotalProducts(): Promise<number> {
        await this.authenticate();

        const sql = `SELECT COUNT(*) as total FROM VW_PORTAL_PRODUTOS`;

        try {
            const response = await this.httpClient.post(
                '/gateway/v1/mge/service.sbr',
                {
                    serviceName: 'DbExplorerSP.executeQuery',
                    requestBody: { sql },
                },
                {
                    params: {
                        serviceName: 'DbExplorerSP.executeQuery',
                        outputType: 'json',
                    },
                    headers: {
                        'Authorization': `Bearer ${this.bearerToken}`,
                    },
                },
            );

            const row = response.data.responseBody?.rows?.[0];
            const total = row?.TOTAL || row?.total || 0;
            this.logger.log(`Total de ${total} produtos na VIEW`);
            return total;
        } catch (error: any) {
            this.logger.error('Erro ao contar produtos', error.message);
            return 0;
        }
    }

    /**
     * Busca todos os produtos ativos (com paginação automática)
     * Busca até não retornar mais produtos
     */
    async getAllActiveProducts() {
        const allProducts = [];
        let page = 0;
        const limit = 100;

        this.logger.log('Iniciando busca de todos os produtos...');

        while (true) {
            const { products } = await this.getProducts(page, limit);

            if (products.length === 0) {
                this.logger.log('Nenhum produto retornado, finalizando busca');
                break;
            }

            allProducts.push(...products);
            this.logger.log(`Página ${page + 1}: ${products.length} produtos (total acumulado: ${allProducts.length})`);

            page++;

            // Se retornou menos que o limite, não há mais páginas
            if (products.length < limit) {
                this.logger.log('Última página alcançada');
                break;
            }

            // Delay para evitar sobrecarga
            await this.delay(500);
        }

        this.logger.log(`✅ Total de ${allProducts.length} produtos carregados`);
        return allProducts;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Executa uma query SQL arbitrária (apenas LEITURA)
     */
    async executeQuery(sql: string): Promise<any[]> {
        await this.authenticate();

        try {
            const response = await this.httpClient.post(
                '/gateway/v1/mge/service.sbr',
                {
                    serviceName: 'DbExplorerSP.executeQuery',
                    requestBody: {
                        sql: sql.trim(),
                    },
                },
                {
                    params: {
                        serviceName: 'DbExplorerSP.executeQuery',
                        outputType: 'json',
                    },
                    headers: {
                        'Authorization': `Bearer ${this.bearerToken}`,
                    },
                },
            );

            return response.data.responseBody?.rows || [];
        } catch (error: any) {
            this.logger.error('Erro ao executar query', error.message);
            throw error;
        }
    }
}
