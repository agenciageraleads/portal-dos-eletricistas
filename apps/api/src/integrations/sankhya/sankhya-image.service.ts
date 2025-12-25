import { Injectable, Logger } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');

@Injectable()
export class SankhyaImageService {
    private readonly logger = new Logger(SankhyaImageService.name);
    private readonly imagesPath = path.join(process.cwd(), '../web/public/products');

    constructor(private readonly sankhyaClient: SankhyaClient) {
        // Garantir que a pasta de imagens existe
        if (!fs.existsSync(this.imagesPath)) {
            fs.mkdirSync(this.imagesPath, { recursive: true });
            this.logger.log(`Pasta de imagens criada: ${this.imagesPath}`);
        }
    }

    /**
     * Baixa a imagem de um produto usando o endpoint oficial .dbimage
     * Documentação: https://ajuda.sankhya.com.br/hc/pt-br/articles/36396748479383
     */
    async downloadProductImage(codprod: number): Promise<Buffer | null> {
        try {
            await this.sankhyaClient.authenticate();

            // Tenta o endpoint exatamente como na documentação oficial
            // Padrão: /gateway/v1/mge/Produto@IMAGEM@CODPROD=<CODPROD>.dbimage
            // const url = `/gateway/v1/mge/Produto@IMAGEM@CODPROD=${codprod}.dbimage`;

            // URL direta fornecida pelo usuário (Host específico)
            // http://portal.snk.ativy.com:40235/mge/Produto@IMAGEM@CODPROD=12351.dbimage
            const directUrl = `http://portal.snk.ativy.com:40235/mge/Produto@IMAGEM@CODPROD=${codprod}.dbimage`;

            this.logger.debug(`Baixando imagem do produto ${codprod} via Direct Host...`);

            // Usar axios diretamente aqui para não depender do baseURL do cliente padrão
            // É necessário passar o cookie JSESSIONID para autenticação? O teste com curl funcionou sem.
            // Mas o curl retornou Set-Cookie. Pode ser que exija autenticação ou seja público.
            // Vamos tentar passar os headers de auth por garantia, mas usar o axios do client pode forçar a baseURL errada se usarmos caminho relativo.
            // O axios suporta URL absoluta, ignorando a baseURL.

            const response = await this.sankhyaClient['httpClient'].get(directUrl, {
                headers: {
                    'Authorization': `Bearer ${this.sankhyaClient['bearerToken']}`,
                },
                responseType: 'arraybuffer',
                validateStatus: (status) => status < 500,
            });


            // Validar se é realmente uma imagem
            const contentType = response.headers['content-type'];

            // Se retornou JSON, é um erro do Sankhya
            if (contentType?.includes('application/json')) {
                const errorText = Buffer.from(response.data).toString('utf-8');
                this.logger.debug(`Produto ${codprod} retornou erro: ${errorText}`);
                return null;
            }

            // Se retornou dados e é imagem, converter para Buffer
            if (response.data && response.data.byteLength > 0 && contentType?.includes('image')) {
                return Buffer.from(response.data);
            }

            return null;
        } catch (error: any) {
            // Se retornar 404, o produto não tem imagem
            if (error.response?.status === 404) {
                this.logger.debug(`Produto ${codprod} não possui imagem (404)`);
                return null;
            }

            this.logger.error(`Erro ao baixar imagem do produto ${codprod}`, error.message);
            return null;
        }
    }

    /**
     * Salva a imagem do produto localmente (converte para WebP para melhor performance)
     */
    async saveProductImage(codprod: number, imageBuffer: Buffer): Promise<string | null> {
        try {
            const filename = `${codprod}.webp`;
            const filepath = path.join(this.imagesPath, filename);

            // Processar a imagem com Sharp
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            // Usar 800x800 como tamanho padrão quadrado
            const targetSize = 800;

            // Aplicar resize com padding (contain) para manter todo o conteúdo
            await image
                .resize(targetSize, targetSize, {
                    fit: 'contain', // Mantém toda a imagem, adiciona padding se necessário
                    background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo branco
                })
                .webp({
                    quality: 85, // Qualidade 85 = bom balanço
                    effort: 4 // Effort 4 = boa compressão sem ser muito lento
                })
                .toFile(filepath);

            const stats = fs.statSync(filepath);
            this.logger.debug(`✅ Imagem salva: ${filename} (${(stats.size / 1024).toFixed(2)} KB, ${targetSize}x${targetSize}px)`);

            return `/products/${filename}`;
        } catch (error: any) {
            this.logger.error(`Erro ao salvar imagem do produto ${codprod}`, error.message);
            return null;
        }
    }

    /**
     * Baixa e salva a imagem de um produto
     */
    async downloadAndSaveProductImage(codprod: number): Promise<string | null> {
        const imageBuffer = await this.downloadProductImage(codprod);

        if (!imageBuffer) {
            return null;
        }

        return await this.saveProductImage(codprod, imageBuffer);
    }

    /**
     * Verifica se o produto já tem imagem salva localmente
     */
    hasLocalImage(codprod: number): boolean {
        const filename = `${codprod}.webp`;
        const filepath = path.join(this.imagesPath, filename);
        return fs.existsSync(filepath);
    }

    /**
     * Baixa imagens de múltiplos produtos em lote
     */
    async downloadProductImages(codprods: number[], onProgress?: (current: number, total: number) => void): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (let i = 0; i < codprods.length; i++) {
            const codprod = codprods[i];

            // Pular se já tem imagem local
            if (this.hasLocalImage(codprod)) {
                this.logger.debug(`Produto ${codprod} já possui imagem local`);
                success++;
                continue;
            }

            const imageUrl = await this.downloadAndSaveProductImage(codprod);

            if (imageUrl) {
                success++;
            } else {
                failed++;
            }

            // Callback de progresso
            if (onProgress) {
                onProgress(i + 1, codprods.length);
            }

            // Delay para não sobrecarregar a API
            if (i < codprods.length - 1) {
                await this.delay(200);
            }
        }

        return { success, failed };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}
