import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BudgetImportService } from './budget-import.service';

@Controller('admin/ai-lab')
export class AiLabController {
    constructor(private readonly budgetImportService: BudgetImportService) { }

    @Post('analyze-text')
    async analyzeText(@Body() body: { text: string }) {
        const results = await this.budgetImportService.analyzeInput({
            text: body.text,
            source: 'LAB'
        });
        return { results };
    }

    @Post('analyze-image')
    @UseInterceptors(FileInterceptor('file')) // Assuming multer setup or just handling base64 in body if simpler for now
    async analyzeImage(@Body() body: { imageUrl?: string }) {
        // ideally we upload file, but for MVP lets support URL or base64 from body if cleaner
        // Service expects imageUrl (string).
        if (!body.imageUrl) {
            return { error: 'Image URL required' };
        }
        const results = await this.budgetImportService.analyzeInput({
            imageUrl: body.imageUrl,
            source: 'LAB'
        });
        return { results };
    }
}
