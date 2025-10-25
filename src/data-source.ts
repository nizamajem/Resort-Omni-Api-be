import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { join, sep } from 'path';

dotenv.config();

const isCompiled = __dirname.endsWith('dist') || __dirname.includes(`${sep}dist${sep}`);
const distDir = isCompiled ? __dirname : join(__dirname, '..', 'dist');
const entitiesGlob = join(distDir, 'entities', '*{.ts,.js}');
const migrationsGlob = join(__dirname, 'migrations', '*{.ts,.js}');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'resort',
  entities: [entitiesGlob],
  migrations: [migrationsGlob],
  synchronize: false,
  logging: false,
});
