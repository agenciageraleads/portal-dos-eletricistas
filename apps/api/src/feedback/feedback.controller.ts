import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Prisma } from '@prisma/client';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { AuthGuard } from '@nestjs/passport'; // Assumindo AuthGuard padrão

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    // @UseGuards(AuthGuard('jwt')) // Optional: make feedback public but track user if logged in
    create(@Body() data: CreateFeedbackDto, @Request() req: any) {
        // req.user might be populated if we use a global guard or optional guard. 
        // If not, we might need to parse manually or just rely on client sending userEmail.
        // Let's Assume Optional Auth Guard or just check req.user if available (middleware populated)
        // For now, let's keep it simple. If we want userId, we need Guard.
        // Let's assume frontend sends requests with header, but without Guard, req.user is undefined in Nest standard behavior unless using a middleware.
        // If we want to capture user, let's add UseGuards but make it handle optional? Or just Require it.
        // User asked "para ouvirmos o usuario". Usually logged inside app.

        // Since I cannot check Authentication Configuration (Global Guards?), I will check if I can get user from request if I add Guard.
        // BUT, Feedback page doesn't require login logic in my code above.
        // I will add userId to DTO? No, unsecure.
        // I will just leave as is for now to avoid breaking public feedback, but add TODO.
        // Actually, schema has `userId`.

        const createInput: Prisma.FeedbackCreateInput = {
            message: data.message,
            type: data.type,
            userEmail: data.userEmail // Ensure DTO has this
        };

        if (data.productId) {
            createInput.product = { connect: { id: data.productId } };
        }

        // If I want to support userId, I'd need to change signature to include req and use Guard.
        // I'll skip modifying Controller heavy logic to avoid breaking auth flow I don't fully see.
        // Main goal is just to SAVE feedback. Schema supports it.
        // I'll stick to basic saving.

        return this.feedbackService.create(createInput);
    }

    @Get()
    findAll() {
        return this.feedbackService.findAll();
    }
}
