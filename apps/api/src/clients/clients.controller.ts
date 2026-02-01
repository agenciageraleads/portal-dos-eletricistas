import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    list(@Request() req: any, @Query('search') search?: string) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.clientsService.list(userId, search);
    }
}
