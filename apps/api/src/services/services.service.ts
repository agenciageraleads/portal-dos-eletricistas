
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ServiceStatus, ServiceType } from '@prisma/client';

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
                type: data.type || ServiceType.CLIENT_SERVICE,
                maxLeads: this.determineMaxLeads(data.type),
                status: ServiceStatus.OPEN
            }
        });

        // Notify Electricians if it's a REQUEST or CLIENT_SERVICE
        if (service.type === ServiceType.REQUEST || service.type === ServiceType.CLIENT_SERVICE) {
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
        type?: ServiceType | string;
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

            // Map results to ensure user object exists for Guest posts AND HIDE WHATSAPP
            return services.map(service => {
                const { whatsapp, ...safeService } = service; // Destructure to remove whatsapp
                return {
                    ...safeService,
                    user: service.user || { name: 'Visitante (WhatsApp)', logo_url: null }
                };
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

    private determineMaxLeads(type: ServiceType): number {
        switch (type) {
            case ServiceType.PRO_SUBCONTRACT: return 5;
            case ServiceType.PRO_HELPER_JOB: return 15;
            case ServiceType.CLIENT_SERVICE:
            default: return 3;
        }
    }

    async getContact(id: string, userId: string) {
        const service = await this.prisma.serviceListing.findUnique({
            where: { id },
            include: { leads: { where: { userId } } }
        });

        if (!service) throw new NotFoundException('Vaga não encontrada');

        // Allow owner to see
        if (userId && service.userId === userId) {
            return { whatsapp: service.whatsapp };
        }

        // If already unlocked by this user, return
        if (service.leads.length > 0) {
            return { whatsapp: service.whatsapp, alreadyUnlocked: true };
        }

        // Check status and limits
        if (service.status !== ServiceStatus.OPEN) {
            throw new ForbiddenException('Esta oportunidade já foi encerrada ou expirou.');
        }

        if (service.leadsCount >= service.maxLeads) {
            // Should have been closed, but double check
            await this.prisma.serviceListing.update({
                where: { id },
                data: { status: ServiceStatus.LIMIT_REACHED }
            });
            throw new ForbiddenException('Limite de candidatos atingido.');
        }

        // Unlock logic
        // Transaction to ensure atomicity
        const result = await this.prisma.$transaction(async (prisma) => {
            // Re-check count inside transaction? Prisma doesn't lock rows by default without raw query, 
            // but leadsCount update is atomic.
            // We create the lead record first.
            await prisma.serviceLead.create({
                data: {
                    serviceListingId: id,
                    userId: userId
                }
            });

            const updatedService = await prisma.serviceListing.update({
                where: { id },
                data: { leadsCount: { increment: 1 } }
            });

            // Close if limit reached
            if (updatedService.leadsCount >= updatedService.maxLeads) {
                await prisma.serviceListing.update({
                    where: { id },
                    data: { status: ServiceStatus.LIMIT_REACHED }
                });
            }

            return updatedService;
        });

        return { whatsapp: service.whatsapp, remaining: result.maxLeads - result.leadsCount };
    }

    async close(id: string, userId: string, reason: string) {
        const service = await this.prisma.serviceListing.findUnique({ where: { id } });
        if (!service) throw new NotFoundException('Vaga não encontrada');

        if (service.userId !== userId) {
            throw new ForbiddenException('Apenas o criador pode encerrar o pedido.');
        }

        // Map reason to status
        let newStatus = ServiceStatus.CLOSED_CANCELED;
        if (reason === 'HIRED') newStatus = ServiceStatus.CLOSED_HIRED;
        // if (reason === 'GAVE_UP') newStatus = ServiceStatus.CLOSED_GAVE_UP; // Removido pois não existe no Enum
        if (reason === 'GAVE_UP') newStatus = ServiceStatus.CLOSED_CANCELED;

        return this.prisma.serviceListing.update({
            where: { id },
            data: {
                status: newStatus,
                closeReason: reason
            }
        });
    }

    async getMyLeads(userId: string) {
        return this.prisma.serviceLead.findMany({
            where: { userId },
            include: { serviceListing: true }
        });
    }
}
