import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../common/s3.service';
// import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly s3Service: S3Service) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const key = `uploads/${fileName}`;

        let url: string;

        if (this.s3Service.isEnabled()) {
            url = await this.s3Service.uploadBuffer(file.buffer, key, file.mimetype);
        } else {
            // Fallback logic
            const fs = require('fs');
            const uploadDir = path.join(process.cwd(), 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            url = `/uploads/${fileName}`;
        }

        return {
            url,
            key,
            fileName,
        };
    }
}
