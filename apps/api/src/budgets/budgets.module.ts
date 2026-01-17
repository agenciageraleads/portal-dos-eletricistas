import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

import { BudgetImportService } from './budget-import.service';

@Module({
    controllers: [BudgetsController],
    imports: [],
    providers: [BudgetsService, BudgetImportService],
})
export class BudgetsModule { }
