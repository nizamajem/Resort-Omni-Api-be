"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_controller_1 = require("./payments.controller");
const storage_module_1 = require("../common/storage.module");
const typeorm_1 = require("@nestjs/typeorm");
const package_account_entity_1 = require("../entities/package-account.entity");
const history_item_entity_1 = require("../entities/history-item.entity");
const rental_entity_1 = require("../entities/rental.entity");
const settings_module_1 = require("../settings/settings.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [storage_module_1.StorageModule, typeorm_1.TypeOrmModule.forFeature([package_account_entity_1.PackageAccount, history_item_entity_1.HistoryItem, rental_entity_1.Rental]), settings_module_1.SettingsModule],
        controllers: [payments_controller_1.PaymentsController],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map