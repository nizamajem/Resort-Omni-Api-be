"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const resorts_module_1 = require("./resorts/resorts.module");
const packages_module_1 = require("./packages/packages.module");
const payments_module_1 = require("./payments/payments.module");
const orders_module_1 = require("./orders/orders.module");
const analytics_module_1 = require("./analytics/analytics.module");
const resort_account_entity_1 = require("./entities/resort-account.entity");
const package_account_entity_1 = require("./entities/package-account.entity");
const history_item_entity_1 = require("./entities/history-item.entity");
const rental_entity_1 = require("./entities/rental.entity");
const rentals_module_1 = require("./rentals/rentals.module");
const setting_entity_1 = require("./entities/setting.entity");
const omni_alias_entity_1 = require("./entities/omni-alias.entity");
const omni_log_entity_1 = require("./entities/omni-log.entity");
const omni_module_1 = require("./omni/omni.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
                    username: process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASS || 'postgres',
                    database: process.env.DB_NAME || 'resort',
                    entities: [resort_account_entity_1.ResortAccount, package_account_entity_1.PackageAccount, history_item_entity_1.HistoryItem, rental_entity_1.Rental, setting_entity_1.Setting, omni_alias_entity_1.OmniAlias, omni_log_entity_1.OmniLog],
                    synchronize: false,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([resort_account_entity_1.ResortAccount, package_account_entity_1.PackageAccount, history_item_entity_1.HistoryItem, rental_entity_1.Rental, setting_entity_1.Setting]),
            auth_module_1.AuthModule,
            resorts_module_1.ResortsModule,
            packages_module_1.PackagesModule,
            payments_module_1.PaymentsModule,
            orders_module_1.OrdersModule,
            analytics_module_1.AnalyticsModule,
            rentals_module_1.RentalsModule,
            settings_module_1.SettingsModule,
            omni_module_1.OmniModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map