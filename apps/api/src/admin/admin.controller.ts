import { Controller, Get, Param, Patch, Query, UseGuards, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    getUsers(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        return this.adminService.getUsers(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 20
        );
    }

    @Get('users/:id')
    getUserDetails(@Param('id') id: string) {
        return this.adminService.getUserDetails(id);
    }

    @Patch('users/:id/status')
    updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.adminService.updateUserStatus(id, status);
    }

    @Get('budgets')
    getBudgets(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        return this.adminService.getBudgets(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 20
        );
    }

    @Get('budgets/stats')
    getBudgetStats() {
        return this.adminService.getBudgetStats();
    }

    @Get('feedbacks')
    getFeedbacks(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        return this.adminService.getFeedbacks(
            page ? parseInt(page) : 1,
            pageSize ? parseInt(pageSize) : 20
        );
    }

    @Patch('feedbacks/:id/reply')
    replyFeedback(@Param('id') id: string, @Body('reply') reply: string) {
        return this.adminService.replyFeedback(id, reply);
    }
}
