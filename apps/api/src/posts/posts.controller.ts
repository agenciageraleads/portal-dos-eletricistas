import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { S3Service } from '../common/s3.service';
import sharp from 'sharp';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly s3Service: S3Service
    ) {}

    // Lista todas as postagens no feed geral (suporta opcionalmente ID do usuário logado para saber se curtiu)
    @Get()
    async findAll(@Request() req: any) {
        // Obter userId de forma segura se o usuário estiver autenticado (opcional nesta rota)
        const userId = req.headers?.authorization ? this.extractUserIdFromToken(req.headers.authorization) : undefined;
        return this.postsService.findAll(userId);
    }

    // Lista postagens de um usuário específico (para a aba portfólio do perfil)
    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string, @Request() req: any) {
        const currentUserId = req.headers?.authorization ? this.extractUserIdFromToken(req.headers.authorization) : undefined;
        return this.postsService.findByUserId(userId, currentUserId);
    }

    // Cria um novo post com upload de imagem
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FileInterceptor('image', {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|heic|heif)$/)) {
                return cb(new Error('Apenas imagens são permitidas (JPG, PNG, WEBP, HEIC)!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB para fotos de obras de alta qualidade
    }))
    async create(
        @Request() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('title') title: string,
        @Body('description') description?: string
    ) {
        const userId = req.user.sub || req.user.id || req.user.userId;

        if (!title || title.trim().length === 0) {
            throw new BadRequestException('O título do trabalho é obrigatório');
        }

        if (!file) {
            throw new BadRequestException('A imagem do trabalho realizado é obrigatória');
        }

        let processedBuffer = file.buffer;
        let processedMimetype = file.mimetype;
        let processedExtension = extname(file.originalname).toLowerCase();

        // Conversão de HEIC/HEIF para JPG usando Sharp
        if (processedExtension === '.heic' || processedExtension === '.heif' || file.mimetype.includes('heic') || file.mimetype.includes('heif')) {
            try {
                processedBuffer = await sharp(file.buffer)
                    .toFormat('jpeg')
                    .toBuffer();
                processedMimetype = 'image/jpeg';
                processedExtension = '.jpg';
            } catch (error) {
                console.error('[PostsController] Falha na conversão de HEIC:', error);
            }
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `posts/post-${userId}-${uniqueSuffix}${processedExtension}`;

        let imageUrl: string;

        // Upload para o S3 se configurado
        if (this.s3Service.isEnabled()) {
            try {
                imageUrl = await this.s3Service.uploadBuffer(
                    processedBuffer,
                    filename,
                    processedMimetype
                );
            } catch (error) {
                console.error('[PostsController] Erro no upload para S3:', error);
                throw new BadRequestException('Erro ao salvar imagem no S3');
            }
        } else {
            // Upload local como fallback
            const uploadDir = join(process.cwd(), 'uploads', 'posts');

            if (!existsSync(uploadDir)) {
                mkdirSync(uploadDir, { recursive: true });
            }

            const localFilename = `post-${userId}-${uniqueSuffix}${processedExtension}`;
            const filePath = join(uploadDir, localFilename);

            try {
                writeFileSync(filePath, processedBuffer);
                imageUrl = `/uploads/posts/${localFilename}`;
            } catch (error) {
                console.error('[PostsController] Erro no upload local:', error);
                throw new BadRequestException('Erro ao salvar imagem no disco local');
            }
        }

        return this.postsService.create(userId, {
            title,
            description,
            imageUrl,
        });
    }

    // Toggle de Curtida
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.postsService.toggleLike(id, userId);
    }

    // Adiciona comentário
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/comment')
    async addComment(
        @Param('id') id: string,
        @Request() req: any,
        @Body('content') content: string
    ) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.postsService.addComment(id, userId, content);
    }

    // Exclui postagem
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        const userRole = req.user.role;
        return this.postsService.delete(id, userId, userRole);
    }

    // Helper interno para extrair userId sem levantar erro caso não autenticado
    private extractUserIdFromToken(authorization: string): string | undefined {
        try {
            const token = authorization.replace('Bearer ', '');
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
            return payload.sub || payload.id || payload.userId;
        } catch {
            return undefined;
        }
    }
}
