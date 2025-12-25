import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req: any, @Body() createBudgetDto: CreateBudgetDto) {
        return this.budgetsService.create(req.user.userId, createBudgetDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Request() req: any) {
        return this.budgetsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.budgetsService.findOne(id);
    }
}
