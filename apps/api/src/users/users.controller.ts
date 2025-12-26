import { Controller, Patch, Body, Request, UseGuards, Get, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

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
        storage: diskStorage({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new Error('Apenas imagens são permitidas!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }))
    async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
        const userId = req.user.sub || req.user.id;
        const logoUrl = `/uploads/logos/${file.filename}`;
        await this.usersService.updateProfile(userId, { logo_url: logoUrl });
        return { logo_url: logoUrl };
    }
}
