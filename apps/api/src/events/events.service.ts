import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) {}

    // Executa ao iniciar o servidor para garantir que o evento de sábado esteja cadastrado
    async onModuleInit() {
        try {
            const defaultEventId = 'sabado-eletricistas-2026';
            const existing = await this.prisma.event.findUnique({
                where: { id: defaultEventId },
            });

            if (!existing) {
                console.log('[EventsService] Seeding default Saturday Event...');
                await this.prisma.event.create({
                    data: {
                        id: defaultEventId,
                        title: 'Grande Encontro dos Eletricistas',
                        description: 'Evento Oficial de Lançamento e Networking da Portal Distribuidora.',
                        date: new Date('2026-05-30T09:00:00.000Z'), // Sábado agora
                        questions: [
                            {
                                id: 'especialidade',
                                label: 'Qual sua principal área de atuação?',
                                type: 'select',
                                options: ['Residencial', 'Comercial', 'Industrial', 'Predial/Condomínios', 'Subestações'],
                            },
                            {
                                id: 'sankhya_conhece',
                                label: 'Você já conhecia a Portal Distribuidora?',
                                type: 'select',
                                options: ['Sim, sou cliente ativo', 'Sim, por nome', 'Não, primeira vez'],
                            },
                            {
                                id: 'canal_comunicacao',
                                label: 'Como você ficou sabendo do evento?',
                                type: 'select',
                                options: ['Instagram', 'WhatsApp', 'Vendedor da Portal', 'Grupo de Eletricistas', 'Indicação'],
                            },
                        ] as any,
                    },
                });
                console.log('[EventsService] Seed completed successfully');
            }
        } catch (error) {
            console.error('[EventsService] Seed Error:', error);
        }
    }

    // Busca detalhes de um evento
    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new NotFoundException('Evento não encontrado');
        }

        return event;
    }

    // Realiza o Check-in (presença + respostas das perguntas)
    async checkin(eventId: string, userId: string, answers: any) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException('Evento não encontrado');
        }

        // Verifica se o usuário já fez check-in
        const existingCheckin = await this.prisma.eventCheckin.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });

        if (existingCheckin) {
            return {
                message: 'Presença já confirmada anteriormente!',
                checkin: existingCheckin,
                alreadyDone: true,
            };
        }

        // Registra o check-in no BD
        const newCheckin = await this.prisma.eventCheckin.create({
            data: {
                eventId,
                userId,
                answers: answers || {},
            },
        });

        // Atualiza o perfil do eletricista para Ativo e Disponível (como incentivo do evento)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                cadastro_finalizado: true,
                isAvailableForWork: true, // Já fica visível nas buscas locais após check-in!
            },
        });

        return {
            message: 'Presença confirmada com sucesso no evento!',
            checkin: newCheckin,
            alreadyDone: false,
        };
    }

    // Retorna relatório e estatísticas do check-in (para a organização do evento/Admin)
    async getStats(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException('Evento não encontrado');
        }

        const checkins = await this.prisma.eventCheckin.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        city: true,
                        state: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Consolidação de respostas dos questionários
        const stats: any = {};
        const questionsList = (event.questions as any[]) || [];

        // Inicializa contadores
        questionsList.forEach(q => {
            stats[q.id] = {
                label: q.label,
                distribution: {},
            };
            if (q.options) {
                q.options.forEach((opt: string) => {
                    stats[q.id].distribution[opt] = 0;
                });
            }
        });

        checkins.forEach(chk => {
            const userAnswers = (chk.answers as Record<string, string>) || {};
            Object.keys(userAnswers).forEach(qId => {
                const answerVal = userAnswers[qId];
                if (stats[qId] && answerVal) {
                    stats[qId].distribution[answerVal] = (stats[qId].distribution[answerVal] || 0) + 1;
                }
            });
        });

        return {
            eventTitle: event.title,
            totalAttendees: checkins.length,
            attendees: checkins.map(c => ({
                name: c.user.name,
                email: c.user.email,
                phone: c.user.phone,
                city: c.user.city,
                state: c.user.state,
                checkedInAt: c.createdAt,
                answers: c.answers,
            })),
            surveyStats: stats,
        };
    }
}
