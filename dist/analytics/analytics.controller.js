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
const rental_entity_1 = require("../entities/rental.entity");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
const business_visualization_query_dto_1 = require("./dto/business-visualization-query.dto");
const settings_service_1 = require("../settings/settings.service");
const generative_ai_1 = require("@google/generative-ai");
function isoDate(d) {
    return d.toISOString().slice(0, 10);
}
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const GEMINI_SETTINGS_KEY = 'business_visualization_insights';
const PACKAGE_META = {
    '1h': { minutes: 60, aliases: ['1 hour', '1 jam'] },
    '3h': { minutes: 180, aliases: ['3 hour', '3 jam'] },
    '12h': { minutes: 720, aliases: ['12 hour', '12 jam'] },
    '1d': { minutes: 1440, aliases: ['1 day', 'full day', '1 hari'] },
};
function parseList(value) {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.filter(Boolean);
    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
function ensureDate(input, fallback) {
    if (!input)
        return new Date(fallback);
    const d = new Date(input);
    if (Number.isNaN(d.getTime()))
        return new Date(fallback);
    return d;
}
function resolvePackageId(name, duration) {
    const lowerName = (name || '').toLowerCase();
    const lowerDuration = (duration || '').toLowerCase();
    if (lowerName.includes('12') || lowerDuration.includes('12'))
        return '12h';
    if (lowerName.includes('day') || lowerDuration.includes('day') || lowerName.includes('hari'))
        return '1d';
    if (lowerName.includes('3') || lowerDuration.includes('3'))
        return '3h';
    return '1h';
}
function fillTrend(start, end, dailyMap) {
    const trend = [];
    const cursor = new Date(start.getTime());
    cursor.setHours(0, 0, 0, 0);
    const limit = new Date(end.getTime());
    limit.setHours(0, 0, 0, 0);
    while (cursor.getTime() <= limit.getTime()) {
        const key = isoDate(cursor);
        const entry = dailyMap.get(key) || { date: key, rides: 0, minutes: 0, revenue: 0 };
        trend.push(entry);
        cursor.setDate(cursor.getDate() + 1);
    }
    return trend;
}
function buildPromptPayload(data) {
    return {
        range: data.range,
        totals: data.totals,
        topResorts: data.topResorts.slice(0, 3),
        packageShare: data.packages,
        recentTrend: data.trend.slice(-5),
    };
}
let AnalyticsController = class AnalyticsController {
    constructor(histories, rentals, settingsService) {
        this.histories = histories;
        this.rentals = rentals;
        this.settingsService = settingsService;
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
            .select('h."resortName"', 'resortName')
            .addSelect(`date_trunc('${unit}', h."purchasedAt")`, 'period')
            .addSelect('COUNT(*)', 'orders')
            .addSelect('SUM(h.price)', 'revenue')
            .where('h."purchasedAt" BETWEEN :start AND :end', { start, end })
            .andWhere('h.status = :status', { status: 'success' })
            .groupBy('h."resortName"')
            .addGroupBy(`date_trunc('${unit}', h."purchasedAt")`)
            .orderBy('period', 'ASC');
        const rows = await qb.getRawMany();
        const qbPay = this.histories
            .createQueryBuilder('h')
            .select('h."resortName"', 'resortName')
            .addSelect('h.paymentMethod', 'paymentMethod')
            .addSelect('COUNT(*)', 'orders')
            .addSelect('SUM(h.price)', 'revenue')
            .where('h."purchasedAt" BETWEEN :start AND :end', { start, end })
            .andWhere('h.status = :status', { status: 'success' })
            .groupBy('h."resortName"')
            .addGroupBy('h.paymentMethod')
            .orderBy('h."resortName"', 'ASC');
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
    async buildBusinessVisualization(params) {
        const now = new Date();
        const timeframeRaw = params.timeframe || params.days || '';
        let timeframeDays = 7;
        if (typeof timeframeRaw === 'string' && timeframeRaw.toLowerCase() !== 'custom') {
            const numeric = parseInt(timeframeRaw.replace(/[^0-9]/g, ''), 10);
            if (Number.isFinite(numeric) && numeric > 0) {
                timeframeDays = numeric;
            }
        }
        const resortFilter = parseList(params.resort || params.resorts).filter(Boolean);
        const packageFilter = parseList(params.package || params.packages)
            .map((value) => value.toLowerCase())
            .filter((value) => Object.prototype.hasOwnProperty.call(PACKAGE_META, value));
        const endDate = ensureDate(params.end ? `${params.end}T23:59:59.999` : undefined, now);
        let startDate;
        if (params.start) {
            startDate = ensureDate(`${params.start}T00:00:00.000`, new Date(endDate.getTime() - (timeframeDays - 1) * 86400000));
        }
        else {
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - (timeframeDays - 1));
        }
        if (startDate > endDate) {
            const tmp = startDate;
            startDate = endDate;
            endDate = tmp;
        }
        if (params.timeframe && params.timeframe.toLowerCase() === 'custom') {
            timeframeDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
        }
        const startBoundary = new Date(startDate.getTime());
        startBoundary.setHours(0, 0, 0, 0);
        const endBoundary = new Date(endDate.getTime());
        endBoundary.setHours(23, 59, 59, 999);
        const baseQuery = this.histories
            .createQueryBuilder('h')
            .where('h.status = :status', { status: 'success' })
            .andWhere('h."purchasedAt" BETWEEN :start AND :end', { start: startBoundary.toISOString(), end: endBoundary.toISOString() });
        if (resortFilter.length) {
            baseQuery.andWhere('h."resortName" IN (:...resorts)', { resorts: resortFilter });
        }
        const historyRows = await baseQuery.getMany();
        const packageFilterSet = new Set(packageFilter);
        const filteredHistory = historyRows.filter((row) => {
            const pkg = resolvePackageId(row.packageName, row.duration);
            return packageFilterSet.size === 0 || packageFilterSet.has(pkg);
        });
        const packageCounts = { '1h': 0, '3h': 0, '12h': 0, '1d': 0 };
        const dailyMap = new Map();
        const resortMap = new Map();
        let totalRides = 0;
        let totalRevenue = 0;
        let lastUpdated = 0;
        filteredHistory.forEach((row) => {
            const price = Number(row.price || 0);
            const resortName = row.resortName || '-';
            const pkg = resolvePackageId(row.packageName, row.duration);
            const dateKey = isoDate(new Date(row.purchasedAt));
            const dayEntry = dailyMap.get(dateKey) || { date: dateKey, rides: 0, minutes: 0, revenue: 0 };
            dayEntry.rides += 1;
            dayEntry.revenue += price;
            dailyMap.set(dateKey, dayEntry);
            const resortEntry = resortMap.get(resortName) || { resortName, rides: 0, minutes: 0, revenue: 0 };
            resortEntry.rides += 1;
            resortEntry.revenue += price;
            resortMap.set(resortName, resortEntry);
            packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
            totalRevenue += price;
            totalRides += 1;
            if (row.purchasedAt instanceof Date) {
                lastUpdated = Math.max(lastUpdated, row.purchasedAt.getTime());
            }
        });
        const rentalQuery = this.rentals
            .createQueryBuilder('r')
            .where('r."startedAt" BETWEEN :start AND :end', { start: startBoundary.getTime(), end: endBoundary.getTime() });
        if (resortFilter.length) {
            rentalQuery.andWhere('r."resortName" IN (:...resorts)', { resorts: resortFilter });
        }
        if (packageFilterSet.size) {
            rentalQuery.andWhere('r."pkg" IN (:...packages)', { packages: Array.from(packageFilterSet.values()) });
        }
        const rentalRows = await rentalQuery.getMany();
        let totalMinutes = 0;
        rentalRows.forEach((rental) => {
            const startedAt = typeof rental.startedAt === 'number' ? rental.startedAt : Number(rental.startedAt || 0);
            const endedAt = typeof rental.endedAt === 'number' ? rental.endedAt : (rental.endedAt ? Number(rental.endedAt) : null);
            const durationMinutes = endedAt && startedAt ? Math.max(0, Math.round((endedAt - startedAt) / 60000)) : rental.baseMinutes || 0;
            const basePrice = Number(rental.basePrice || 0);
            const totalCharge = Math.max(basePrice, Number(rental.amountDue !== null && rental.amountDue !== undefined ? rental.amountDue : basePrice));
            const extraRevenue = Math.max(0, totalCharge - basePrice);
            const resortName = rental.resortName || '-';
            const startedDate = startedAt ? new Date(startedAt) : startBoundary;
            const dateKey = isoDate(startedDate);
            const dayEntry = dailyMap.get(dateKey) || { date: dateKey, rides: 0, minutes: 0, revenue: 0 };
            dayEntry.minutes += durationMinutes;
            dayEntry.revenue += extraRevenue;
            dailyMap.set(dateKey, dayEntry);
            const resortEntry = resortMap.get(resortName) || { resortName, rides: 0, minutes: 0, revenue: 0 };
            resortEntry.minutes += durationMinutes;
            resortEntry.revenue += extraRevenue;
            resortMap.set(resortName, resortEntry);
            totalMinutes += durationMinutes;
            totalRevenue += extraRevenue;
            if (rental.updatedAt instanceof Date) {
                lastUpdated = Math.max(lastUpdated, rental.updatedAt.getTime());
            }
            else if (typeof rental.updatedAt === 'string') {
                const parsed = new Date(rental.updatedAt).getTime();
                if (!Number.isNaN(parsed)) {
                    lastUpdated = Math.max(lastUpdated, parsed);
                }
            }
        });
        const trend = fillTrend(startBoundary, endBoundary, dailyMap);
        const topResorts = Array.from(resortMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        let averageMinutes = totalRides > 0 ? Math.round(totalMinutes / totalRides) : 0;
        if (totalMinutes === 0 && filteredHistory.length > 0) {
            filteredHistory.forEach((row) => {
                const resortName = row.resortName || '-';
                const pkg = resolvePackageId(row.packageName, row.duration);
                const meta = PACKAGE_META[pkg] || PACKAGE_META['1h'];
                const fallbackMinutes = meta.minutes;
                const dateKey = isoDate(new Date(row.purchasedAt));
                const dayEntry = dailyMap.get(dateKey) || { date: dateKey, rides: 0, minutes: 0, revenue: 0 };
                dayEntry.minutes += fallbackMinutes;
                dailyMap.set(dateKey, dayEntry);
                const resortEntry = resortMap.get(resortName) || { resortName, rides: 0, minutes: 0, revenue: 0 };
                resortEntry.minutes += fallbackMinutes;
                resortMap.set(resortName, resortEntry);
                totalMinutes += fallbackMinutes;
            });
            averageMinutes = totalRides > 0 ? Math.round(totalMinutes / totalRides) : 0;
        }
        const resortRows = await this.histories
            .createQueryBuilder('h')
            .select('DISTINCT h."resortName"', 'resortName')
            .orderBy('h."resortName"', 'ASC')
            .getRawMany();
        const availableResorts = resortRows
            .map((row) => row.resortName)
            .filter((name) => !!name)
            .map((name) => ({ id: name, label: name }));
        return {
            range: { start: isoDate(startBoundary), end: isoDate(endBoundary), timeframeDays },
            filters: {
                resorts: resortFilter,
                packages: Array.from(packageFilterSet.values()),
                timeframeDays,
            },
            totals: {
                rides: totalRides,
                minutes: totalMinutes,
                revenue: totalRevenue,
                averageMinutes,
                resortCount: resortMap.size,
            },
            packages: packageCounts,
            trend,
            topResorts,
            availableResorts,
            lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
        };
    }
    async businessVisualization(query) {
        const base = await this.buildBusinessVisualization(query);
        const stored = await this.settingsService.getJson(GEMINI_SETTINGS_KEY, null);
        return {
            ...base,
            insights: stored,
        };
    }
    async regenerateInsights(body) {
        const base = await this.buildBusinessVisualization(body);
        const generated = await this.generateInsights(base, body);
        return { insights: generated };
    }
    async generateInsights(base, filters) {
        const generatedAt = new Date().toISOString();
        const defaultPayload = {
            text: 'Gemini API key is not configured. Set GEMINI_API_KEY to enable automated insights.',
            generatedAt,
            filters: base.filters,
            source: 'fallback',
        };
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            await this.settingsService.setJson(GEMINI_SETTINGS_KEY, defaultPayload);
            return defaultPayload;
        }
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
        const summary = buildPromptPayload(base);
        const prompt = [
            'You are an operations and business strategy analyst for an e-bike resort network in Lombok Area, Indonesia.',
            'You will receive a JSON payload summarising recent performance metrics and trends.',
            'Return Markdown with exactly three sections: Operational Insights, Business Analyst Insight, Actionable Recommendations.',
            'Operational Insights: provide 3 bullets spotlighting utilisation, demand, and operational anomalies.',
            'Business Analyst Insight: provide 2 bullets covering revenue mix, pricing leverage, or customer behaviour shifts.',
            'Actionable Recommendations: provide 3 bullets with a clear action, responsible team, and timeframe (e.g., "Ops � adjust weekend staffing (next 7 days)").',
            'Keep each bullet under 160 characters, reference real metrics when possible, and call out missing data explicitly rather than guessing.',
            `Data: ${JSON.stringify(summary)}`,
        ].join('\n');
        try {
            const response = await generative_ai_1.generateGeminiResponse(apiKey, model, prompt);
            if (!response.ok) {
                const detail = await response.json().catch(() => null);
                const message = detail?.error?.message ? `Gemini request failed (${response.status}): ${detail.error.message}` : `Gemini request failed (${response.status}).`;
                const fallback = { ...defaultPayload, text: message };
                await this.settingsService.setJson(GEMINI_SETTINGS_KEY, fallback);
                return fallback;
            }
            const payload = await response.json();
            const text = Array.isArray(payload?.candidates)
                ? payload.candidates
                    .flatMap((candidate) => Array.isArray(candidate?.content?.parts)
                    ? candidate.content.parts.map((part) => part?.text || '').filter(Boolean)
                    : [])
                    .join('\n')
                    .trim()
                : '';
            const finalText = text || 'No insight was generated.';
            const stored = {
                text: finalText,
                generatedAt,
                filters: base.filters,
                source: 'gemini',
            };
            await this.settingsService.setJson(GEMINI_SETTINGS_KEY, stored);
            return stored;
        }
        catch (err) {
            const fallback = { ...defaultPayload, text: `Failed to reach Gemini: ${err?.message || err}` };
            await this.settingsService.setJson(GEMINI_SETTINGS_KEY, fallback);
            return fallback;
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_query_dto_1.AnalyticsQueryDto]),
    __metadata("design{returntype", Promise)
], AnalyticsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('business-visualization'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_visualization_query_dto_1.BusinessVisualizationQueryDto]),
    __metadata("design{returntype", Promise)
], AnalyticsController.prototype, "businessVisualization", null);
__decorate([
    (0, common_1.Post)('business-visualization/insights'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_visualization_query_dto_1.BusinessVisualizationQueryDto]),
    __metadata("design{returntype", Promise)
], AnalyticsController.prototype, "regenerateInsights", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Controller)('analytics'),
    __param(0, (0, typeorm_1.InjectRepository)(history_item_entity_1.HistoryItem)),
    __param(1, (0, typeorm_1.InjectRepository)(rental_entity_1.Rental)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map




