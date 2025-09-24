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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resort_account_entity_1 = require("../entities/resort-account.entity");
const jwt_util_1 = require("./jwt.util");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(resorts) {
        this.resorts = resorts;
    }
    async login(body) {
        const { email, password } = body || {};
        if (!email || !password)
            return { error: 'Missing email/password' };
        const builtin = [
            { email: process.env.SUPERADMIN_EMAIL, password: process.env.SUPERADMIN_PASSWORD, role: 'superadmin' },
            { email: 'resort1@demo.id', password: 'resort123', role: 'resort', resortName: 'Re:Flow Beach Resort' },
            { email: 'resort2@demo.id', password: 'resort123', role: 'resort', resortName: 'Re:Flow Hill Resort' },
            { email: 'resort3@demo.id', password: 'resort123', role: 'resort', resortName: 'Sunset Bay Villas' },
        ];
        const bi = builtin.find((a) => a.email && a.email.toLowerCase() === String(email).toLowerCase());
        if (bi && bi.password === password) {
            const { password: _p, ...payload } = bi;
            const token = (0, jwt_util_1.signJwt)({ email: payload.email, role: payload.role, resortName: payload.resortName }, process.env.JWT_SECRET || 'devsecret');
            return { accessToken: token, user: payload };
        }
        const acc = await this.resorts.findOne({ where: { email: String(email).toLowerCase() } });
        if (!acc || acc.status !== 'active' || acc.password !== password) {
            return { error: 'Invalid credentials' };
        }
        const payload = { email: acc.email, role: 'resort', resortName: acc.resortName };
        const token = (0, jwt_util_1.signJwt)(payload, process.env.JWT_SECRET || 'devsecret');
        return { accessToken: token, user: payload };
    }
    async me(req) {
        return { user: req.user };
    }
    async updateProfile(body, req) {
        const role = req?.user?.role;
        if (role !== 'resort')
            throw new common_1.ForbiddenException('Only resort accounts can update profile');
        const currentEmail = req?.user?.email;
        if (!currentEmail)
            return { error: 'Missing user context' };
        const row = await this.resorts.findOne({ where: { email: String(currentEmail).toLowerCase() } });
        if (!row)
            return { error: 'Account not found' };
        const nextResortName = typeof (body?.resortName) === 'string' ? body.resortName.trim() : undefined;
        const nextEmail = typeof (body?.email) === 'string' ? body.email.trim().toLowerCase() : undefined;
        const nextPassword = typeof (body?.password) === 'string' ? body.password : undefined;
        if (nextEmail && nextEmail !== row.email) {
            const exist = await this.resorts.findOne({ where: { email: nextEmail } });
            if (exist && exist.id !== row.id) {
                return { error: 'Email already exists' };
            }
            row.email = nextEmail;
        }
        if (nextResortName)
            row.resortName = nextResortName;
        if (nextPassword)
            row.password = nextPassword;
        await this.resorts.save(row);
        const payload = { email: row.email, role: 'resort', resortName: row.resortName };
        const token = (0, jwt_util_1.signJwt)(payload, process.env.JWT_SECRET || 'devsecret');
        return { ok: true, accessToken: token, user: payload };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, typeorm_1.InjectRepository)(resort_account_entity_1.ResortAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
