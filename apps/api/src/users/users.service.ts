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
}
