import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedDataService } from './notifications/seed-data';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const seedService = app.get(SeedDataService);
    await seedService.createSampleData();
    console.log('🌱 Sample data seeded successfully.');
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
