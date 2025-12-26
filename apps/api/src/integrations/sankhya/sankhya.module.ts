import { Module } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import { SankhyaService } from './sankhya.service';
import { SankhyaImageService } from './sankhya-image.service';
import { S3Service } from '../../common/s3.service';

@Module({
    providers: [SankhyaClient, SankhyaService, SankhyaImageService, S3Service],
    exports: [SankhyaClient, SankhyaService, SankhyaImageService, S3Service],
})
export class SankhyaModule { }
