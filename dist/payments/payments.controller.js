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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const package_account_entity_1 = require("../entities/package-account.entity");
const history_item_entity_1 = require("../entities/history-item.entity");
const rental_entity_1 = require("../entities/rental.entity");
const snap_token_dto_1 = require("./dto/snap-token.dto");
const complete_payment_dto_1 = require("./dto/complete-payment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const settings_service_1 = require("../settings/settings.service");
let PaymentsController = class PaymentsController {
    constructor(packages, histories, rentals, settings) {
        this.packages = packages;
        this.histories = histories;
        this.rentals = rentals;
        this.settings = settings;
        this.pkgKeys = ['1h', '3h', '1d'];
    }
    resolveMode(mode) {
        if (mode === 'production')
            return 'production';
        if (mode === 'sandbox')
            return 'sandbox';
        return process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'production' : 'sandbox';
    }
    getMidtransConfig(mode) {
        const base = process.env.MIDTRANS_BASE_URL ||
            (mode === 'production'
                ? process.env.MIDTRANS_BASE_URL_PRODUCTION || 'https://api.midtrans.com'
                : process.env.MIDTRANS_BASE_URL_SANDBOX || 'https://api.sandbox.midtrans.com');
        const serverKey = process.env.MIDTRANS_SERVER_KEY ||
            (mode === 'production'
                ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
                : process.env.MIDTRANS_SERVER_KEY_SANDBOX) ||
            '';
        return { base, serverKey };
    }
    async status(orderId, modeParam) {
        if (!orderId)
            return { error: 'Missing orderId' };
        const mode = this.resolveMode(modeParam);
        const { base, serverKey } = this.getMidtransConfig(mode);
        if (!serverKey)
            return { error: 'Midtrans server key missing' };
        const auth = Buffer.from(`${serverKey}:`).toString('base64');
        const res = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
            },
        });
        const text = await res.text();
        if (!res.ok)
            return { error: 'Midtrans status error', detail: text };
        try {
            return JSON.parse(text);
        }
        catch {
            return { raw: text };
        }
    }
    async createSnapToken(body, req) {
        const mode = this.resolveMode(body?.mode);
        const featureKey = mode === 'production' ? 'midtransProduction' : 'midtransSandbox';
        const features = await this.settings.getFeatures();
        if (!features.payments[featureKey]) {
            return { error: 'Online payment disabled' };
        }
        const { base, serverKey } = this.getMidtransConfig(mode);
        if (!serverKey)
            return { error: 'Midtrans server key missing' };
        const auth = Buffer.from(`${serverKey}:`).toString('base64');
        const { orderId, grossAmount, itemName, customer } = body || {};
        const loginEmail = req?.user?.email;
        if (!orderId || !grossAmount)
            return { error: 'Missing orderId/grossAmount' };
        const payload = {
            transaction_details: { order_id: orderId, gross_amount: Number(grossAmount) },
            item_details: [
                { id: 'bike-package', price: Number(grossAmount), quantity: 1, name: itemName || 'Paket Sepeda Listrik' },
            ],
            customer_details: {
                first_name: customer?.firstName || 'Demo',
                email: loginEmail || customer?.email || 'demo@example.com',
            },
            credit_card: { secure: true },
        };
        const res = await fetch(`${base}/snap/v1/transactions`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const text = await res.text();
        if (!res.ok)
            return { error: 'Midtrans error', detail: text };
        const data = JSON.parse(text);
        return { token: data.token, redirect_url: data.redirect_url, mode };
    }
    async complete(body, req) {
        const { orderId, pkg, packageName, price, duration } = body || {};
        const resortName = body?.resortName || req?.user?.resortName || 'Unknown Resort';
        if (!orderId || !pkg || !packageName || !price)
            return { error: 'Missing fields' };
        const pkgId = String(pkg);
        if (!this.pkgKeys.includes(pkgId))
            return { error: 'Invalid package' };
        const mode = this.resolveMode(body?.mode);
        const features = await this.settings.getFeatures();
        const featureKey = mode === 'production' ? 'midtransProduction' : 'midtransSandbox';
        if (!features.packages[pkgId])
            return { error: 'Package disabled' };
        if (!features.payments[featureKey])
            return { error: 'Online payment disabled' };
        const candidates = await this.packages.find({ where: { pkg: pkgId, status: 'active' } });
        if (candidates.length === 0)
            return { error: 'No active account available' };
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        chosen.status = 'sold';
        await this.packages.save(chosen);
        const hist = this.histories.create({
            resortName,
            userEmail: chosen.email,
            userPassword: chosen.password,
            packageName,
            price: Number(price),
            duration: duration || '',
            status: 'success',
            paymentMethod: 'online',
            orderId: String(orderId),
        });
        await this.histories.save(hist);
        try {
            const baseMinutes = pkgId === '1h' ? 60 : pkgId === '3h' ? 180 : 1440;
            const rental = this.rentals.create({
                resortName,
                guestName: body?.guestName || 'Guest',
                roomNumber: body?.roomNumber || '-',
                pkg: pkgId,
                packageName,
                basePrice: Number(price),
                baseMinutes,
                startedAt: Date.now(),
                status: 'active',
            });
            await this.rentals.save(rental);
            return { credential: { email: chosen.email, password: chosen.password }, history: hist, rental };
        }
        catch (e) {
            return { credential: { email: chosen.email, password: chosen.password }, history: hist };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('snap-token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [snap_token_dto_1.SnapTokenDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSnapToken", null);
__decorate([
    (0, common_1.Post)('complete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_payment_dto_1.CompletePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "complete", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('resort', 'superadmin'),
    (0, common_1.Controller)('payments'),
    __param(0, (0, typeorm_1.InjectRepository)(package_account_entity_1.PackageAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(history_item_entity_1.HistoryItem)),
    __param(2, (0, typeorm_1.InjectRepository)(rental_entity_1.Rental)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map