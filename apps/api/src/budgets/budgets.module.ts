import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

import { BudgetImportService } from './budget-import.service';
import { AiLabController } from './ai-lab.controller';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    controllers: [BudgetsController, AiLabController],
    imports: [NotificationsModule],
    providers: [BudgetsService, BudgetImportService],
    exports: [BudgetsService],
})
export class BudgetsModule { }
