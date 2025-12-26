import { Injectable, Logger } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import { S3Service } from '../../common/s3.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');
import axios from 'axios';

@Injectable()
export class SankhyaImageService {
    private readonly logger = new Logger(SankhyaImageService.name);
    private readonly imagesPath = path.join(process.cwd(), '../web/public/products');

    constructor(
        private readonly sankhyaClient: SankhyaClient,
        private readonly s3Service: S3Service,
    ) {
        // Garantir que a pasta de imagens existe (fallback para armazenamento local)
        if (!fs.existsSync(this.imagesPath)) {
            fs.mkdirSync(this.imagesPath, { recursive: true });
            this.logger.log(`Pasta de imagens criada: ${this.imagesPath}`);
        }

        if (this.s3Service.isEnabled()) {
            this.logger.log('S3/MinIO habilitado para armazenamento de imagens');
        } else {
            this.logger.log('Usando armazenamento local para imagens');
        }
    }

    /**
     * Baixa a imagem de um produto usando o endpoint oficial .dbimage
     * Documentação: https://ajuda.sankhya.com.br/hc/pt-br/articles/36396748479383
     */
    async downloadProductImage(codprod: number): Promise<Buffer | null> {
        try {
            // Autenticar primeiro (se sankhyaClient estiver disponível)
            if (this.sankhyaClient) {
                await this.sankhyaClient.authenticate();
            }

            // URL direta fornecida pelo usuário (Host específico)
            // http://portal.snk.ativy.com:40235/mge/Produto@IMAGEM@CODPROD=15744.dbimage
            const directUrl = `http://portal.snk.ativy.com:40235/mge/Produto@IMAGEM@CODPROD=${codprod}.dbimage`;

            this.logger.debug(`Baixando imagem do produto ${codprod} via Direct Host...`);

            // Usar axios diretamente com configuração mínima
            const response = await axios.get(directUrl, {
                headers: {
                    // Tentar usar bearer token se disponível
                    ...(this.sankhyaClient?.bearerToken && {
                        'Authorization': `Bearer ${this.sankhyaClient.bearerToken}`
                    })
                },
                responseType: 'arraybuffer',
                validateStatus: (status: number) => status < 500,
                timeout: 30000,
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
     * Salva a imagem do produto (S3/MinIO ou localmente)
     */
    async saveProductImage(codprod: number, imageBuffer: Buffer): Promise<string | null> {
        try {
            const filename = `${codprod}.webp`;

            // Processar a imagem com Sharp
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            // Usar 800x800 como tamanho padrão quadrado
            const targetSize = 800;

            // Aplicar resize com padding (contain) para manter todo o conteúdo
            const processedBuffer = await image
                .resize(targetSize, targetSize, {
                    fit: 'contain', // Mantém toda a imagem, adiciona padding se necessário
                    background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo branco
                })
                .webp({
                    quality: 85, // Qualidade 85 = bom balanço
                    effort: 4 // Effort 4 = boa compressão sem ser muito lento
                })
                .toBuffer();

            // Se S3/MinIO está habilitado, fazer upload
            if (this.s3Service.isEnabled()) {
                const s3Key = `products/${filename}`;
                const publicUrl = await this.s3Service.uploadBuffer(
                    processedBuffer,
                    s3Key,
                    'image/webp'
                );

                this.logger.debug(`✅ Imagem enviada para S3: ${filename} (${(processedBuffer.length / 1024).toFixed(2)} KB)`);
                return publicUrl;
            }

            // Fallback: salvar localmente
            const filepath = path.join(this.imagesPath, filename);
            await fs.promises.writeFile(filepath, processedBuffer);

            const stats = fs.statSync(filepath);
            this.logger.debug(`✅ Imagem salva localmente: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);

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
