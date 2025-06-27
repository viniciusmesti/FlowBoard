import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedDataService } from './notifications/seed-data';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  if (process.env.NODE_ENV !== 'production') {
    const seedService = app.get(SeedDataService);
    await seedService.createSampleData();
    console.log('🌱 Sample data seeded successfully.');
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
