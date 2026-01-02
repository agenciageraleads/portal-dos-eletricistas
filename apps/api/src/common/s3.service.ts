import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private s3Client: S3Client | null = null;
    private bucket: string;
    private publicUrl: string;
    private enabled: boolean = false;

    constructor() {
        // Verifica se as variáveis de ambiente do S3/MinIO estão configuradas
        const endpoint = process.env.S3_ENDPOINT;
        const accessKeyId = process.env.S3_ACCESS_KEY;
        const secretAccessKey = process.env.S3_SECRET_KEY;
        const bucket = process.env.S3_BUCKET || 'portal-produtos';
        const region = process.env.S3_REGION || 'us-east-1';

        if (endpoint && accessKeyId && secretAccessKey) {
            this.s3Client = new S3Client({
                endpoint,
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
                forcePathStyle: true, // Necessário para MinIO
            });

            this.bucket = bucket;
            this.publicUrl = `${endpoint}/${bucket}`;
            this.enabled = true;

            this.logger.log(`S3/MinIO configurado: ${this.publicUrl}`);
        } else {
            this.logger.warn('S3/MinIO não configurado. Usando armazenamento local.');
        }
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async uploadFile(
        filePath: string,
        key: string,
        contentType: string = 'image/jpeg',
    ): Promise<string> {
        if (!this.enabled || !this.s3Client) {
            throw new Error('S3/MinIO não está configurado');
        }

        try {
            const fileStream = fs.createReadStream(filePath);
            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucket,
                    Key: key,
                    Body: fileStream,
                    ContentType: contentType,
                    // ACL removido - usar política do bucket MinIO
                },
            });

            await upload.done();

            const publicUrl = `${this.publicUrl}/${key}`;
            this.logger.log(`Arquivo enviado: ${publicUrl}`);

            return publicUrl;
        } catch (error) {
            this.logger.error(`Erro ao enviar arquivo para S3: ${error.message}`);
            throw error;
        }
    }

    async uploadBuffer(
        buffer: Buffer,
        key: string,
        contentType: string = 'image/jpeg',
    ): Promise<string> {
        if (!this.enabled || !this.s3Client) {
            throw new Error('S3/MinIO não está configurado');
        }

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                // ACL removido - usar política do bucket MinIO
            });

            await this.s3Client.send(command);

            const publicUrl = `${this.publicUrl}/${key}`;
            this.logger.log(`Buffer enviado: ${publicUrl}`);

            return publicUrl;
        } catch (error) {
            this.logger.error(`Erro ao enviar buffer para S3: ${error.message}`);
            throw error;
        }
    }

    async checkFileExists(key: string): Promise<boolean> {
        if (!this.enabled || !this.s3Client) {
            return false;
        }

        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            this.logger.error(`Erro ao verificar existência do arquivo S3: ${error.message}`);
            // Em caso de erro (ex: permissão), assumimos false para tentar upar de novo ou lançamos?
            // Melhor assumir false para garantir, mas logar o erro.
            return false;
        }
    }

    getPublicUrl(key: string): string {
        return `${this.publicUrl}/${key}`;
    }
}
