
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServicesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async create(userId: string | null, data: any) {
        const service = await this.prisma.serviceListing.create({
            data: {
                userId: userId, // Can be null if schema allows, or handle guest user
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
                    // Filter by city if set, to avoid spamming everyone
                    city: service.city ? { contains: service.city, mode: 'insensitive' } : undefined,
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

    async findAll(filters: {
        search?: string;
        city?: string;
        type?: 'REQUEST' | 'OFFER';
        minPrice?: string;
        maxPrice?: string;
    }) {
        try {
            const { search, city, type, minPrice, maxPrice } = filters;

            const where: any = {
                status: 'OPEN',
            };

            // Search filter (text)
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            // City filter
            if (city) {
                where.city = { contains: city, mode: 'insensitive' };
            }

            // Type filter
            if (type) {
                where.type = type;
            }

            // Price range filter
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.gte = Number(minPrice);
                if (maxPrice) where.price.lte = Number(maxPrice);
            }

            const services = await this.prisma.serviceListing.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, logo_url: true } }
                }
            });

            // Map results to ensure user object exists for Guest posts
            return services.map(service => ({
                ...service,
                user: service.user || { name: 'Visitante (WhatsApp)', logo_url: null }
            }));
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
