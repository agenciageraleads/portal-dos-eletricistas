import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        try {
            console.log('Updating profile for user:', userId, 'Data:', data);
            return await this.prisma.user.update({
                where: { id: userId },
                data,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async findById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { budgets: true }
                }
            }
        });
    }

    // Admin: List all users (v1.2.0)
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                logo_url: true,
                createdAt: true,
                _count: {
                    select: { budgets: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Admin: Update user role (v1.2.0)
    async updateRole(userId: string, role: 'ELETRICISTA' | 'ADMIN') {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    }

    // Admin: Generate Reset Token manually
    async generateManualResetToken(userId: string) {
        // Generate 6-digit code
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Valid for 1 hour

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                reset_token: token,
                reset_token_expires: expires
            }
        });

        return { token };
    }
    // Services: Find available electricians (v2.0)
    async findAvailable(city?: string) {
        const isFeatureEnabled = process.env.FEATURE_PRE_REG_DISABLED !== 'true';

        const where: any = {
            role: 'ELETRICISTA',
            OR: [
                { isAvailableForWork: true }
            ]
        };

        if (isFeatureEnabled) {
            where.OR.push({ pre_cadastrado: true });
        }

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                city: true,
                state: true,
                logo_url: true,
                phone: true,
                isAvailableForWork: true,
                pre_cadastrado: true,
                cadastro_finalizado: true,
                commercial_index: true // Adicionado para ranking
            },
            orderBy: [
                { commercial_index: 'desc' }, // Prioridade máxima: índice comercial Sankhya
                { cadastro_finalizado: 'desc' },
                { name: 'asc' }
            ]
        });
    }

    async getPublicProfile(id: string) {
        // Increment view count asynchronously
        this.prisma.user.update({
            where: { id },
            data: { view_count: { increment: 1 } }
        }).catch(err => console.error('Error incrementing view_count:', err));

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                business_name: true,
                city: true,
                state: true,
                bio: true,
                logo_url: true,
                role: true,
                phone: true,
                cadastro_finalizado: true,
                commercial_index: true,
                total_orders: true,
                view_count: true,
                createdAt: true,
            }
        });

        if (!user) {
            return null;
        }

        return user;
    }

    async count() {
        // Count only finalized registrations or all? 
        // For gamification/social proof, counting all valid emails is usually better.
        // Assuming we want 'users' not just electricians.
        return { count: await this.prisma.user.count() };
    }
}
