
import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('chat')
    async chat(@Body() body: { message: string, audioUrl?: string, imageUrl?: string, sessionId?: string }, @Request() req: any) {
        return this.assistantService.chat(body.message, req.user.userId, body.audioUrl, body.imageUrl, body.sessionId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('sessions')
    async getSessions(@Request() req: any) {
        return this.assistantService.getUserSessions(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('session/:id')
    async getSessionMessages(@Request() req: any, @Param('id') id: string) {
        return this.assistantService.getSessionMessages(id, req.user.userId);
    }
}
