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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const omni_service_1 = require("./omni.service");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const device_alias_entity_1 = require("../entities/device-alias.entity");
let DevicesController = class DevicesController {
    constructor(omni, aliasRepo) {
        this.omni = omni;
        this.aliasRepo = aliasRepo;
    }
    async devices() {
        const payload = await this.omni.fetchOmniDevices();
        const aliases = await this.aliasRepo.find();
        const byImei = new Map(aliases.map(a => [a.imei, a.ebikeNumber]));
        const inject = (arr) => arr.map(d => ({ ...d, ebikeNumber: d?.imei ? byImei.get(String(d.imei)) : undefined }));
        const body = payload.body;
        if (Array.isArray(body))
            payload.body = inject(body);
        else if (body && Array.isArray(body.data))
            body.data = inject(body.data);
        return payload;
    }
    async listAliases() {
        const rows = await this.omni.listAliases();
        return { ok: true, data: rows };
    }
    async upsert(body) {
        const imei = String(body?.imei || '').trim();
        const ebikeNumber = String(body?.ebikeNumber || '').trim();
        if (!imei || !ebikeNumber)
            return { ok: false, error: 'imei and ebikeNumber are required' };
        const saved = await this.omni.upsertAlias(imei, ebikeNumber);
        return { ok: true, data: saved };
    }
    async remove(imei, ebike) {
        if (!imei && !ebike)
            return { ok: false, error: 'imei or ebike is required' };
        const res = await this.omni.deleteAlias({ imei, ebikeNumber: ebike });
        return res;
    }
    async resolve(ebike) {
        if (!ebike)
            return { ok: false, error: 'Missing ebike query' };
        const row = await this.omni.resolveByEbike(ebike);
        if (!row)
            return { ok: false, error: 'Not found', status: 404 };
        return { ok: true, data: { imei: row.imei, ebikeNumber: row.ebikeNumber } };
    }
    async unlockByEbike(body) {
        const ebike = String(body?.ebikeNumber || body?.ebike || '').trim();
        if (!ebike)
            return { ok: false, error: 'ebikeNumber is required' };
        const row = await this.omni.resolveByEbike(ebike);
        if (!row)
            return { ok: false, error: 'E-bike not mapped', status: 404 };
        const payload = {
            imei: row.imei,
            unlockParameter: body?.unlockParameter ?? '0',
            userId: body?.userId ?? '1234',
            command: body?.command ?? 'L0',
        };
        const res = await this.omni.requestOmni(payload);
        return res;
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Get)('devices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "devices", null);
__decorate([
    (0, common_1.Get)('aliases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "listAliases", null);
__decorate([
    (0, common_1.Post)('aliases'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)('aliases'),
    __param(0, (0, common_1.Query)('imei')),
    __param(1, (0, common_1.Query)('ebike')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('resolve'),
    __param(0, (0, common_1.Query)('ebike')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('unlock-by-ebike'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "unlockByEbike", null);
exports.DevicesController = DevicesController = __decorate([
    (0, common_1.Controller)('iot/omni'),
    __param(1, (0, typeorm_2.InjectRepository)(device_alias_entity_1.DeviceAlias)),
    __metadata("design:paramtypes", [omni_service_1.OmniService,
        typeorm_1.Repository])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map