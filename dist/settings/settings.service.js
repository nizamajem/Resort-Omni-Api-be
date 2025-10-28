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
const ALLOWED_PACKAGE_ROLES = ['resort', 'partnership'];
const slugifyId = (value, fallback = '') => {
    const makeSlug = (input) => String(input || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
    const primary = makeSlug(value);
    if (primary) {
        return primary;
    }
    const secondary = makeSlug(fallback);
    if (secondary) {
        return secondary;
    }
    return '';
};
const sanitizeCustomPackages = (input, fallback) => {
    const fallbackIndex = new Map();
    if (Array.isArray(fallback)) {
        for (const item of fallback) {
            if (item && typeof item.id === 'string') {
                fallbackIndex.set(item.id, Object.assign({}, item));
            }
        }
    }
    if (!Array.isArray(input)) {
        return Array.isArray(fallback) ? fallback.slice() : [];
    }
    const result = [];
    const seen = new Set();
    for (const raw of input) {
        if (!raw || typeof raw !== 'object') {
            continue;
        }
        const providedId = typeof raw.id === 'string' ? raw.id : '';
        const fallbackItem = fallbackIndex.get(providedId) || null;
        const providedName = typeof raw.name === 'string' ? raw.name.trim() : '';
        const nameSource = providedName || (fallbackItem?.name || '');
        let id = slugifyId(providedId || nameSource, fallbackItem?.id || nameSource);
        if (!id) {
            id = `custom-${result.length + 1}`;
        }
        if (seen.has(id)) {
            continue;
        }
        const minutesRaw = Number(raw.blockMinutes);
        const fallbackMinutes = Number(fallbackItem?.blockMinutes);
        const blockMinutes = Number.isFinite(minutesRaw) && minutesRaw > 0
            ? Math.round(minutesRaw)
            : (Number.isFinite(fallbackMinutes) && fallbackMinutes > 0
                ? Math.round(fallbackMinutes)
                : NaN);
        if (!Number.isFinite(blockMinutes) || blockMinutes <= 0) {
            continue;
        }
        const rateRaw = Number(raw.pricePerBlock);
        const fallbackRate = Number(fallbackItem?.pricePerBlock);
        const pricePerBlock = Number.isFinite(rateRaw) && rateRaw > 0
            ? Math.round(rateRaw)
            : (Number.isFinite(fallbackRate) && fallbackRate > 0
                ? Math.round(fallbackRate)
                : NaN);
        if (!Number.isFinite(pricePerBlock) || pricePerBlock <= 0) {
            continue;
        }
        const enabled = raw.enabled === false
            ? false
            : raw.enabled === true
                ? true
                : (fallbackItem ? fallbackItem.enabled !== false : true);
        let description = typeof raw.description === 'string' ? raw.description.trim() : undefined;
        if ((!description || description.length === 0) && typeof (fallbackItem?.description) === 'string') {
            description = fallbackItem.description;
        }
        let rolesSource = Array.isArray(raw.roles) ? raw.roles : undefined;
        if (!rolesSource && Array.isArray(fallbackItem?.roles)) {
            rolesSource = fallbackItem.roles;
        }
        let normalizedRoles = Array.isArray(rolesSource)
            ? Array.from(new Set(rolesSource
                .map((role) => typeof role === 'string' ? role.toLowerCase().trim() : '')
                .filter((role) => ALLOWED_PACKAGE_ROLES.includes(role))))
            : [];
        if (normalizedRoles.length === 0) {
            normalizedRoles = ALLOWED_PACKAGE_ROLES.slice();
        }
        const normalized = {
            id,
            name: nameSource || id,
            blockMinutes,
            pricePerBlock,
            enabled,
            roles: normalizedRoles,
        };
        if (description && description.length > 0) {
            normalized.description = description;
        }
        result.push(normalized);
        seen.add(id);
        if (result.length >= 64) {
            break;
        }
    }
    return result;
};
const DEFAULT_FEATURES = {
    packages: { '1h': true, '3h': true, '12h': true, '1d': true },
    packageRoles: {
        '1h': ['resort', 'partnership'],
        '3h': ['resort', 'partnership'],
        '12h': ['resort', 'partnership'],
        '1d': ['resort', 'partnership'],
    },
    payments: { cash: true, midtransSandbox: true, midtransProduction: true },
    packagePrices: { '1h': 65000, '3h': 125000, '12h': 180000, '1d': 200000 },
    rentalExtras: { extraGraceMinutes: 10, extraHourlyRate: 65000, extraBlockMinutes: 60 },
    customPackages: [],
};
let SettingsService = class SettingsService {
    constructor(settings) {
        this.settings = settings;
    }
    async loadFeatureRow() {
        let row = await this.settings.findOne({ where: { key: 'feature_flags' } });
        if (!row) {
            const created = this.settings.create({ key: 'feature_flags', value: DEFAULT_FEATURES });
            try {
                row = await this.settings.save(created);
            }
            catch (err) {
                const driverError = err && err.driverError ? err.driverError : err;
                const duplicateCode = driverError && (driverError.code === '23505' || driverError.code === 'ER_DUP_ENTRY' || driverError.errno === 1062);
                if (err instanceof typeorm_2.QueryFailedError && duplicateCode) {
                    row = await this.settings.findOne({ where: { key: 'feature_flags' } });
                }
                else {
                    throw err;
                }
            }
            if (!row) {
                row = await this.settings.findOne({ where: { key: 'feature_flags' } });
            }
        }
        return row;
    }
    async getFeatures() {
        const row = await this.loadFeatureRow();
        const value = (row.value || {});
        const incomingRoles = value.packageRoles || {};
        const packageRoles = {};
        for (const key of Object.keys(DEFAULT_FEATURES.packageRoles)) {
            const raw = incomingRoles[key];
            if (Array.isArray(raw)) {
                const normalized = Array.from(new Set(raw
                    .map((role) => typeof role === 'string' ? role.toLowerCase().trim() : '')
                    .filter((role) => ALLOWED_PACKAGE_ROLES.includes(role))));
                if (normalized.length > 0) {
                    packageRoles[key] = normalized;
                    continue;
                }
            }
            packageRoles[key] = [...DEFAULT_FEATURES.packageRoles[key]];
        }
        const customPackages = sanitizeCustomPackages(value.customPackages, DEFAULT_FEATURES.customPackages);
        return {
            packages: { ...DEFAULT_FEATURES.packages, ...(value.packages || {}) },
            payments: { ...DEFAULT_FEATURES.payments, ...(value.payments || {}) },
            packagePrices: { ...DEFAULT_FEATURES.packagePrices, ...(value.packagePrices || {}) },
            rentalExtras: { ...DEFAULT_FEATURES.rentalExtras, ...(value.rentalExtras || {}) },
            packageRoles,
            customPackages,
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
        const sanitizedPackagePrices = {};
        if (input.packagePrices && typeof input.packagePrices === 'object') {
            for (const key of Object.keys(DEFAULT_FEATURES.packagePrices)) {
                if (Object.prototype.hasOwnProperty.call(input.packagePrices, key)) {
                    const raw = Number(input.packagePrices[key]);
                    if (Number.isFinite(raw) && raw > 0) {
                        sanitizedPackagePrices[key] = Math.round(raw);
                    }
                }
            }
        }
        const sanitizedRentalExtras = {};
        if (input.rentalExtras && typeof input.rentalExtras === 'object') {
            for (const key of Object.keys(DEFAULT_FEATURES.rentalExtras)) {
                if (Object.prototype.hasOwnProperty.call(input.rentalExtras, key)) {
                    const raw = Number(input.rentalExtras[key]);
                    if (key === 'extraGraceMinutes') {
                        if (Number.isFinite(raw) && raw >= 0) {
                            sanitizedRentalExtras[key] = Math.round(raw);
                        }
                    }
                    else if (Number.isFinite(raw) && raw > 0) {
                        sanitizedRentalExtras[key] = Math.round(raw);
                    }
                }
            }
        }
        const sanitizedPackageRoles = {};
        if (input.packageRoles && typeof input.packageRoles === 'object') {
            for (const key of Object.keys(DEFAULT_FEATURES.packageRoles)) {
                if (Object.prototype.hasOwnProperty.call(input.packageRoles, key)) {
                    const raw = input.packageRoles[key];
                    if (Array.isArray(raw)) {
                        const normalized = Array.from(new Set(raw
                            .map((role) => typeof role === 'string' ? role.toLowerCase().trim() : '')
                            .filter((role) => ALLOWED_PACKAGE_ROLES.includes(role))));
                        if (normalized.length > 0 || raw.length === 0) {
                            sanitizedPackageRoles[key] = normalized;
                        }
                    }
                }
            }
        }
        let nextCustomPackages = current.customPackages || [];
        if (Object.prototype.hasOwnProperty.call(input, 'customPackages')) {
            nextCustomPackages = sanitizeCustomPackages(input.customPackages, current.customPackages || []);
        }
        const next = {
            packages: { ...current.packages, ...sanitizedPackages },
            payments: { ...current.payments, ...sanitizedPayments },
            packagePrices: { ...current.packagePrices, ...sanitizedPackagePrices },
            rentalExtras: { ...current.rentalExtras, ...sanitizedRentalExtras },
            packageRoles: { ...current.packageRoles, ...sanitizedPackageRoles },
            customPackages: nextCustomPackages,
        };
        row.value = next;
        await this.settings.save(row);
        return next;
    }
    async getJson(key, fallback = null) {
        const existing = await this.settings.findOne({ where: { key } });
        if (!existing) {
            return fallback !== undefined ? fallback : null;
        }
        return existing.value !== undefined && existing.value !== null ? existing.value : (fallback !== undefined ? fallback : null);
    }
    async setJson(key, value) {
        let row = await this.settings.findOne({ where: { key } });
        if (!row) {
            row = this.settings.create({ key, value });
        }
        else {
            row.value = value;
        }
        await this.settings.save(row);
        return row.value;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map














