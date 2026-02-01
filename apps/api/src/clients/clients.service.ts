import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    async list(userId: string, search?: string) {
        const where: any = { userId };

        if (search && search.trim().length > 0) {
            const normalizedName = search.trim().toUpperCase();
            const normalizedPhone = search.replace(/\D/g, '');
            where.OR = [
                { normalized_name: { contains: normalizedName } },
                ...(normalizedPhone ? [{ normalized_phone: { contains: normalizedPhone } }] : [])
            ];
        }

        return this.prisma.clientContact.findMany({
            where,
            orderBy: [
                { last_used_at: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 20
        });
    }
}
