import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

import { BudgetImportService } from './budget-import.service';
import { AiLabController } from './ai-lab.controller';

@Module({
    controllers: [BudgetsController, AiLabController],
    imports: [],
    providers: [BudgetsService, BudgetImportService],
    exports: [BudgetsService],
})
export class BudgetsModule { }
