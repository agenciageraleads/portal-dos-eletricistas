import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ElectricianSyncService } from './electrician-sync.service';
import { SyncController } from './sync.controller';
import { SankhyaModule } from '../integrations/sankhya/sankhya.module';
import { EvolutionModule } from '../integrations/evolution/evolution.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [SankhyaModule, EvolutionModule, PrismaModule],
    providers: [SyncService, ElectricianSyncService],
    controllers: [SyncController],
})
export class SyncModule { }
