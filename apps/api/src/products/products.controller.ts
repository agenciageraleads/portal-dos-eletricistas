import { Controller, Get, Query, Patch, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(
        @Query('q') query?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('category') category?: string,
    ) {
        return this.productsService.findAll(query, Number(page), Number(limit), category);
    }

    @Get('failed-search')
    logFailed(@Query('q') query: string) {
        // Simple GET endpoint for easier triggering from frontend or keeping it simple
        // Or POST. Let's stick to GET for "fire and forget" image pixel style or just simple fetch
        // Actually, user requested "Click a button", so POST is fine.
        // Let's make it a POST to /products/failed-search or just /products/log-search?
        // Let's use the SERVICE method.
        if (query) {
            this.productsService.logFailedSearch(query);
        }
    }

    // Admin Endpoints (Should be protected by RoleGuard in real app)
    @Get('admin/failed-searches')
    getFailedSearches(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        return this.productsService.getFailedSearches(Number(page), Number(limit));
    }

    @Patch('admin/:id')
    updateProduct(@Param('id') id: string, @Body() data: any) {
        return this.productsService.updateProduct(id, data);
    }
}

