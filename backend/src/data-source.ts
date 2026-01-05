import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

// Determinar se estamos em desenvolvimento (TypeScript) ou produção (JavaScript compilado)
const isCompiled = __filename.endsWith('.js');
const basePath = isCompiled ? join(__dirname, '..') : __dirname;

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL ? {
    url: process.env.DATABASE_URL,
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'flowboard',
  }),
  entities: [
    join(basePath, '**', '*.entity{.ts,.js}')
  ],
  migrations: [
    join(basePath, 'migrations', '*.{.ts,.js}')
  ],
  synchronize: false,
  // Supabase requer SSL. Para Supabase, usar rejectUnauthorized: false funciona
  // Para outros provedores, pode ser necessário ajustar
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL 
    ? { 
        rejectUnauthorized: process.env.DATABASE_URL?.includes('supabase.com') ? false : false 
      } 
    : false,
});