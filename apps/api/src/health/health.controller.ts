import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    async getHealth() {
        const [db, env, system] = await Promise.all([
            this.healthService.checkDatabase(),
            this.healthService.checkEnvironment(),
            Promise.resolve(this.healthService.getSystemInfo()),
        ]);

        const isHealthy = db.status === 'healthy' && env.status === 'healthy';

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: db,
                environment: env,
                system,
            },
        };
    }

    @Get('db')
    async getDatabaseHealth() {
        return this.healthService.checkDatabase();
    }

    @Get('env')
    async getEnvironmentHealth() {
        return this.healthService.checkEnvironment();
    }
}
