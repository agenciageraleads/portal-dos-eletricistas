import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

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

    async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
        const { clientName, clientPhone, items, laborValue } = updateBudgetDto;

        // 1. Verify ownership
        const budget = await this.prisma.budget.findUnique({ where: { id } });
        if (!budget) throw new NotFoundException('Orçamento não encontrado');
        if (budget.userId !== userId) throw new ForbiddenException('Você não tem permissão para editar este orçamento');

        // 2. Calculate totals
        const totalMaterials = items ? items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) : budget.total_materials;

        // If laborValue is present, use it, else use old.
        // Prisma returns Decimal for totals. We need to handle this.
        const currentLabor = Number(laborValue !== undefined ? laborValue : budget.total_labor);
        const currentMaterials = Number(items ? items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) : budget.total_materials);
        const totalPrice = currentMaterials + currentLabor;

        return this.prisma.$transaction(async (prisma) => {
            // Update Header
            const updatedBudget = await prisma.budget.update({
                where: { id },
                data: {
                    client_name: clientName,
                    client_phone: clientPhone,
                    total_materials: currentMaterials,
                    total_labor: currentLabor,
                    total_price: totalPrice,
                }
            });

            // Update Items (Delete All + Re-create) if items provided
            if (items) {
                await prisma.budgetItem.deleteMany({ where: { budgetId: id } });
                await prisma.budgetItem.createMany({
                    data: items.map((item: any) => ({
                        budgetId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                });
            }

            return updatedBudget;
        });
    }
}
