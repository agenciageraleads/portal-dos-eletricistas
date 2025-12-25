import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Prisma } from '@prisma/client';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    create(@Body() data: CreateFeedbackDto) {
        const createInput: Prisma.FeedbackCreateInput = {
            message: data.message,
            type: data.type,
        };

        if (data.productId) {
            createInput.product = { connect: { id: data.productId } };
        }

        return this.feedbackService.create(createInput);
    }

    @Get()
    findAll() {
        return this.feedbackService.findAll();
    }
}
