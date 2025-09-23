"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv = require("dotenv");
dotenv.config();
const typeorm_1 = require("typeorm");
const resort_account_entity_1 = require("./entities/resort-account.entity");
const package_account_entity_1 = require("./entities/package-account.entity");
const history_item_entity_1 = require("./entities/history-item.entity");
const setting_entity_1 = require("./entities/setting.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'resort',
    entities: [resort_account_entity_1.ResortAccount, package_account_entity_1.PackageAccount, history_item_entity_1.HistoryItem, setting_entity_1.Setting],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
});
//# sourceMappingURL=data-source.js.map