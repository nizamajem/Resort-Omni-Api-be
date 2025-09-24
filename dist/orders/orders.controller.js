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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const package_account_entity_1 = require("../entities/package-account.entity");
const history_item_entity_1 = require("../entities/history-item.entity");
const rental_entity_1 = require("../entities/rental.entity");
const cash_order_dto_1 = require("./dto/cash-order.dto");
const history_query_dto_1 = require("./dto/history-query.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const settings_service_1 = require("../settings/settings.service");
let OrdersController = class OrdersController {
    constructor(packages, histories, rentals, settings) {
        this.packages = packages;
        this.histories = histories;
        this.rentals = rentals;
        this.settings = settings;
        this.pkgKeys = ['1h', '3h', '1d'];
    }
    async availability() {
        const features = await this.settings.getFeatures();
        const counts = { '1h': 0, '3h': 0, '1d': 0 };
        await Promise.all(this.pkgKeys.map(async (pkg) => {
            if (features.packages[pkg]) {
                counts[pkg] = await this.packages.count({ where: { pkg, status: 'active' } });
            }
            else {
                counts[pkg] = 0;
            }
        }));
        return { ...counts, enabled: features.packages };
    }
    async cash(body) {
        const { pkg, packageName, price, duration, resortName, guestName, roomNumber } = body || {};
        if (!pkg || !packageName || !price)
            return { error: 'Missing fields' };
        const pkgId = String(pkg);
        if (!this.pkgKeys.includes(pkgId))
            return { error: 'Invalid package' };
        const features = await this.settings.getFeatures();
        if (!features.packages[pkgId])
            return { error: 'Package disabled' };
        if (!features.payments.cash)
            return { error: 'Cash payment disabled' };
        const candidates = await this.packages.find({ where: { pkg: pkgId, status: 'active' } });
        if (candidates.length === 0)
            return { error: 'No active account available' };
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        chosen.status = 'sold';
        await this.packages.save(chosen);
        const hist = this.histories.create({
            resortName: resortName || 'Unknown Resort',
            userEmail: chosen.email,
            userPassword: chosen.password,
            packageName,
            price: Number(price),
            duration: duration || '',
            status: 'success',
            paymentMethod: 'cash',
        });
        await this.histories.save(hist);
        try {
            const baseMinutes = pkgId === '1h' ? 60 : pkgId === '3h' ? 180 : 1440;
            const rental = this.rentals.create({
                resortName: resortName || 'Unknown Resort',
                guestName: guestName || 'Guest',
                roomNumber: roomNumber || '-',
                pkg: pkgId,
                packageName,
                basePrice: Number(price),
                baseMinutes,
                startedAt: Date.now(),
                status: 'active',
                credentialEmail: chosen.email,
                credentialPassword: chosen.password,
            });
            await this.rentals.save(rental);
            if ('credentialPassword' in rental) {
                delete rental.credentialPassword;
            }
            return { credential: { email: chosen.email, password: chosen.password }, history: hist, rental };
        }
        catch (e) {
            return { credential: { email: chosen.email, password: chosen.password }, history: hist };
        }
    }
    async history(query, req) {
        const where = {};
        if (query.paymentMethod)
            where.paymentMethod = query.paymentMethod;
        if (query.status)
            where.status = query.status;
        const role = req?.user?.role;
        const resortName = req?.user?.resortName;
        if (role === 'resort' && resortName) {
            where.resortName = resortName;
        }
        if (role === 'superadmin' && query?.resortName) {
            where.resortName = query.resortName;
        }
        const rows = await this.histories.find({ where, order: { purchasedAt: 'DESC' } });
        return rows;
    }
    async removeHistory(id, req) {
        if (!id)
            return { error: 'Missing id' };
        const role = req?.user?.role;
        if (role !== 'superadmin')
            throw new common_1.ForbiddenException('Only super admin can delete history entries');
        const existing = await this.histories.findOne({ where: { id } });
        if (!existing)
            return { error: 'Not found' };
        await this.histories.delete({ id });
        return { ok: true };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('availability'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "availability", null);
__decorate([
    (0, common_1.Post)('cash'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_order_dto_1.CashOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cash", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [history_query_dto_1.HistoryQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "history", null);
__decorate([
    (0, common_1.Delete)('history/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "removeHistory", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('resort', 'superadmin'),
    (0, common_1.Controller)('orders'),
    __param(0, (0, typeorm_1.InjectRepository)(package_account_entity_1.PackageAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(history_item_entity_1.HistoryItem)),
    __param(2, (0, typeorm_1.InjectRepository)(rental_entity_1.Rental)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map