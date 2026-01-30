import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SankhyaService } from '../integrations/sankhya/sankhya.service';
import { EvolutionService } from '../integrations/evolution/evolution.service';
import { ElectricianMapper } from '../integrations/sankhya/mappers/electrician.mapper';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class ElectricianSyncService {
    private readonly logger = new Logger(ElectricianSyncService.name);
    private readonly s3Client: S3Client;
    private readonly s3Bucket: string;
    private readonly s3Endpoint: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly sankhyaService: SankhyaService,
        private readonly evolutionService: EvolutionService,
    ) {
        // Configurar S3/MinIO
        this.s3Bucket = process.env.S3_BUCKET || 'portal-produtos';
        this.s3Endpoint = process.env.S3_ENDPOINT || 'https://s3.gera-leads.com';

        this.s3Client = new S3Client({
            endpoint: this.s3Endpoint,
            region: process.env.S3_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || '',
                secretAccessKey: process.env.S3_SECRET_KEY || '',
            },
            forcePathStyle: true,
        });
    }

    /**
     * Sincroniza top eletricistas do Sankhya com fotos do WhatsApp
     * REGRA: Roda apenas UMA VEZ - não sobrescreve usuários que já finalizaram cadastro
     */
    async syncTopElectricians(limit: number = 50, downloadPhotos: boolean = true) {
        const startTime = Date.now();
        this.logger.log(`🚀 Iniciando sincronização de top ${limit} eletricistas...`);

        try {
            // 1. Buscar eletricistas do Sankhya
            const sankhyaElectricians = await this.sankhyaService.fetchTopElectricians(limit);
            this.logger.log(`📊 ${sankhyaElectricians.length} eletricistas retornados do Sankhya`);

            let created = 0;
            let updated = 0;
            let skipped = 0;
            let errors = 0;
            let photosDownloaded = 0;

            // 2. Processar cada eletricista
            for (const sankhyaData of sankhyaElectricians) {
                try {
                    const electricianData = ElectricianMapper.toPortalUser(sankhyaData);
                    const cpf = electricianData.cpf_cnpj;

                    if (!cpf || cpf.length < 11) {
                        this.logger.warn(`❌ CPF inválido, pulando: ${electricianData.name}`);
                        skipped++;
                        continue;
                    }

                    // Verificar se usuário já existe
                    const existing = await this.prisma.user.findFirst({
                        where: { cpf_cnpj: cpf }
                    });

                    let userId: string;

                    if (existing) {
                        // Se já finalizou cadastro, NÃO sobrescreve
                        if (existing.cadastro_finalizado) {
                            this.logger.log(`⏭️  Pulando ${electricianData.name} - Cadastro já finalizado pelo usuário`);
                            skipped++;
                            continue;
                        }

                        // Se é pré-cadastro, atualiza apenas dados do Sankhya (backend)
                        // @ts-ignore - Campos novos, Prisma Client será regenerado
                        await this.prisma.user.update({
                            where: { id: existing.id },
                            data: {
                                sankhya_partner_id: electricianData.sankhya_partner_id,
                                sankhya_vendor_id: electricianData.sankhya_vendor_id,
                                commercial_index: electricianData.commercial_index,
                                total_orders: electricianData.total_orders,
                                total_revenue: electricianData.total_revenue,
                                average_ticket: electricianData.average_ticket,
                                sankhya_synced_at: new Date(),
                                // Atualiza cidade/estado/telefone apenas se estiverem vazios
                                city: existing.city || electricianData.city,
                                state: existing.state || electricianData.state,
                                phone: existing.phone || electricianData.phone,
                            }
                        });

                        userId = existing.id;
                        this.logger.log(`🔄 Atualizado: ${electricianData.name}`);
                        updated++;
                    } else {
                        // Criar novo pré-cadastro
                        const hashedPassword = await bcrypt.hash(electricianData.password as string, 10);

                        // @ts-ignore - Campos novos, Prisma Client será regenerado
                        const newUser = await this.prisma.user.create({
                            data: {
                                ...electricianData,
                                password: hashedPassword,
                            }
                        });

                        userId = newUser.id;
                        this.logger.log(`✅ Criado: ${electricianData.name} (CPF: ${cpf})`);
                        created++;
                    }

                    // 3. Buscar e fazer upload da foto do WhatsApp
                    if (downloadPhotos && electricianData.phone) {
                        try {
                            const photoUrl = await this.downloadAndUploadWhatsAppPhoto(
                                electricianData.phone,
                                cpf
                            );

                            if (photoUrl) {
                                await this.prisma.user.update({
                                    where: { id: userId },
                                    data: { logo_url: photoUrl }
                                });
                                this.logger.log(`   📸 Foto do WhatsApp salva para ${electricianData.name}`);
                                photosDownloaded++;
                            }
                        } catch (photoError: any) {
                            this.logger.warn(`   ⚠️  Erro ao baixar foto: ${photoError.message}`);
                        }
                    }

                } catch (err: any) {
                    errors++;
                    this.logger.error(`❌ Erro ao processar eletricista: ${err.message}`);
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            this.logger.log(`\n🎉 Sincronização concluída em ${duration}s`);
            this.logger.log(`📈 Criados: ${created}`);
            this.logger.log(`🔄 Atualizados: ${updated}`);
            this.logger.log(`⏭️  Pulados: ${skipped}`);
            this.logger.log(`📸 Fotos baixadas: ${photosDownloaded}`);
            this.logger.log(`❌ Erros: ${errors}`);

            return {
                success: true,
                duration: `${duration}s`,
                created,
                updated,
                skipped,
                photosDownloaded,
                errors,
            };

        } catch (error: any) {
            this.logger.error('❌ Erro na sincronização de eletricistas', error.message);
            throw error;
        }
    }

    /**
     * Baixa foto do WhatsApp e faz upload para S3/MinIO
     */
    private async downloadAndUploadWhatsAppPhoto(phone: string, cpf: string): Promise<string | null> {
        try {
            // 1. Buscar URL da foto via Evolution API
            const photoUrl = await this.evolutionService.getProfilePicture(phone);

            if (!photoUrl) {
                return null;
            }

            // 2. Baixar a imagem
            const response = await axios.get(photoUrl, {
                responseType: 'arraybuffer',
                timeout: 10000
            });

            const imageBuffer = Buffer.from(response.data);

            // 3. Gerar nome único para o arquivo
            const hash = crypto.createHash('md5').update(cpf).digest('hex');
            const fileName = `whatsapp-profiles/${hash}.jpg`;

            // 4. Upload para S3/MinIO
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.s3Bucket,
                Key: fileName,
                Body: imageBuffer,
                ContentType: 'image/jpeg',
                ACL: 'public-read',
            }));

            // 5. Retornar URL pública
            const publicUrl = `${this.s3Endpoint}/${this.s3Bucket}/${fileName}`;
            return publicUrl;

        } catch (error: any) {
            this.logger.warn(`Erro ao processar foto do WhatsApp: ${error.message}`);
            return null;
        }
    }
}
