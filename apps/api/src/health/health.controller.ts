import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    async getHealth() {
        const [db, system] = await Promise.all([
            this.healthService.checkDatabase(),
            Promise.resolve(this.healthService.getSystemInfo()),
        ]);

        const isHealthy = db.status === 'healthy';

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: db,
                system,
            },
        };
    }

    @Get('db')
    async getDatabaseHealth() {
        return this.healthService.checkDatabase();
    }

    @Get('env')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async getEnvironmentHealth() {
        return this.healthService.checkEnvironment();
    }
}
