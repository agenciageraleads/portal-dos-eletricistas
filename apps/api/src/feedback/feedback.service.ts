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

    // Admin use only
    async findAll() {
        return this.prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: { product: true }
        });
    }
}
