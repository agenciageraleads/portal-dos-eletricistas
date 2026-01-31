import { Controller, Get, Query, Patch, Body, Param, Post } from '@nestjs/common';
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
        @Query('orderBy') orderBy?: string,
        @Query('type') type?: string,
    ) {
        return this.productsService.findAll(query, Number(page), Number(limit), category, orderBy, type);
    }

    @Get('failed-search')
    logFailed(@Query('q') query: string) {
        if (query) {
            this.productsService.logFailedSearch(query);
        }
    }

    @Post('suggestions')
    async createSuggestion(@Body() body: { name: string, category?: string, description?: string, suggestedBy?: string }) {
        return this.productsService.createSuggestion(body);
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

    @Post('admin/synonyms')
    async addSynonym(@Body() body: { term: string, synonyms: string[] }) {
        return this.productsService.addSynonym(body.term, body.synonyms);
    }

    @Get('admin/search-suggestions')
    async generateSearchSuggestions(@Query('term') term: string) {
        return this.productsService.generateSearchSuggestions(term);
    }
}

