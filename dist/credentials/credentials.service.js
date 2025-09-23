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
exports.CredentialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const credential_code_entity_1 = require("../entities/credential-code.entity");
function randomCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++)
        out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}
function randomUserId() {
    return 'U' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}
let CredentialsService = class CredentialsService {
    constructor(codes) {
        this.codes = codes;
    }
    async generate(resortName, rentalId) {
        let code = randomCode(6);
        for (let i = 0; i < 5; i++) {
            const exists = await this.codes.findOne({ where: { code } });
            if (!exists)
                break;
            code = randomCode(6);
        }
        const userId = randomUserId();
        const row = this.codes.create({ code, userId, resortName, rentalId: rentalId || null, status: 'active' });
        return await this.codes.save(row);
    }
    async verify(code) {
        const row = await this.codes.findOne({ where: { code } });
        return row || null;
    }
    async expireByRental(rentalId) {
        const rows = await this.codes.find({ where: { rentalId } });
        for (const r of rows) {
            if (r.status !== 'expired') {
                r.status = 'expired';
                await this.codes.save(r);
            }
        }
    }
};
exports.CredentialsService = CredentialsService;
exports.CredentialsService = CredentialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credential_code_entity_1.CredentialCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CredentialsService);
//# sourceMappingURL=credentials.service.js.map