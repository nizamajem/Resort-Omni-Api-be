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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const history_item_entity_1 = require("../entities/history-item.entity");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
function isoDate(d) {
    return d.toISOString().slice(0, 10);
}
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AnalyticsController = class AnalyticsController {
    constructor(histories) {
        this.histories = histories;
    }
    async summary(q) {
        const groupBy = q.groupBy || 'month';
        const now = new Date();
        const endLocal = q.end ? new Date(`${q.end}T23:59:59.999`) : now;
        const startLocal = q.start ? new Date(`${q.start}T00:00:00.000`) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const end = endLocal.toISOString();
        const start = startLocal.toISOString();
        const unit = groupBy === 'week' ? 'week' : groupBy === 'day' ? 'day' : 'month';
        const qb = this.histories
            .createQueryBuilder('h')
            .select('h.resortName', 'resortName')
            .addSelect(`date_trunc('${unit}', h."purchasedAt")`, 'period')
            .addSelect('COUNT(*)', 'orders')
            .addSelect('SUM(h.price)', 'revenue')
            .where('h."purchasedAt" BETWEEN :start AND :end', { start, end })
            .andWhere('h.status = :status', { status: 'success' })
            .groupBy('h.resortName')
            .addGroupBy(`date_trunc('${unit}', h."purchasedAt")`)
            .orderBy('period', 'ASC');
        const rows = await qb.getRawMany();
        const qbPay = this.histories
            .createQueryBuilder('h')
            .select('h.resortName', 'resortName')
            .addSelect('h.paymentMethod', 'paymentMethod')
            .addSelect('COUNT(*)', 'orders')
            .addSelect('SUM(h.price)', 'revenue')
            .where('h."purchasedAt" BETWEEN :start AND :end', { start, end })
            .andWhere('h.status = :status', { status: 'success' })
            .groupBy('h.resortName')
            .addGroupBy('h.paymentMethod')
            .orderBy('h.resortName', 'ASC');
        const byPayRows = await qbPay.getRawMany();
        const totalsMap = new Map();
        const byPaymentMap = new Map();
        for (const r of rows) {
            const key = r.resortName || '-';
            const t = totalsMap.get(key) || { resortName: key, orders: 0, revenue: 0 };
            t.orders += Number(r.orders || 0);
            t.revenue += Number(r.revenue || 0);
            totalsMap.set(key, t);
        }
        for (const r of byPayRows) {
            const key = r.resortName || '-';
            const entry = byPaymentMap.get(key) || {
                resortName: key,
                cash: { orders: 0, revenue: 0 },
                online: { orders: 0, revenue: 0 },
            };
            const method = r.paymentMethod === 'online' ? 'online' : 'cash';
            entry[method].orders += Number(r.orders || 0);
            entry[method].revenue += Number(r.revenue || 0);
            byPaymentMap.set(key, entry);
        }
        const totals = Array.from(totalsMap.values()).sort((a, b) => b.revenue - a.revenue);
        const series = rows.map((r) => ({
            resortName: r.resortName || '-',
            period: r.period instanceof Date ? r.period.toISOString() : String(r.period),
            orders: Number(r.orders || 0),
            revenue: Number(r.revenue || 0),
        }));
        const byPayment = Array.from(byPaymentMap.values());
        return {
            range: { start: isoDate(startLocal), end: isoDate(endLocal), groupBy },
            resorts: totals,
            series,
            byPayment,
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_query_dto_1.AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "summary", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Controller)('analytics'),
    __param(0, (0, typeorm_1.InjectRepository)(history_item_entity_1.HistoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map