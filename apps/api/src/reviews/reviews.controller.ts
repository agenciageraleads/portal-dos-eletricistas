import { Controller, Get, Post, Param, Body, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    // Retorna a média de estrelas e a lista de avaliações (ordenadas com identificadas primeiro)
    @Get('user/:userId')
    async findAllForUser(@Param('userId') userId: string) {
        return this.reviewsService.findAllForUser(userId);
    }

    // Cria uma nova avaliação (Suporta usuários autenticados ou visitantes anônimos)
    @Post('user/:userId')
    async create(
        @Param('userId') targetUserId: string,
        @Request() req: any,
        @Body('rating') rating: number,
        @Body('comment') comment: string,
        @Body('isAnonymous') isAnonymous: boolean,
        @Body('authorName') authorName?: string
    ) {
        let authorId: string | null = null;

        // Se houver token na requisição, tentamos extrair o ID do usuário para vincular à conta dele
        if (req.headers?.authorization) {
            authorId = this.extractUserIdFromToken(req.headers.authorization);
        }

        // Se não tiver login e nem nome fornecido, forçamos um nome amigável de visitante
        const finalIsAnonymous = isAnonymous || !authorId;
        const finalAuthorName = authorName?.trim() || (authorId && !isAnonymous ? undefined : 'Visitante do Portal');

        return this.reviewsService.create(targetUserId, authorId, {
            rating: Number(rating),
            comment,
            isAnonymous: finalIsAnonymous,
            authorName: finalAuthorName
        });
    }

    // Helper interno para extrair userId sem estourar exceção caso o token seja inválido/vazio
    private extractUserIdFromToken(authorization: string): string | null {
        try {
            const token = authorization.replace('Bearer ', '');
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
            return payload.sub || payload.id || payload.userId;
        } catch {
            return null;
        }
    }
}
