import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.FeedbackCreateInput) {
        return this.prisma.feedback.create({
            data,
        });
    }

    // List feedbacks with privacy (Item 2.5)
    async findAll(user: any) {
        const where: Prisma.FeedbackWhereInput = {};

        // If not ADMIN, only see own feedbacks
        if (user.role !== 'ADMIN') {
            where.userId = user.id;
        }

        return this.prisma.feedback.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { product: true }
        });
    }

    async reply(id: string, reply: string) {
        return this.prisma.feedback.update({
            where: { id },
            data: {
                reply,
                repliedAt: new Date()
            }
        });
    }
}
