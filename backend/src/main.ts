import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedDataService } from './notifications/seed-data';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://*.vercel.app',
      process.env.FRONTEND_URL
    ].filter((url): url is string => Boolean(url)),
    credentials: true,
  });

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  // Health check endpoint for Render
  app.use('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Seed de dados de exemplo somente quando explicitamente habilitado
  if (process.env.SEED_SAMPLE_DATA === 'true') {
    const seedService = app.get(SeedDataService);
    await seedService.createSampleData();
    console.log('🌱 Sample data seeded successfully.');
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
