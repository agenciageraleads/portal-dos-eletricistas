
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: any) {
        return this.prisma.serviceListing.create({
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
    }

    async findAll(search?: string) {
        return this.prisma.serviceListing.findMany({
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
