import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // Global Validation (Invisible Mode: removes extra props but doesn't error on them yet)
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false, // Don't block requests with extra fields yet
  }));

  app.enableCors();
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
