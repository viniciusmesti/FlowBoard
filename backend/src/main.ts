import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedDataService } from './notifications/seed-data';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuração CORS mais robusta
  const corsOrigins = [
    'http://localhost:3000',
    'https://flow-board-peach.vercel.app',
    'https://*.vercel.app',
    'https://vercel.app',
    process.env.FRONTEND_URL
  ].filter((url): url is string => Boolean(url));

  console.log('🌐 CORS Origins configurados:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Middleware para log de requisições (debug)
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });

  // Middleware para capturar erros
  app.use((err, req, res, next) => {
    console.error('❌ Erro no backend:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  });

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  // Health check endpoint for Render
  app.use('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      cors: corsOrigins,
      env: process.env.NODE_ENV
    });
  });

  // Seed de dados de exemplo somente quando explicitamente habilitado
  if (process.env.SEED_SAMPLE_DATA === 'true') {
    const seedService = app.get(SeedDataService);
    await seedService.createSampleData();
    console.log('🌱 Sample data seeded successfully.');
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`🌐 CORS habilitado para: ${corsOrigins.join(', ')}`);
}
bootstrap();
