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
const CUSTOM_PACKAGE_ROLES = ['resort', 'partnership'];
let OrdersController = class OrdersController {
    constructor(packages, histories, rentals, settings) {
        this.packages = packages;
        this.histories = histories;
        this.rentals = rentals;
        this.settings = settings;
        this.pkgKeys = ['1h', '3h', '12h', '1d'];
    }
    canAccessPackage(features, pkg, role) {
        if (this.pkgKeys.includes(pkg)) {
            if (!features?.packages || features.packages[pkg] === false) {
                return false;
            }
            if (role === 'superadmin') {
                return true;
            }
            const allowed = Array.isArray(features?.packageRoles?.[pkg]) ? features.packageRoles[pkg] : null;
            if (!allowed || allowed.length === 0) {
                return true;
            }
            if (!role) {
                return false;
            }
            return allowed.includes(role);
        }
        const customList = Array.isArray(features?.customPackages)
            ? features.customPackages.filter((item) => item && item.enabled !== false)
            : [];
        const found = customList.find((item) => item?.id === pkg);
        if (!found) {
            return false;
        }
        if (role === 'superadmin') {
            return true;
        }
        const allowedRoles = Array.isArray(found?.roles)
            ? Array.from(new Set(found.roles
                .map((entry) => typeof entry === 'string' ? entry.toLowerCase().trim() : '')
                .filter((entry) => CUSTOM_PACKAGE_ROLES.includes(entry))))
            : CUSTOM_PACKAGE_ROLES.slice();
        if (allowedRoles.length === 0) {
            return true;
        }
        if (!role) {
            return false;
        }
        return allowedRoles.includes(role);
    }
    async availability(req) {
        const features = await this.settings.getFeatures();
        const counts = {};
        const enabled = {};
        const role = req?.user?.role || null;
        await Promise.all(this.pkgKeys.map(async (pkg) => {
            const allow = this.canAccessPackage(features, pkg, role);
            enabled[pkg] = allow;
            if (allow) {
                counts[pkg] = await this.packages.count({ where: { pkg, status: 'active' } });
            }
            else {
                counts[pkg] = 0;
            }
        }));
        const customList = Array.isArray(features?.customPackages) ? features.customPackages.filter((item) => item && item.enabled !== false) : [];
        for (const item of customList) {
            const id = String(item.id || '').trim();
            if (!id) {
                continue;
            }
            const allow = this.canAccessPackage(features, id, role);
            enabled[id] = allow;
            if (allow) {
                counts[id] = await this.packages.count({ where: { pkg: id, status: 'active' } });
            }
            else {
                counts[id] = 0;
            }
        }
        return { ...counts, enabled };
    }
    async cash(body, req) {
        const { pkg, packageName, price, duration, resortName, guestName, roomNumber } = body || {};
        if (!pkg)
            return { error: 'Missing fields' };
        const pkgId = String(pkg);
        const features = await this.settings.getFeatures();
        if (!features.payments.cash)
            return { error: 'Cash payment disabled' };
        const role = req?.user?.role || null;
        const customList = Array.isArray(features?.customPackages)
            ? features.customPackages.filter((item) => item && item.enabled !== false)
            : [];
        const customMap = new Map(customList.map((item) => [String(item.id || '').trim(), item]));
        const isCustom = customMap.has(pkgId);
        if (!isCustom && !this.pkgKeys.includes(pkgId))
            return { error: 'Invalid package' };
        if (!this.canAccessPackage(features, pkgId, role))
            return { error: 'Package not available for your role' };
        if (isCustom) {
            const selected = customMap.get(pkgId);
            if (!selected)
                return { error: 'Custom package not found' };
            const blockMinutesBase = Number(selected.blockMinutes);
            const blockMinutes = Number.isFinite(blockMinutesBase) && blockMinutesBase > 0 ? Math.round(blockMinutesBase) : 1;
            const priceCandidate = Number(price ?? selected.pricePerBlock);
            const pricePerBlock = Number.isFinite(priceCandidate) && priceCandidate > 0
                ? Math.round(priceCandidate)
                : Math.round(Number(selected.pricePerBlock ?? 0));
            if (!Number.isFinite(pricePerBlock) || pricePerBlock <= 0)
                return { error: 'Invalid custom price' };
            const resolvedName = (packageName && String(packageName).trim()) || selected.name || selected.id || 'Custom Package';
            const resolvedDuration = duration ? String(duration) : `Per ${blockMinutes} minutes`;
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
                packageName: resolvedName,
                price: pricePerBlock,
                duration: resolvedDuration,
                status: 'success',
                paymentMethod: 'cash',
            });
            await this.histories.save(hist);
            try {
                const rental = this.rentals.create({
                    resortName: resortName || 'Unknown Resort',
                    guestName: guestName || 'Guest',
                    roomNumber: roomNumber || '-',
                    pkg: pkgId,
                    packageName: resolvedName,
                    basePrice: pricePerBlock,
                    baseMinutes: blockMinutes,
                    startedAt: Date.now(),
                    status: 'active',
                    billingMode: 'tiered',
                    customPackageId: selected.id,
                    customBlockMinutes: blockMinutes,
                    customBlockRate: pricePerBlock,
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
        if (!packageName || !price)
            return { error: 'Missing fields' };
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
            const baseMinutes = pkgId === '1h' ? 60 : pkgId === '3h' ? 180 : pkgId === '12h' ? 720 : 1440;
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
        if ((role === 'resort' || role === 'partnership') && resortName) {
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
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "availability", null);
__decorate([
    (0, common_1.Post)('cash'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_order_dto_1.CashOrderDto, Object]),
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
    (0, roles_decorator_1.Roles)('resort', 'partnership', 'superadmin'),
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
