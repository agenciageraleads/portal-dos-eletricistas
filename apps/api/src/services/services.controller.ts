
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('city') city?: string,
        @Query('type') type?: 'REQUEST' | 'OFFER',
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ) {
        return this.servicesService.findAll({ search, city, type, minPrice, maxPrice });
    }

    @Post('public')
    createPublic(@Body() createDto: any) {
        // Public services have no userId (or specific logic)
        return this.servicesService.create(null, createDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req: any, @Body() createDto: any) {
        return this.servicesService.create(req.user.userId, createDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.servicesService.remove(id, req.user.userId);
    }
}
