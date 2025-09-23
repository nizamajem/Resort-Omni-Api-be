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
exports.OmniController = void 0;
const common_1 = require("@nestjs/common");
const omni_service_1 = require("./omni.service");
function success(data = null) {
    return { ok: true, data };
}
function failure(error, extra = {}) {
    return { ok: false, error, ...extra };
}
let OmniController = class OmniController {
    constructor(service) {
        this.service = service;
    }
    async acceptRoot(body) {
        await this.service.logAction({ action: 'root', ok: true, status: 'received', requestPayload: body ?? null });
        return success({ received: true });
    }
    async callback(body) {
        await this.service.logAction({ action: 'callback', ok: true, status: 'received', requestPayload: body ?? null });
        return '1';
    }
    async ping() {
        return success({ ts: Date.now() });
    }
    async listAliases() {
        const rows = await this.service.listAliases();
        return success(rows);
    }
    async saveAlias(body) {
        const ebikeNumber = String(body?.ebikeNumber || body?.ebike || '').trim();
        const imei = String(body?.imei || '').trim();
        if (!ebikeNumber || !imei)
            return failure('Missing ebikeNumber/imei');
        const saved = await this.service.upsertAlias({
            ebikeNumber,
            imei,
            displayName: body?.displayName,
            photoUrl: body?.photoUrl,
            metadata: body?.metadata,
        });
        await this.service.logAction({
            action: 'alias.save',
            ebikeNumber: saved.ebikeNumber,
            imei: saved.imei,
            ok: true,
            status: 'updated',
            requestPayload: body,
        });
        return success(saved);
    }
    async deleteAlias(ebike) {
        if (!ebike)
            return failure('Missing ebike');
        const removed = await this.service.deleteAlias(ebike.trim());
        if (!removed)
            return failure('Not found');
        await this.service.logAction({ action: 'alias.delete', ebikeNumber: ebike.trim(), ok: true, status: 'deleted' });
        return success(true);
    }
    async saveMeta(body) {
        const imei = String(body?.imei || '').trim();
        if (!imei)
            return failure('Missing imei');
        const updated = await this.service.updateAliasMeta(imei, {
            displayName: body?.displayName,
            photoUrl: body?.photoUrl,
            metadata: body?.metadata,
        });
        if (!updated)
            return failure('Alias not found');
        await this.service.logAction({ action: 'alias.meta', imei, ebikeNumber: updated.ebikeNumber, ok: true, status: 'meta-updated', requestPayload: body });
        return success(updated);
    }
    async listBikes() {
        const aliases = await this.service.listAliases();
        const devices = aliases.map((a) => ({
            id: a.id,
            imei: a.imei,
            ebikeNumber: a.ebikeNumber,
            deviceNo: a.ebikeNumber,
            name: a.displayName || a.ebikeNumber,
            photoUrl: a.photoUrl,
            metadata: a.metadata,
            isOnline: null,
            equipmentStatus: 'unknown',
        }));
        return { ok: true, data: devices };
    }
    async syncBikes() {
        return success({ synced: 0 });
    }
    async resolve(ebike) {
        if (!ebike)
            return failure('Missing ebike');
        const alias = await this.service.resolveByEbike(ebike.trim());
        if (!alias)
            return failure('Not found');
        return success({ imei: alias.imei, ebikeNumber: alias.ebikeNumber });
    }
    async unlock(body) {
        const ebikeNumber = String(body?.ebikeNumber || '').trim();
        const userId = String(body?.userId || '').trim();
        if (!ebikeNumber)
            return failure('Missing ebikeNumber');
        const alias = await this.service.resolveByEbike(ebikeNumber);
        if (!alias)
            return failure('Not found');
        const response = {
            ok: true,
            status: 'queued',
            message: 'Simulated unlock command accepted',
            ebikeNumber,
            imei: alias.imei,
            userId,
        };
        await this.service.logAction({
            action: 'unlock',
            ebikeNumber,
            imei: alias.imei,
            ok: true,
            status: 'queued',
            requestPayload: body,
            responsePayload: response,
        });
        return response;
    }
    async command(body) {
        const imei = String(body?.imei || '').trim();
        const command = String(body?.command || '').trim();
        if (!imei || !command)
            return failure('Missing imei/command');
        const alias = await this.service.resolveByImei(imei);
        if (!alias)
            return failure('Not found');
        const response = {
            ok: true,
            status: 'queued',
            message: 'Simulated command accepted',
            command,
            imei,
            ebikeNumber: alias.ebikeNumber,
        };
        await this.service.logAction({
            action: `command.${command}`,
            ebikeNumber: alias.ebikeNumber,
            imei,
            ok: true,
            status: 'queued',
            requestPayload: body,
            responsePayload: response,
        });
        return response;
    }
    async logs(limit) {
        const list = await this.service.listLogs(limit ? Number(limit) : undefined);
        const mapped = list.map((item) => {
            const ts = item.createdAt instanceof Date ? item.createdAt.getTime() : new Date(item.createdAt).getTime();
            const action = item.action || 'unknown';
            const command = action.startsWith('command.') ? action.split('.').slice(1).join('.') : undefined;
            const omni = {
                imei: item.imei || null,
                ebikeNumber: item.ebikeNumber || null,
                status: item.status || null,
                ok: item.ok,
            };
            if (command)
                omni.instruction = command;
            if (item.responsePayload && typeof item.responsePayload === 'object') {
                const resp = item.responsePayload;
                if (resp.battery != null)
                    omni.battery = resp.battery;
                if (resp.speed != null)
                    omni.speed = resp.speed;
                if (resp.charging != null)
                    omni.charging = resp.charging;
                if (resp.remain != null)
                    omni.remain = resp.remain;
            }
            return {
                ts,
                path: `/iot/omni/${action}`,
                method: 'POST',
                ip: null,
                src: 'controller',
                query: {},
                headers: {},
                body: {
                    action,
                    status: item.status || null,
                    ok: item.ok,
                    note: item.note || null,
                    request: item.requestPayload || null,
                    response: item.responsePayload || null,
                },
                omni,
            };
        });
        return { ok: true, logs: mapped, raw: list };
    }
    async clearLogs() {
        await this.service.clearLogs();
        return { ok: true };
    }
    async proxyFallback(body) {
        await this.service.logAction({ action: 'proxy', ok: false, status: 'not-implemented', requestPayload: body });
        return failure('Omni proxy not implemented on this environment');
    }
};
exports.OmniController = OmniController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "acceptRoot", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "ping", null);
__decorate([
    (0, common_1.Get)('aliases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "listAliases", null);
__decorate([
    (0, common_1.Post)('aliases'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "saveAlias", null);
__decorate([
    (0, common_1.Delete)('aliases'),
    __param(0, (0, common_1.Query)('ebike')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "deleteAlias", null);
__decorate([
    (0, common_1.Post)('bikes/meta'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "saveMeta", null);
__decorate([
    (0, common_1.Get)('bikes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "listBikes", null);
__decorate([
    (0, common_1.Post)('bikes/sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "syncBikes", null);
__decorate([
    (0, common_1.Get)('resolve'),
    __param(0, (0, common_1.Query)('ebike')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('unlock-by-ebike'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "unlock", null);
__decorate([
    (0, common_1.Post)('command'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "command", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "logs", null);
__decorate([
    (0, common_1.Delete)('logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "clearLogs", null);
__decorate([
    (0, common_1.Post)('proxy'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmniController.prototype, "proxyFallback", null);
exports.OmniController = OmniController = __decorate([
    (0, common_1.Controller)('iot/omni'),
    __metadata("design:paramtypes", [omni_service_1.OmniService])
], OmniController);
//# sourceMappingURL=omni.controller.js.map