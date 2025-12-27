import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        // Get total counts
        const [totalUsers, totalBudgets, totalFeedbacks, totalProducts] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.budget.count(),
            this.prisma.feedback.count(),
            this.prisma.product.count({ where: { is_available: true } }),
        ]);

        // Get recent counts (last 30 days for users/budgets, 7 days for feedbacks)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [recentUsers, recentBudgets, recentFeedbacks] = await Promise.all([
            this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.budget.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.feedback.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        ]);

        return {
            users: { total: totalUsers, recent: recentUsers, period: '30 dias' },
            budgets: { total: totalBudgets, recent: recentBudgets, period: '30 dias' },
            feedbacks: { total: totalFeedbacks, recent: recentFeedbacks, period: '7 dias' },
            products: { total: totalProducts, active: totalProducts },
        };
    }

    async getUsers(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    cpf_cnpj: true,
                    phone: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { budgets: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.user.count()
        ]);

        return {
            data: users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }

    async getUserDetails(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                budgets: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    async updateUserStatus(userId: string, status: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: status as any }
        });
    }

    async getBudgets(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;

        const [budgets, total] = await Promise.all([
            this.prisma.budget.findMany({
                skip,
                take: pageSize,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    _count: {
                        select: { items: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.budget.count()
        ]);

        return {
            data: budgets,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }

    async getBudgetStats() {
        const budgets = await this.prisma.budget.findMany({
            select: { status: true, total_price: true }
        });

        const stats = budgets.reduce((acc, budget) => {
            acc[budget.status] = (acc[budget.status] || 0) + 1;
            acc.totalValue = (acc.totalValue || 0) + Number(budget.total_price);
            return acc;
        }, {} as any);

        return stats;
    }

    async getFeedbacks(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;

        const [feedbacks, total] = await Promise.all([
            this.prisma.feedback.findMany({
                skip,
                take: pageSize,
                include: {
                    product: {
                        select: {
                            name: true,
                            sankhya_code: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.feedback.count()
        ]);

        return {
            data: feedbacks,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }
}
