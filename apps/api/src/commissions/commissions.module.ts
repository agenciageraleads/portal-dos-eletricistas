import { Module } from '@nestjs/common';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { SankhyaModule } from '../integrations/sankhya/sankhya.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [SankhyaModule, PrismaModule],
    controllers: [CommissionsController],
    providers: [CommissionsService],
    exports: [CommissionsService],
})
export class CommissionsModule {}
