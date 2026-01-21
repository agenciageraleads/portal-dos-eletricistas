
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServicesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async create(userId: string, data: any) {
        const service = await this.prisma.serviceListing.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                price: data.price ? Number(data.price) : null,
                city: data.city,
                state: data.state,
                date: new Date(data.date),
                whatsapp: data.whatsapp,
                type: data.type || 'REQUEST'
            }
        });

        // Notify Electricians if it's a REQUEST
        if (service.type === 'REQUEST') {
            const availableElectricians = await this.prisma.user.findMany({
                where: {
                    role: 'ELETRICISTA',
                    isAvailableForWork: true,
                    // TODO: Add city filter when User has address/location
                    id: { not: userId } // Don't notify self
                }
            });

            const notificationPromises = availableElectricians.map(electrician =>
                this.notificationsService.create(
                    electrician.id,
                    'Nova Oportunidade!',
                    `Novo serviço em ${service.city || 'sua região'}: ${service.title}`,
                    'NEW_SERVICE',
                    `/services` // Link to services page
                )
            );

            // Execute without blocking the response
            Promise.all(notificationPromises).catch(err => console.error('Failed to send notifications', err));
        }

        return service;
    }

    async findAll(search?: string) {
        try {
            return await this.prisma.serviceListing.findMany({
                where: {
                    status: 'OPEN',
                    ...(search ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                            { city: { contains: search, mode: 'insensitive' } }
                        ]
                    } : {})
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, logo_url: true } }
                }
            });
        } catch (error) {
            console.error('Error in ServicesService.findAll:', error);
            throw error;
        }
    }

    async remove(id: string, userId: string) {
        const listing = await this.prisma.serviceListing.findUnique({ where: { id } });
        if (!listing) throw new NotFoundException('Vaga não encontrada');

        if (listing.userId !== userId) {
            throw new ForbiddenException('Você não pode excluir este anúncio');
        }

        return this.prisma.serviceListing.delete({ where: { id } });
    }
}
