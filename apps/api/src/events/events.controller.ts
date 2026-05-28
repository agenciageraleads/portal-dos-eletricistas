import { Controller, Get, Post, Param, Body, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly prisma: PrismaService
    ) {}

    // Rota pública para buscar as perguntas e metadados do evento ao escanear o QR Code
    @Get(':id')
    async getEvent(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    // Rota autenticada para confirmar a presença do eletricista e colher respostas
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/checkin')
    async checkin(
        @Param('id') id: string,
        @Request() req: any,
        @Body('answers') answers: any
    ) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.eventsService.checkin(id, userId, answers);
    }

    // Rota restrita para Administradores visualizarem o painel de presença e dados consolidados em tempo real
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/stats')
    async getStats(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        
        // Verifica se o solicitante é um ADMIN
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user || user.role !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem visualizar o painel de estatísticas do evento.');
        }

        return this.eventsService.getStats(id);
    }
}
