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
exports.RentalsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rental_entity_1 = require("../entities/rental.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const class_validator_1 = require("class-validator");
const EXTRA_RATE = 50000;
const EXTRA_BLOCK_MINUTES = 60;
const EXTRA_GRACE_MINUTES = 10;
const sanitizeRentalResponse = (row) => {
    if (!row) {
        return row;
    }
    const plain = Object.assign({}, row);
    const credentialEmail = typeof plain.credentialEmail === 'string' ? plain.credentialEmail.trim() : '';
    const fallbackEmail = typeof plain.email === 'string' ? plain.email.trim() : '';
    const resolvedEmail = credentialEmail || fallbackEmail || '';
    plain.email = resolvedEmail;
    if (resolvedEmail) {
        plain.credentialEmail = resolvedEmail;
    }
    else if ('credentialEmail' in plain && !plain.credentialEmail) {
        delete plain.credentialEmail;
    }
    if (Object.prototype.hasOwnProperty.call(plain, 'credentialPassword')) {
        delete plain.credentialPassword;
    }
    return plain;
};
class StartRentalDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['1h', '3h', '1d']),
    __metadata("design:type", String)
], StartRentalDto.prototype, "pkg", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StartRentalDto.prototype, "packageName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StartRentalDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], StartRentalDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StartRentalDto.prototype, "resortName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StartRentalDto.prototype, "guestName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], StartRentalDto.prototype, "roomNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StartRentalDto.prototype, "credentialEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StartRentalDto.prototype, "credentialPassword", void 0);
class EndRentalDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EndRentalDto.prototype, "rentalId", void 0);
class SettleRentalDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SettleRentalDto.prototype, "rentalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettleRentalDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettleRentalDto.prototype, "paymentType", void 0);
let RentalsController = class RentalsController {
    constructor(rentals) {
        this.rentals = rentals;
    }
    async list(req, status, resortNameQ) {
        const role = req?.user?.role;
        const resortName = req?.user?.resortName;
        let statuses = ['active', 'unpaid'];
        if (status) {
            const s = status.split(',').map((x) => x.trim()).filter(Boolean);
            if (s.includes('all'))
                statuses = ['active', 'unpaid', 'paid'];
            else
                statuses = s;
        }
        const where = { status: (0, typeorm_2.In)(statuses) };
        if (role === 'resort' && resortName)
            where.resortName = resortName;
        if (role === 'superadmin' && resortNameQ)
            where.resortName = resortNameQ;
        const rows = await this.rentals.find({ where });
        return rows.map((row) => sanitizeRentalResponse(row));
    }
    async start(body, req) {
        const { pkg, packageName, price, duration, guestName, roomNumber } = body || {};
        const resortName = req?.user?.resortName || body?.resortName || 'Unknown Resort';
        if (!pkg || !packageName || !price || !guestName || !roomNumber)
            return { error: 'Missing fields' };
        const baseMinutes = pkg === '1h' ? 60 : pkg === '3h' ? 180 : 1440;
        const rental = this.rentals.create({
            resortName,
            guestName,
            roomNumber,
            pkg,
            packageName,
            basePrice: Number(price),
            baseMinutes,
            startedAt: Date.now(),
            status: 'active',
        });
        if (body?.credentialEmail) {
            rental.credentialEmail = String(body.credentialEmail).trim();
        }
        if (body?.credentialPassword) {
            rental.credentialPassword = String(body.credentialPassword);
        }
        await this.rentals.save(rental);
        return sanitizeRentalResponse(rental);
    }
    async end(body, req) {
        const { rentalId } = body || {};
        if (!rentalId)
            return { error: 'Missing rentalId' };
        const row = await this.rentals.findOne({ where: { id: rentalId } });
        if (!row)
            return { error: 'Not found' };
        if (row.status !== 'active')
            return sanitizeRentalResponse(row);
        const endAt = Date.now();
        const elapsedM = Math.max(0, Math.ceil((endAt - row.startedAt) / 60000));
        const extraMinutes = Math.max(0, elapsedM - row.baseMinutes);
        const chargeableMinutes = Math.max(0, extraMinutes - EXTRA_GRACE_MINUTES);
        const extraBlocks = Math.max(0, Math.ceil(chargeableMinutes / EXTRA_BLOCK_MINUTES));
        const due = row.basePrice + extraBlocks * EXTRA_RATE;
        row.endedAt = endAt;
        row.status = 'unpaid';
        row.amountDue = due;
        await this.rentals.save(row);
        return sanitizeRentalResponse(row);
    }
    async settle(body) {
        const { rentalId, orderId, paymentType } = body || {};
        if (!rentalId)
            return { error: 'Missing rentalId' };
        const row = await this.rentals.findOne({ where: { id: rentalId } });
        if (!row)
            return { error: 'Not found' };
        if (row.status !== 'unpaid')
            return sanitizeRentalResponse(row);
        row.status = 'paid';
        if (orderId)
            row.paymentOrderId = orderId;
        if (paymentType)
            row.paymentType = paymentType;
        await this.rentals.save(row);
        return sanitizeRentalResponse(row);
    }
    async remove(id, req) {
        if (!id)
            return { error: 'Missing id' };
        const role = req?.user?.role;
        if (role !== 'superadmin')
            throw new common_1.ForbiddenException('Only super admin can delete rentals');
        const existing = await this.rentals.findOne({ where: { id } });
        if (!existing)
            return { error: 'Not found' };
        await this.rentals.delete({ id });
        return { ok: true };
    }
};
exports.RentalsController = RentalsController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('resortName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartRentalDto, Object]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('end'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EndRentalDto, Object]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "end", null);
__decorate([
    (0, common_1.Post)('settle'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SettleRentalDto]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "settle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "remove", null);
exports.RentalsController = RentalsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('resort', 'superadmin'),
    (0, common_1.Controller)('rentals'),
    __param(0, (0, typeorm_1.InjectRepository)(rental_entity_1.Rental)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RentalsController);
//# sourceMappingURL=rentals.controller.js.map