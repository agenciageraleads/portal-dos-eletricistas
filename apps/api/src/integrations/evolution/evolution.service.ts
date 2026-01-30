import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class EvolutionService {
    private readonly logger = new Logger(EvolutionService.name);
    private readonly httpClient: AxiosInstance;
    private readonly instanceName: string;

    constructor() {
        const baseURL = process.env.EVOLUTION_API_URL || 'https://evolution.geraleads.com';
        const apiKey = process.env.EVOLUTION_API_KEY;
        this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'WhatsAppPortal';

        if (!apiKey) {
            this.logger.warn('⚠️ EVOLUTION_API_KEY não configurada. Funcionalidades de WhatsApp desabilitadas.');
        }

        this.httpClient = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey || '',
            },
        });
    }

    /**
     * Busca a foto de perfil do WhatsApp de um número
     * @param phoneNumber Número no formato internacional (ex: 5562982435286)
     * @returns URL da foto de perfil ou null se não encontrar
     */
    async getProfilePicture(phoneNumber: string): Promise<string | null> {
        if (!process.env.EVOLUTION_API_KEY) {
            this.logger.warn('Evolution API não configurada, pulando busca de foto');
            return null;
        }

        try {
            // Remove caracteres não numéricos
            const cleanNumber = phoneNumber.replace(/\D/g, '');

            // Endpoint: POST /chat/fetchProfilePictureUrl/{instance}
            const response = await this.httpClient.post(
                `/chat/fetchProfilePictureUrl/${this.instanceName}`,
                {
                    number: cleanNumber
                }
            );

            if (response.data?.profilePictureUrl) {
                this.logger.log(`✅ Foto encontrada para ${cleanNumber}`);
                return response.data.profilePictureUrl;
            }

            this.logger.log(`ℹ️ Nenhuma foto de perfil para ${cleanNumber}`);
            return null;

        } catch (error: any) {
            this.logger.warn(`Erro ao buscar foto de ${phoneNumber}: ${error.message}`);
            return null;
        }
    }

    /**
     * Verifica se um número existe no WhatsApp
     * @param phoneNumber Número no formato internacional
     * @returns true se o número tem WhatsApp
     */
    async checkWhatsAppExists(phoneNumber: string): Promise<boolean> {
        if (!process.env.EVOLUTION_API_KEY) {
            return false;
        }

        try {
            const cleanNumber = phoneNumber.replace(/\D/g, '');

            // Endpoint para verificar número (pode variar conforme versão da API)
            const response = await this.httpClient.post(
                `/chat/whatsappNumbers/${this.instanceName}`,
                {
                    numbers: [cleanNumber]
                }
            );

            return response.data?.length > 0 && response.data[0]?.exists;

        } catch (error: any) {
            this.logger.warn(`Erro ao verificar WhatsApp de ${phoneNumber}: ${error.message}`);
            return false;
        }
    }

    /**
     * Testa a conexão com a Evolution API
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.httpClient.get(`/instance/${this.instanceName}`);

            return {
                success: true,
                message: `Conectado à instância ${this.instanceName}`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Falha ao conectar: ${error.message}`,
            };
        }
    }
}
