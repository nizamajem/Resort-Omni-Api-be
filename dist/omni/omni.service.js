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
exports.OmniService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const omni_alias_entity_1 = require("../entities/omni-alias.entity");
const omni_log_entity_1 = require("../entities/omni-log.entity");
let OmniService = class OmniService {
    constructor(aliasRepo, logRepo) {
        this.aliasRepo = aliasRepo;
        this.logRepo = logRepo;
    }
    async listAliases() {
        return this.aliasRepo.find({ order: { createdAt: 'DESC' } });
    }
    async upsertAlias(input) {
        const ebikeNumber = input.ebikeNumber.trim();
        const imei = input.imei.trim();
        const where = [
            { ebikeNumber },
            { imei },
        ];
        let alias = await this.aliasRepo.findOne({ where });
        if (alias) {
            alias.imei = imei;
            alias.ebikeNumber = ebikeNumber;
        }
        else {
            alias = this.aliasRepo.create({ ebikeNumber, imei });
        }
        if (input.displayName !== undefined)
            alias.displayName = input.displayName || null;
        if (input.photoUrl !== undefined)
            alias.photoUrl = input.photoUrl || null;
        if (input.metadata !== undefined)
            alias.metadata = input.metadata || null;
        return await this.aliasRepo.save(alias);
    }
    async updateAliasMeta(imei, data) {
        const alias = await this.aliasRepo.findOne({ where: { imei } });
        if (!alias)
            return null;
        if (data.displayName !== undefined)
            alias.displayName = data.displayName || null;
        if (data.photoUrl !== undefined)
            alias.photoUrl = data.photoUrl || null;
        if (data.metadata !== undefined)
            alias.metadata = data.metadata || null;
        return await this.aliasRepo.save(alias);
    }
    async deleteAlias(ebikeNumber) {
        const res = await this.aliasRepo.delete({ ebikeNumber });
        return (res.affected || 0) > 0;
    }
    async resolveByEbike(ebikeNumber) {
        return this.aliasRepo.findOne({ where: { ebikeNumber } });
    }
    async resolveByImei(imei) {
        return this.aliasRepo.findOne({ where: { imei } });
    }
    async logAction(entry) {
        const row = this.logRepo.create({
            action: entry.action || 'unknown',
            ebikeNumber: entry.ebikeNumber || null,
            imei: entry.imei || null,
            ok: entry.ok ?? false,
            status: entry.status || null,
            note: entry.note || null,
            requestPayload: entry.requestPayload || null,
            responsePayload: entry.responsePayload || null,
        });
        return this.logRepo.save(row);
    }
    async listLogs(limit = 100) {
        const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
        return this.logRepo.find({ order: { createdAt: 'DESC' }, take: safeLimit });
    }
    async clearLogs() {
        await this.logRepo.createQueryBuilder().delete().execute();
    }
};
exports.OmniService = OmniService;
exports.OmniService = OmniService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(omni_alias_entity_1.OmniAlias)),
    __param(1, (0, typeorm_1.InjectRepository)(omni_log_entity_1.OmniLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OmniService);
//# sourceMappingURL=omni.service.js.map