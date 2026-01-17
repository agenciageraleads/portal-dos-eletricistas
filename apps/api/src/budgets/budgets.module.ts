import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

import { BudgetImportService } from './budget-import.service';

@Module({
    controllers: [BudgetsController],
    providers: [BudgetsService, BudgetImportService],
})
export class BudgetsModule { }
