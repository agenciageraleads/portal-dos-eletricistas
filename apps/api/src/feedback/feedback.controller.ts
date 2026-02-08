import { Body, Controller, Get, Post, Patch, Param, UseGuards, Request, Injectable, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Prisma } from '@prisma/client';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // No error thrown if no user is found
        if (err || !user) {
            return null;
        }
        return user;
    }
}

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    create(@Body() data: CreateFeedbackDto, @Request() req: any) {
        const createInput: Prisma.FeedbackCreateInput = {
            message: data.message,
            type: data.type,
            userEmail: data.userEmail
        };

        if (data.productId) {
            createInput.product = { connect: { id: data.productId } };
        }

        if (req.user) {
            createInput.user = { connect: { id: req.user.id } };
            // If userEmail is not provided in body but user is logged in, we could use user.email
            if (!createInput.userEmail) {
                createInput.userEmail = req.user.email;
            }
        }

        return this.feedbackService.create(createInput);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Request() req: any, @Query('scope') scope?: string) {
        return this.feedbackService.findAll(req.user, scope);
    }

    @Patch(':id/reply')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async reply(@Param('id') id: string, @Body() body: { reply: string }) {
        return this.feedbackService.reply(id, body.reply);
    }
    @Patch(':id/resolve')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async resolve(@Param('id') id: string) {
        return this.feedbackService.resolve(id);
    }
}
