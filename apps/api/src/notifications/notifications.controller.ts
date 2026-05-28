
import { Controller, Get, Param, Patch, Request, UseGuards, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req) {
        return this.notificationsService.findAll(req.user.id);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @Request() req) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Post('fcm-token')
    saveFcmToken(@Body() body: { token: string; deviceType?: string }, @Request() req) {
        return this.notificationsService.saveFcmToken(req.user.id, body.token, body.deviceType);
    }
}
