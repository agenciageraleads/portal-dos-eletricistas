import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SankhyaModule } from '../integrations/sankhya/sankhya.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [SankhyaModule, PrismaModule],
    providers: [SyncService],
    controllers: [SyncController],
})
export class SyncModule { }
