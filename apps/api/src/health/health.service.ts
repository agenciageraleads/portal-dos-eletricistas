import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class HealthService {
    private prisma = new PrismaClient();

    async checkDatabase(): Promise<{ status: string; message: string }> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'healthy',
                message: 'Database connection is active',
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `Database connection failed: ${error.message}`,
            };
        }
    }

    async checkEnvironment(): Promise<{
        status: string;
        missing: string[];
        present: string[];
    }> {
        const requiredVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'PORT',
            'FRONTEND_URL',
        ];

        const missing = requiredVars.filter((varName) => !process.env[varName]);
        const present = requiredVars.filter((varName) => process.env[varName]);

        return {
            status: missing.length === 0 ? 'healthy' : 'unhealthy',
            missing,
            present,
        };
    }

    getSystemInfo() {
        return {
            version: '0.1.1',
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3333,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
}
