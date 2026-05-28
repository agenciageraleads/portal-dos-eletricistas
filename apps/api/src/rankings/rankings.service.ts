import { Injectable, Logger } from '@nestjs/common';
import { SankhyaClient } from '../integrations/sankhya/sankhya.client';
import { PrismaService } from '../prisma/prisma.service';

interface CacheEntry {
    data: any[];
    timestamp: number;
}

@Injectable()
export class RankingsService {
    private readonly logger = new Logger(RankingsService.name);
    // Cache de 1 hora em milissegundos
    private readonly CACHE_TTL = 3600 * 1000; 
    private readonly cache = new Map<string, CacheEntry>();

    constructor(
        private readonly sankhyaClient: SankhyaClient,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Busca o ranking de eletricistas público filtrado por período
     * @param period 'semana' | 'mes' | 'ano'
     */
    async getPublicRanking(period: 'semana' | 'mes' | 'ano') {
        const cacheKey = `ranking_${period}`;
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            this.logger.log(`Retornando ranking do cache para o período: ${period}`);
            return cached.data;
        }

        this.logger.log(`Recalculando ranking para o período: ${period}...`);
        
        try {
            const dataInicio = this.getDataInicio(period);
            
            // Query robusta no Sankhya que agrupa vendas por CODVENDTEC faturados no período
            // Funciona em bancos Oracle (ERP Sankhya padrão)
            const sql = `
                SELECT * FROM (
                    SELECT 
                        TGFCAB.CODVENDTEC,
                        COUNT(TGFCAB.NUNOTA) AS QTD_PEDIDOS,
                        SUM(TGFCAB.VLRNOTA) AS VLR_TOTAL,
                        MAX(VW.NOME_TECNICO_PRINCIPAL) AS NOME_TECNICO,
                        MAX(VW.CIDADE) AS CIDADE,
                        MAX(VW.ESTADO) AS ESTADO,
                        ROWNUM AS RN
                    FROM TGFCAB
                    INNER JOIN VW_RANKING_TECNICOS VW ON TGFCAB.CODVENDTEC = VW.CODVENDTEC
                    WHERE TGFCAB.STATUSNOTA = 'L'
                      AND TGFCAB.DTFATUR >= ${dataInicio}
                    GROUP BY TGFCAB.CODVENDTEC
                    ORDER BY VLR_TOTAL DESC
                )
                WHERE RN <= 50
            `;

            // Query executada no Sankhya
            const rows = await this.sankhyaClient.executeQuery(sql);
            
            // 2. Enriquecer os dados com avatares e customizações dos usuários locais no PostgreSQL
            const enrichedRanking = await this.enrichRankingWithLocalUsers(rows);

            // Gravar no cache
            this.cache.set(cacheKey, {
                data: enrichedRanking,
                timestamp: Date.now()
            });

            return enrichedRanking;
        } catch (error: any) {
            this.logger.error(`Falha ao calcular ranking do Sankhya: ${error.message}`);
            // Em caso de falha de conexão ou view quebrada, retorna o ranking consolidado global da view
            return this.getFallbackRanking();
        }
    }

    /**
     * Calcula o filtro de data Oracle SQL para o período selecionado
     */
    private getDataInicio(period: 'semana' | 'mes' | 'ano'): string {
        // Formato Oracle: TRUNC(SYSDATE) - X dias
        switch (period) {
            case 'semana':
                return 'TRUNC(SYSDATE) - 7';
            case 'mes':
                return 'TRUNC(SYSDATE) - 30';
            case 'ano':
            default:
                return 'TRUNC(SYSDATE) - 365';
        }
    }

    /**
     * Cruza os dados do Sankhya com a base de dados PostgreSQL local para buscar avatares e dados atualizados
     */
    private async enrichRankingWithLocalUsers(sankhyaRows: any[]): Promise<any[]> {
        const enriched = [];
        let position = 1;

        for (const row of sankhyaRows) {
            const codVendTec = parseInt(row.CODVENDTEC || row.codvendtec || 0, 10);
            const totalOrders = parseInt(row.QTD_PEDIDOS || row.qtd_pedidos || 0, 10);
            const totalRevenue = parseFloat(row.VLR_TOTAL || row.vlr_total || 0);
            const nameSankhya = row.NOME_TECNICO || row.nome_tecnico || 'Eletricista Portal';
            const citySankhya = row.CIDADE || row.cidade || '';
            const stateSankhya = row.ESTADO || row.estado || '';

            // Busca se o usuário existe localmente na nossa base via Prisma
            const localUser = codVendTec > 0 
                ? await this.prisma.user.findFirst({
                    where: { sankhya_vendor_id: codVendTec },
                    select: { name: true, logo_url: true, city: true, state: true }
                  })
                : null;

            enriched.push({
                position,
                codVendTec,
                name: this.toTitleCase(localUser?.name || nameSankhya),
                avatarUrl: localUser?.logo_url || 'https://cdn-icons-png.flaticon.com/512/2910/2910768.png',
                city: this.toTitleCase(localUser?.city || citySankhya),
                state: (localUser?.state || stateSankhya || '').toUpperCase(),
                totalOrders,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            });

            position++;
        }

        return enriched;
    }

    /**
     * Fallback em caso de erro na query complexa por período
     * Busca dados gerais da VIEW VW_RANKING_TECNICOS
     */
    private async getFallbackRanking(): Promise<any[]> {
        this.logger.warn('Executando query de ranking fallback a partir da VW_RANKING_TECNICOS');
        try {
            const sql = `
                SELECT * FROM (
                    SELECT 
                        CODVENDTEC,
                        NOME_TECNICO_PRINCIPAL,
                        CIDADE,
                        ESTADO,
                        QTD_PEDIDOS_1100,
                        VLR_TOTAL_1100,
                        ROWNUM AS RN
                    FROM VW_RANKING_TECNICOS
                    WHERE ROWNUM <= 50
                    ORDER BY VLR_TOTAL_1100 DESC
                )
                WHERE RN > 0
            `;

            const rows = await this.sankhyaClient.executeQuery(sql);
            return this.enrichRankingWithLocalUsers(rows);
        } catch (err: any) {
            this.logger.error(`Falha no fallback de ranking: ${err.message}`);
            return [];
        }
    }

    private toTitleCase(str: string) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => {
            if (word.length <= 2 && ['de', 'do', 'da', 'dos', 'das', 'e'].includes(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }
}
