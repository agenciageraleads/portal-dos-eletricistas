import { Controller, Get, Query } from '@nestjs/common';
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
}
