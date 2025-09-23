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
exports.PackagesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const package_account_entity_1 = require("../entities/package-account.entity");
const add_batch_dto_1 = require("./dto/add-batch.dto");
const update_package_account_dto_1 = require("./dto/update-package-account.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let PackagesController = class PackagesController {
    constructor(repo) {
        this.repo = repo;
    }
    async list(pkg, status = 'all', q = '', offset = '0', limit = '20') {
        let rows = await this.repo.find();
        if (pkg)
            rows = rows.filter((i) => i.pkg === pkg);
        if (status !== 'all')
            rows = rows.filter((i) => i.status === status);
        if (q)
            rows = rows.filter((i) => (i.email + ' ' + i.password).toLowerCase().includes(q.toLowerCase()));
        const off = parseInt(offset, 10) || 0;
        const lim = Math.min(100, parseInt(limit, 10) || 20);
        return { total: rows.length, data: rows.slice(off, off + lim) };
    }
    async addBatch(body) {
        const { pkg, items } = body || {};
        if (!pkg || !Array.isArray(items))
            return { error: 'Missing pkg/items' };
        const records = items.map((x) => this.repo.create({ pkg, email: String(x.email), password: String(x.password), status: 'active' }));
        await this.repo.save(records);
        return { inserted: records.length };
    }
    async update(body) {
        const { id, ...patch } = body || {};
        if (!id)
            return { error: 'Missing id' };
        const row = await this.repo.findOne({ where: { id } });
        if (!row)
            return { error: 'Not found' };
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
exports.PackagesController = PackagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('pkg')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_batch_dto_1.AddBatchDto]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "addBatch", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_package_account_dto_1.UpdatePackageAccountDto]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "remove", null);
exports.PackagesController = PackagesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Controller)('package-accounts'),
    __param(0, (0, typeorm_1.InjectRepository)(package_account_entity_1.PackageAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map