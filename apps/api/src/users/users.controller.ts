import { Controller, Patch, Body, Request, UseGuards, Get, Post, UseInterceptors, UploadedFile, BadRequestException, Param, ForbiddenException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from '../common/s3.service';
import sharp from 'sharp';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly s3Service: S3Service
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.usersService.findById(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
        const userId = req.user.sub || req.user.id;
        return this.usersService.updateProfile(userId, updateProfileDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload-logo')
    @UseInterceptors(FileInterceptor('logo', {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|heic|heif)$/)) {
                return cb(new Error('Apenas imagens são permitidas (JPG, PNG, WEBP, HEIC)!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }))
    async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        console.log(`[UsersController] uploadLogo called for userId: ${userId}`);

        if (!file) {
            console.error('[UsersController] Upload failed: No file provided');
            throw new BadRequestException('Arquivo não enviado');
        }

        console.log('[UsersController] File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer?.length
        });

        let processedBuffer = file.buffer;
        let processedMimetype = file.mimetype;
        let processedExtension = extname(file.originalname).toLowerCase();

        // Conversão de HEIC/HEIF para JPG (Sharp)
        if (processedExtension === '.heic' || processedExtension === '.heif' || file.mimetype.includes('heic') || file.mimetype.includes('heif')) {
            try {
                console.log('[UsersController] 🔄 Converting HEIC/HEIF to JPG...');
                processedBuffer = await sharp(file.buffer)
                    .toFormat('jpeg')
                    .toBuffer();
                processedMimetype = 'image/jpeg';
                processedExtension = '.jpg';
                console.log('[UsersController] ✅ Conversion successful');
            } catch (error) {
                console.error('[UsersController] ❌ HEIC Conversion failed:', error);
                // Continua com o original se falhar, mas avisa
            }
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `logos/logo-${userId}-${uniqueSuffix}${processedExtension}`;

        let logoUrl: string;

        console.log(`[UsersController] S3 Enabled: ${this.s3Service.isEnabled()}`);

        if (this.s3Service.isEnabled()) {
            try {
                console.log(`[UsersController] Attempting S3 upload to key: ${filename}`);
                logoUrl = await this.s3Service.uploadBuffer(
                    processedBuffer,
                    filename,
                    processedMimetype
                );
                console.log(`[UsersController] S3 Upload success. URL: ${logoUrl}`);
            } catch (error) {
                console.error('[UsersController] S3 Upload Error:', error);
                throw new BadRequestException('Erro ao salvar imagem no S3');
            }
        } else {
            // Fallback para disco local
            const uploadDir = join(process.cwd(), 'uploads', 'logos');

            if (!existsSync(uploadDir)) {
                console.log('[UsersController] Creating upload directory:', uploadDir);
                mkdirSync(uploadDir, { recursive: true });
            }

            const localFilename = `logo-${userId}-${uniqueSuffix}${processedExtension}`;
            const filePath = join(uploadDir, localFilename);

            try {
                console.log(`[UsersController] Attempting Local FS upload to: ${filePath}`);
                writeFileSync(filePath, processedBuffer);
                logoUrl = `/uploads/logos/${localFilename}`;
                console.log(`[UsersController] Local Upload success. URL: ${logoUrl}`);
            } catch (error) {
                console.error('[UsersController] Local Upload Error:', error);
                throw new BadRequestException('Erro ao salvar imagem no disco local');
            }
        }

        console.log(`[UsersController] Updating profile for user ${userId} with logo_url: ${logoUrl}`);

        // Wait for update
        const updateResult = await this.usersService.updateProfile(userId, { logo_url: logoUrl });
        console.log('[UsersController] DB Update Result:', updateResult ? 'Success' : 'Failed/Null');

        return { logo_url: logoUrl };
    }

    // Admin: List all users (v1.2.0)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any) {
        const user = await this.usersService.findById(req.user.sub || req.user.id);
        if (!user || user.role !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem listar usuários');
        }
        return this.usersService.findAll();
    }

    // Admin: Update user role (v1.2.0)
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/role')
    async updateRole(@Request() req: any, @Param('id') userId: string, @Body('role') role: 'ELETRICISTA' | 'ADMIN') {
        const admin = await this.usersService.findById(req.user.sub || req.user.id);
        if (!admin || admin.role !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem alterar papéis');
        }
        return this.usersService.updateRole(userId, role);
    }

    // Admin: Generate Reset Token (v1.3.0)
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/reset-token')
    async generateResetToken(@Request() req: any, @Param('id') userId: string) {
        const admin = await this.usersService.findById(req.user.sub || req.user.id);
        if (!admin || admin.role !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem gerar tokens de reset');
        }
        return this.usersService.generateManualResetToken(userId);
    }
    // Public: Find available electricians
    @Get('available')
    async findAvailable(@Query('city') city?: string, @Query('search') search?: string) {
        return this.usersService.findAvailable(city, search);
    }

    @Get('profile/public/:id')
    async getPublicProfile(@Param('id') id: string) {
        return this.usersService.getPublicProfile(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile/peer/:id')
    async getPeerProfile(@Request() req: any, @Param('id') id: string) {
        const requester = await this.usersService.findById(req.user.sub || req.user.id);
        if (!requester || requester.role !== 'ELETRICISTA') {
            throw new ForbiddenException('Apenas eletricistas podem ver este perfil completo');
        }
        return this.usersService.getPeerProfile(id);
    }

    @Get('count')
    async count() {
        return this.usersService.count();
    }
}
