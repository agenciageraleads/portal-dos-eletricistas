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
}

