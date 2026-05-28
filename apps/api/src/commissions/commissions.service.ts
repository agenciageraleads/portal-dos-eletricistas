import { Injectable, Logger } from '@nestjs/common';
import { SankhyaClient } from '../integrations/sankhya/sankhya.client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
    private readonly logger = new Logger(CommissionsService.name);
    // Comissão padrão de 2% sobre o valor faturado das indicações
    private readonly COMMISSION_RATE = 0.02;

    constructor(
        private readonly sankhyaClient: SankhyaClient,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Busca o resumo financeiro consolidado do eletricista
     * @param sankhyaVendorId Código de Vendedor Técnico (CODVENDTEC) no Sankhya
     */
    async getSummary(sankhyaVendorId: number) {
        this.logger.log(`Buscando resumo de comissão para CODVENDTEC: ${sankhyaVendorId}`);

        try {
            // Consulta os totais acumulados do técnico na view de ranking do Sankhya
            const sql = `
                SELECT 
                    COALESCE(QTD_PEDIDOS_1100, 0) AS QTD_PEDIDOS,
                    COALESCE(VLR_TOTAL_1100, 0) AS VLR_TOTAL
                FROM VW_RANKING_TECNICOS
                WHERE CODVENDTEC = ${sankhyaVendorId}
            `;

            const rows = await this.sankhyaClient.executeQuery(sql);
            
            let totalIndications = 0;
            let totalRevenue = 0;

            if (rows && rows.length > 0) {
                // Sankhya pode retornar as chaves em maiúsculo (Oracle padrão)
                const row = rows[0];
                totalIndications = parseInt(row.QTD_PEDIDOS || row.qtd_pedidos || 0, 10);
                totalRevenue = parseFloat(row.VLR_TOTAL || row.vlr_total || 0);
            }

            // Calcula a comissão total gerada
            const totalCommission = totalRevenue * this.COMMISSION_RATE;

            return {
                totalIndications,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalCommission: parseFloat(totalCommission.toFixed(2)),
                commissionRate: this.COMMISSION_RATE,
                commissionAvailable: parseFloat(totalCommission.toFixed(2)), // Atualmente o saldo disponível é igual ao total acumulado
            };
        } catch (error: any) {
            this.logger.error(`Erro ao buscar resumo financeiro do Sankhya: ${error.message}`);
            // Fallback em caso de erro na conexão ou query do Sankhya
            return {
                totalIndications: 0,
                totalRevenue: 0,
                totalCommission: 0,
                commissionRate: this.COMMISSION_RATE,
                commissionAvailable: 0,
                error: 'Não foi possível sincronizar os dados com o Sankhya neste momento.'
            };
        }
    }

    /**
     * Busca a lista detalhada de indicações (vendas faturadas) do eletricista
     * @param sankhyaVendorId Código de Vendedor Técnico (CODVENDTEC) no Sankhya
     */
    async getIndications(sankhyaVendorId: number) {
        this.logger.log(`Buscando indicações detalhadas para CODVENDTEC: ${sankhyaVendorId}`);

        try {
            // Query robusta na tabela TGFCAB (cabeçalho de notas/pedidos) e TGFPAR (parceiros/clientes)
            const sql = `
                SELECT 
                    TGFCAB.NUNOTA,
                    TGFCAB.NUMNOTA,
                    TGFCAB.DTFATUR,
                    TGFCAB.VLRNOTA,
                    TGFPAR.NOMEPARC AS CLIENTE_NOME
                FROM TGFCAB
                INNER JOIN TGFPAR ON TGFCAB.CODPARC = TGFPAR.CODPARC
                WHERE TGFCAB.CODVENDTEC = ${sankhyaVendorId}
                  AND TGFCAB.STATUSNOTA = 'L'
                ORDER BY TGFCAB.DTFATUR DESC
            `;

            const rows = await this.sankhyaClient.executeQuery(sql);

            // Mapeia e calcula a comissão individual de cada indicação
            const indications = rows.map((row: any) => {
                const numNota = row.NUMNOTA || row.numnota || 0;
                const date = row.DTFATUR || row.dtfatur;
                const value = parseFloat(row.VLRNOTA || row.vlrnota || 0);
                const clientNameRaw = row.CLIENTE_NOME || row.cliente_nome || 'Cliente Portal';

                // Mascarar o nome do cliente final por conformidade com a LGPD
                const clientName = this.maskClientName(clientNameRaw);
                const commission = value * this.COMMISSION_RATE;

                return {
                    id: row.NUNOTA || row.nunota || String(Math.random()),
                    orderNumber: numNota,
                    date: date,
                    value: parseFloat(value.toFixed(2)),
                    commission: parseFloat(commission.toFixed(2)),
                    clientName,
                    status: 'FATURADO'
                };
            });

            return indications;
        } catch (error: any) {
            this.logger.error(`Erro ao buscar indicações no Sankhya: ${error.message}`);
            return [];
        }
    }

    /**
     * Auxiliar para mascarar o nome do cliente final (LGPD)
     * Exemplo: "Lucas de Souza Silva" -> "Lucas de S***"
     */
    private maskClientName(fullName: string): string {
        if (!fullName) return 'Cliente Portal';
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return parts[0];
        if (parts.length === 2) return `${parts[0]} ${parts[1].charAt(0)}.***`;
        
        // Retorna o primeiro nome e a primeira letra do segundo nome com asteriscos
        const firstName = parts[0];
        const secondPart = parts[1];
        if (['de', 'do', 'da', 'dos', 'das', 'e'].includes(secondPart.toLowerCase()) && parts[2]) {
            return `${firstName} ${secondPart} ${parts[2].charAt(0)}.***`;
        }
        return `${firstName} ${secondPart.charAt(0)}.***`;
    }
}
