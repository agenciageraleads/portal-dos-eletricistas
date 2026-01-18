
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('chat')
    async chat(@Body() body: { message: string, audioUrl?: string, imageUrl?: string }, @Request() req: any) {
        return this.assistantService.chat(body.message, req.user.userId, body.audioUrl, body.imageUrl);
    }
}
