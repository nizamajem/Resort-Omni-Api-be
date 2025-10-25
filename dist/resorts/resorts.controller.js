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
exports.ResortsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resort_account_entity_1 = require("../entities/resort-account.entity");
const create_resort_dto_1 = require("./dto/create-resort.dto");
const update_resort_dto_1 = require("./dto/update-resort.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let ResortsController = class ResortsController {
    constructor(repo) {
        this.repo = repo;
    }
    async list(q = '', status = 'all', offset = '0', limit = '20') {
        let rows = await this.repo.find();
        if (status !== 'all')
            rows = rows.filter((r) => r.status === status);
        if (q)
            rows = rows.filter((r) => (r.resortName + ' ' + r.email).toLowerCase().includes(q.toLowerCase()));
        const off = parseInt(offset, 10) || 0;
        const lim = Math.min(100, parseInt(limit, 10) || 20);
        return { total: rows.length, data: rows.slice(off, off + lim) };
    }
    async create(body) {
        const { resortName, email, password, role: rawRole } = body || {};
        if (!resortName || !email || !password)
            return { error: 'Missing fields' };
        const exist = await this.repo.findOne({ where: { email: String(email).toLowerCase() } });
        if (exist) {
            return { error: 'Email already exists' };
        }
        const role = rawRole === 'partnership' ? 'partnership' : 'resort';
        const row = this.repo.create({
            resortName: String(resortName),
            email: String(email).toLowerCase(),
            password: String(password),
            role,
            status: 'active',
        });
        return await this.repo.save(row);
    }
    async update(body) {
        const { id, ...patch } = body || {};
        if (!id)
            return { error: 'Missing id' };
        const row = await this.repo.findOne({ where: { id } });
        if (!row)
            return { error: 'Not found' };
        if (patch?.role !== undefined) {
            if (patch.role !== 'resort' && patch.role !== 'partnership') {
                return { error: 'Invalid role' };
            }
            row.role = patch.role;
            delete patch.role;
        }
        Object.assign(row, patch);
        return await this.repo.save(row);
    }
    async remove(id) {
        if (!id)
            return { error: 'Missing id' };
        const res = await this.repo.delete(id);
        return { removed: res.affected || 0 };
    }
};
exports.ResortsController = ResortsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ResortsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_resort_dto_1.CreateResortDto]),
    __metadata("design:returntype", Promise)
], ResortsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_resort_dto_1.UpdateResortDto]),
    __metadata("design:returntype", Promise)
], ResortsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResortsController.prototype, "remove", null);
exports.ResortsController = ResortsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Controller)('resorts'),
    __param(0, (0, typeorm_1.InjectRepository)(resort_account_entity_1.ResortAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResortsController);
//# sourceMappingURL=resorts.controller.js.map
