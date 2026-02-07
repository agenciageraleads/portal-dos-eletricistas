import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function bootstrap() {
  // Run migrations before starting the app
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // Serve Static Assets (Uploads)
  // Check if platform-express is used (default)
  const expressApp = app as any; // Cast to avoid type issues without platform-express import if strictly typed
  if (expressApp.useStaticAssets) {
    const path = require('path');
    expressApp.useStaticAssets(path.join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
      setHeaders: (res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    });
  }

  // Global Validation (Invisible Mode: removes extra props but doesn't error on them yet)
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false, // Don't block requests with extra fields yet
  }));

  const origins = [
    'https://app.portaleletricos.com.br',
    'https://www.app.portaleletricos.com.br',
    'https://beta.portaleletricos.com.br',
    'http://localhost:3000',
  ];

  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
