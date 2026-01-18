
import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from '../services/services.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [ConfigModule, ServicesModule, BudgetsModule, UsersModule],
    controllers: [AssistantController],
    providers: [AssistantService],
})
export class AssistantModule { }
