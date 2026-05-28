import { Controller, Get, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommissionsService } from './commissions.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('commissions')
@UseGuards(AuthGuard('jwt'))
export class CommissionsController {
    constructor(
        private readonly commissionsService: CommissionsService,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Retorna o resumo financeiro consolidado do eletricista logado
     */
    @Get('summary')
    async getSummary(@Request() req: any) {
        const userId = req.user.sub || req.user.id;

        // Busca o usuário logado no banco de dados local para obter o sankhya_vendor_id (CODVENDTEC)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { sankhya_vendor_id: true }
        });

        if (!user || !user.sankhya_vendor_id) {
            // Caso o usuário não possua integração ativa com o Sankhya, retorna um resumo zerado
            return {
                totalIndications: 0,
                totalRevenue: 0,
                totalCommission: 0,
                commissionRate: 0.02,
                commissionAvailable: 0,
                integrated: false,
                message: 'Você ainda não possui um código de vendedor técnico vinculado no Sankhya. Entre em contato com o suporte da Portal.'
            };
        }

        const summary = await this.commissionsService.getSummary(user.sankhya_vendor_id);
        return {
            ...summary,
            integrated: true
        };
    }

    /**
     * Retorna a lista detalhada de indicações (vendas faturadas) do eletricista logado
     */
    @Get('indications')
    async getIndications(@Request() req: any) {
        const userId = req.user.sub || req.user.id;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { sankhya_vendor_id: true }
        });

        if (!user || !user.sankhya_vendor_id) {
            return [];
        }

        return this.commissionsService.getIndications(user.sankhya_vendor_id);
    }
}
