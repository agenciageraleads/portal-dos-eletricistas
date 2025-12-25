import { Module } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import { SankhyaService } from './sankhya.service';
import { SankhyaImageService } from './sankhya-image.service';

@Module({
    providers: [SankhyaClient, SankhyaService, SankhyaImageService],
    exports: [SankhyaService, SankhyaImageService],
})
export class SankhyaModule { }
