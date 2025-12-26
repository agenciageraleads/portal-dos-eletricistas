
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SankhyaImageService } from './src/integrations/sankhya/sankhya-image.service';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const imageService = app.get(SankhyaImageService);

    console.log('--- DEBUG START ---');
    console.log('CWD:', process.cwd());

    // Access private property if possible or just rely on public methods
    // We can't access private 'imagesPath' easily without casting to any
    const serviceAny = imageService as any;
    console.log('Service imagesPath:', serviceAny.imagesPath);

    const testId = 12351;
    const exists = imageService.hasLocalImage(testId);
    console.log(`Product ${testId} exists locally?`, exists);

    if (!exists) {
        console.log(`Attempting to download ${testId}...`);
        const result = await imageService.downloadAndSaveProductImage(testId);
        console.log('Download result:', result);
        console.log(`exists after download?`, imageService.hasLocalImage(testId));
    } else {
        console.log('It exists! Checking file stats...');
        const filepath = path.join(serviceAny.imagesPath, `${testId}.webp`);
        if (fs.existsSync(filepath)) {
            console.log('File found at:', filepath);
        } else {
            console.log('WTF: hasLocalImage says true but fs.existsSync failed in main script?');
        }
    }

    await app.close();
}

bootstrap();
