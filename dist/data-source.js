"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv = require("dotenv");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
dotenv.config();
const isCompiled = __dirname.endsWith('dist') || __dirname.includes(`${path_1.sep}dist${path_1.sep}`);
const distDir = isCompiled ? __dirname : (0, path_1.join)(__dirname, '..', 'dist');
const entitiesGlob = (0, path_1.join)(distDir, 'entities', '*{.ts,.js}');
const migrationsGlob = (0, path_1.join)(__dirname, 'migrations', '*{.ts,.js}');
exports.AppDataSource = new typeorm_1.DataSource({
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
//# sourceMappingURL=data-source.js.map