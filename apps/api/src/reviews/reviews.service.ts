import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) {}

    // Cria uma nova avaliação para um eletricista
    async create(
        targetUserId: string,
        authorId: string | null,
        data: { rating: number; comment: string; isAnonymous: boolean; authorName?: string }
    ) {
        // Validação da nota (1 a 5 estrelas)
        if (data.rating < 1 || data.rating > 5) {
            throw new BadRequestException('A avaliação deve ser entre 1 e 5 estrelas');
        }

        if (!data.comment || data.comment.trim().length === 0) {
            throw new BadRequestException('O comentário da avaliação é obrigatório');
        }

        // Verifica se o profissional avaliado existe e é um ELETRICISTA
        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
        });

        if (!targetUser || targetUser.role !== 'ELETRICISTA') {
            throw new NotFoundException('Eletricista não encontrado');
        }

        let finalAuthorName = data.authorName?.trim() || 'Usuário Anônimo';

        // Se o autor estiver logado e NÃO quiser ser anônimo, buscamos o nome real dele
        if (authorId && !data.isAnonymous) {
            const author = await this.prisma.user.findUnique({
                where: { id: authorId },
                select: { name: true },
            });
            if (author) {
                finalAuthorName = author.name;
            }
        }

        // Se for anônimo, forçamos o autorName a ocultar detalhes sensíveis
        if (data.isAnonymous) {
            finalAuthorName = data.authorName?.trim() || 'Colega Anônimo';
        }

        return this.prisma.review.create({
            data: {
                targetUserId,
                authorId: data.isAnonymous ? null : authorId, // se for anônimo, desvincula relação direta no BD para segurança
                isAnonymous: data.isAnonymous,
                authorName: finalAuthorName,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }

    // Busca avaliações de um eletricista
    async findAllForUser(targetUserId: string) {
        // Busca as avaliações ordenando: Identificadas Primeiro (isAnonymous: false vem antes de true), depois por Data mais recente
        const reviews = await this.prisma.review.findMany({
            where: { targetUserId },
            orderBy: [
                { isAnonymous: 'asc' }, // false (0) vem antes de true (1) no PostgreSQL
                { createdAt: 'desc' }
            ],
            include: {
                author: {
                    select: {
                        name: true,
                        logo_url: true,
                    },
                },
            },
        });

        // Calcula a média das estrelas
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
            averageRating = parseFloat((sum / reviews.length).toFixed(1));
        }

        // Calcula a contagem de cada nota (para o gráfico de estrelas do UI)
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(rev => {
            if (rev.rating >= 1 && rev.rating <= 5) {
                ratingDistribution[rev.rating as 1 | 2 | 3 | 4 | 5]++;
            }
        });

        return {
            reviews,
            stats: {
                averageRating,
                totalReviews: reviews.length,
                ratingDistribution,
            },
        };
    }
}
