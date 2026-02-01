import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
    constructor(private prisma: PrismaService) { }

    private normalizeClientName(name?: string) {
        return (name || '').trim().toUpperCase();
    }

    private normalizeClientPhone(phone?: string) {
        return phone ? phone.replace(/\D/g, '') : '';
    }

    private async upsertClientContact(userId: string, clientName?: string, clientPhone?: string) {
        const normalizedName = this.normalizeClientName(clientName);
        if (!normalizedName) return;

        const normalizedPhone = this.normalizeClientPhone(clientPhone);

        await this.prisma.clientContact.upsert({
            where: {
                userId_normalized_name_normalized_phone: {
                    userId,
                    normalized_name: normalizedName,
                    normalized_phone: normalizedPhone
                }
            },
            update: {
                name: clientName?.trim() || normalizedName,
                phone: clientPhone || null,
                last_used_at: new Date()
            },
            create: {
                userId,
                name: clientName?.trim() || normalizedName,
                phone: clientPhone || null,
                normalized_name: normalizedName,
                normalized_phone: normalizedPhone,
                last_used_at: new Date()
            }
        });
    }

    async create(userId: string, createBudgetDto: CreateBudgetDto) {
        const { clientName, clientPhone, items, laborValue } = createBudgetDto;

        // Idempotency guard: avoid duplicate budgets created within a short window
        const recentBudget = await this.prisma.budget.findFirst({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 5000) }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { product: true } },
                user: true
            }
        });

        // 1. Validate User (Optional, since AuthGuard handles it, but good to check status)
        // const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // 2. Create Budget
        const totalMaterials = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalPrice = totalMaterials + laborValue;

        if (recentBudget) {
            const sameClient = (recentBudget.client_name || '') === (clientName || '');
            const sameTotals = Number(recentBudget.total_materials) === totalMaterials
                && Number(recentBudget.total_labor) === laborValue
                && Number(recentBudget.total_price) === totalPrice;
            const sameCount = recentBudget.items.length === items.length;
            if (sameClient && sameTotals && sameCount) {
                const normalizeItems = (list: any[]) =>
                    list
                        .map(i => ({
                            productId: i.productId || null,
                            isExternal: !!i.is_external || !!i.isExternal,
                            customName: i.custom_name || i.customName || null,
                            quantity: i.quantity,
                            price: Number(i.price)
                        }))
                        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

                const a = normalizeItems(recentBudget.items);
                const b = normalizeItems(items);
                const sameItems = a.length === b.length && a.every((val, idx) => JSON.stringify(val) === JSON.stringify(b[idx]));
                if (sameItems) {
                    return recentBudget;
                }
            }
        }

        const budget = await this.prisma.budget.create({
            data: {
                userId: userId,
                client_name: clientName,
                client_phone: clientPhone,

                // Novos Campos
                execution_time: createBudgetDto.executionTime,
                payment_terms: createBudgetDto.paymentTerms,
                validity: createBudgetDto.validity,
                warranty: createBudgetDto.warranty,

                total_materials: totalMaterials,
                total_labor: laborValue,
                labor_description: createBudgetDto.laborDescription,
                total_price: totalPrice,
                status: (createBudgetDto.status as any) || 'SHARED',
                notes: createBudgetDto.notes,
                show_unit_prices: createBudgetDto.showUnitPrices ?? true,
                show_labor_total: createBudgetDto.showLaborTotal ?? true,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        is_external: item.isExternal || false,
                        custom_name: item.customName,
                        custom_photo_url: item.customPhotoUrl,
                        suggested_source: item.suggestedSource,
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

        await this.upsertClientContact(userId, clientName, clientPhone);

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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        logo_url: true,
                        city: true,
                        state: true,
                        role: true,
                        business_name: true
                    }
                },
            },
        });
    }

    async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
        const { clientName, clientPhone, items, laborValue, status } = updateBudgetDto;

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

        const updatedBudget = await this.prisma.$transaction(async (prisma) => {
            // Update Header
            const updatedBudget = await prisma.budget.update({
                where: { id },
                data: {
                    client_name: clientName,
                    client_phone: clientPhone,
                    total_materials: currentMaterials,
                    total_labor: currentLabor,
                    labor_description: updateBudgetDto.laborDescription,
                    total_price: totalPrice,
                    status: (status as any) || budget.status,
                    notes: updateBudgetDto.notes,
                    show_unit_prices: updateBudgetDto.showUnitPrices ?? budget.show_unit_prices,
                    show_labor_total: updateBudgetDto.showLaborTotal ?? budget.show_labor_total,

                    // New Fields Update
                    execution_time: updateBudgetDto.executionTime,
                    payment_terms: updateBudgetDto.paymentTerms,
                    validity: updateBudgetDto.validity,
                    warranty: updateBudgetDto.warranty,
                }
            });

            // Update Items (Delete All + Re-create) if items provided
            if (items) {
                await prisma.budgetItem.deleteMany({ where: { budgetId: id } });
                await prisma.budgetItem.createMany({
                    data: items.map((item: any) => ({
                        budgetId: id,
                        productId: item.productId,
                        is_external: item.isExternal || false,
                        custom_name: item.customName,
                        custom_photo_url: item.customPhotoUrl,
                        suggested_source: item.suggestedSource,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                });
            }

            return updatedBudget;
        });

        await this.upsertClientContact(
            userId,
            clientName ?? budget.client_name || '',
            clientPhone ?? budget.client_phone || ''
        );

        return updatedBudget;
    }

    async remove(id: string, userId: string) {
        const budget = await this.prisma.budget.findUnique({ where: { id } });
        if (!budget) throw new NotFoundException('Orçamento não encontrado');
        if (budget.userId !== userId) throw new ForbiddenException('Você não tem permissão para excluir este orçamento');

        return this.prisma.budget.delete({ where: { id } });
    }

    // Admin: View all budgets (v1.2.0)
    async findAllForAdmin(userId: string) {
        // Check if user is admin
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem visualizar todos os orçamentos');
        }

        return this.prisma.budget.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                _count: {
                    select: { items: true }
                }
            }
        });
    }
}
