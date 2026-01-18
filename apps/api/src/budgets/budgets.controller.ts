import { Controller, Post, Body, Get, Param, UseGuards, Request, Patch, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from '@nestjs/passport';

import { BudgetImportService } from './budget-import.service';

@Controller('budgets')
export class BudgetsController {
    constructor(
        private readonly budgetsService: BudgetsService,
        private readonly budgetImportService: BudgetImportService
    ) { }

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

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
        return this.budgetsService.update(id, req.user.userId, updateBudgetDto);
    }

    // Admin: Get all budgets (v1.2.0)
    @UseGuards(AuthGuard('jwt'))
    @Get('admin/all')
    async findAllAdmin(@Request() req: any) {
        return this.budgetsService.findAllForAdmin(req.user.userId);
    }

    // Smart Import (v1.5.0)
    @UseGuards(AuthGuard('jwt'))
    @Post('smart-import')
    async smartImport(@Body() body: { text?: string; imageUrl?: string }) {
        return this.budgetImportService.processInput(body);
    }
    @UseGuards(AuthGuard('jwt'))
    @Post('feedback')
    async feedback(@Request() req: any, @Body() body: { original_text: string; ai_model?: string; suggested_pid?: string; correct_pid?: string; correction_type: string }) {
        return this.budgetImportService.registerFeedback(req.user.userId, body);
    }
}
