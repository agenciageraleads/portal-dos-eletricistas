import { Module } from '@nestjs/common';
import { SankhyaClient } from './sankhya.client';
import { SankhyaService } from './sankhya.service';
import { SankhyaImageService } from './sankhya-image.service';

@Module({
    providers: [SankhyaClient, SankhyaService, SankhyaImageService],
    exports: [SankhyaClient, SankhyaService, SankhyaImageService], // Exportar SankhyaClient também
})
export class SankhyaModule { }
