import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createBudgetDto: CreateBudgetDto) {
        const { clientName, clientPhone, items, laborValue } = createBudgetDto;

        // 1. Validate User (Optional, since AuthGuard handles it, but good to check status)
        // const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // 2. Create Budget
        const totalMaterials = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalPrice = totalMaterials + laborValue;

        const budget = await this.prisma.budget.create({
            data: {
                userId: userId,
                client_name: clientName,
                client_phone: clientPhone,
                total_materials: totalMaterials,
                total_labor: laborValue,
                total_price: totalPrice,
                status: 'SHARED',
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: true
            }
        });

        return budget;
    }

    async findAll(userId: string) {
        return this.prisma.budget.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { items: true }
                }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.budget.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true },
                },
                user: true,
            },
        });
    }
}
