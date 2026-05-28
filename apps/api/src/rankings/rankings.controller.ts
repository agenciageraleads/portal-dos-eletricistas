import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController {
    constructor(private readonly rankingsService: RankingsService) {}

    /**
     * Endpoint público para buscar o ranking de indicações dos eletricistas
     * GET /rankings/public?period=semana|mes|ano
     */
    @Get('public')
    async getPublicRanking(@Query('period') period?: string) {
        // Validação e normalização do período (default: mes)
        const activePeriod = (period || 'mes').toLowerCase();

        if (!['semana', 'mes', 'ano'].includes(activePeriod)) {
            throw new BadRequestException('Período inválido. Use "semana", "mes" ou "ano".');
        }

        return this.rankingsService.getPublicRanking(activePeriod as 'semana' | 'mes' | 'ano');
    }
}
