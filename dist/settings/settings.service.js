"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("../entities/setting.entity");
const DEFAULT_FEATURES = {
    packages: { '1h': true, '3h': true, '1d': true },
    payments: { cash: true, midtransSandbox: true, midtransProduction: true },
};
let SettingsService = class SettingsService {
    constructor(settings) {
        this.settings = settings;
    }
    async loadFeatureRow() {
        let row = await this.settings.findOne({ where: { key: 'feature_flags' } });
        if (!row) {
            row = this.settings.create({ key: 'feature_flags', value: DEFAULT_FEATURES });
            row = await this.settings.save(row);
        }
        return row;
    }
    async getFeatures() {
        const row = await this.loadFeatureRow();
        const value = (row.value || {});
        return {
            packages: { ...DEFAULT_FEATURES.packages, ...(value.packages || {}) },
            payments: { ...DEFAULT_FEATURES.payments, ...(value.payments || {}) },
        };
    }
    async updateFeatures(input) {
        const row = await this.loadFeatureRow();
        const current = await this.getFeatures();
        const sanitizedPackages = {};
        if (input.packages && typeof input.packages === 'object') {
            for (const key of Object.keys(DEFAULT_FEATURES.packages)) {
                if (Object.prototype.hasOwnProperty.call(input.packages, key)) {
                    sanitizedPackages[key] = Boolean(input.packages[key]);
                }
            }
        }
        const sanitizedPayments = {};
        if (input.payments && typeof input.payments === 'object') {
            for (const key of Object.keys(DEFAULT_FEATURES.payments)) {
                if (Object.prototype.hasOwnProperty.call(input.payments, key)) {
                    sanitizedPayments[key] = Boolean(input.payments[key]);
                }
            }
        }
        const next = {
            packages: { ...current.packages, ...sanitizedPackages },
            payments: { ...current.payments, ...sanitizedPayments },
        };
        row.value = next;
        await this.settings.save(row);
        return next;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map