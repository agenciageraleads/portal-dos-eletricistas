import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) {}

    // Cria uma nova postagem de trabalho realizado
    async create(userId: string, data: { title: string; description?: string; imageUrl: string }) {
        return this.prisma.post.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        logo_url: true,
                    },
                },
            },
        });
    }

    // Busca o feed de trabalhos realizados
    async findAll(currentUserId?: string) {
        const posts = await this.prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
                comments: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                logo_url: true,
                            },
                        },
                    },
                },
            },
        });

        // Adiciona um campo virtual para indicar se o usuário atual curtiu e a contagem de likes
        return posts.map(post => {
            const isLiked = currentUserId ? post.likes.some(like => like.userId === currentUserId) : false;
            return {
                ...post,
                likesCount: post.likes.length,
                isLiked,
                likes: undefined, // remove array de IDs para enxugar o JSON
            };
        });
    }

    // Busca posts de um eletricista específico (para o perfil dele)
    async findByUserId(userId: string, currentUserId?: string) {
        const posts = await this.prisma.post.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
                comments: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                logo_url: true,
                            },
                        },
                    },
                },
            },
        });

        return posts.map(post => {
            const isLiked = currentUserId ? post.likes.some(like => like.userId === currentUserId) : false;
            return {
                ...post,
                likesCount: post.likes.length,
                isLiked,
                likes: undefined,
            };
        });
    }

    // Curte ou descurte um post (Toggle Like)
    async toggleLike(postId: string, userId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Postagem não encontrada');
        }

        const existingLike = await this.prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });

        if (existingLike) {
            await this.prisma.postLike.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId,
                    },
                },
            });
            return { liked: false };
        } else {
            await this.prisma.postLike.create({
                data: {
                    postId,
                    userId,
                },
            });
            return { liked: true };
        }
    }

    // Adiciona um comentário a um post
    async addComment(postId: string, userId: string, content: string) {
        if (!content || content.trim().length === 0) {
            throw new BadRequestException('O conteúdo do comentário não pode ser vazio');
        }

        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Postagem não encontrada');
        }

        return this.prisma.postComment.create({
            data: {
                postId,
                userId,
                content,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        logo_url: true,
                    },
                },
            },
        });
    }

    // Exclui uma postagem (Apenas criador ou administrador)
    async delete(postId: string, userId: string, userRole: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Postagem não encontrada');
        }

        if (post.userId !== userId && userRole !== 'ADMIN') {
            throw new BadRequestException('Apenas o autor ou administradores podem excluir este post');
        }

        await this.prisma.post.delete({
            where: { id: postId },
        });

        return { success: true };
    }
}
