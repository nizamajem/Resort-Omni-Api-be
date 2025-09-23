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
exports.BikesController = void 0;
const common_1 = require("@nestjs/common");
const omni_service_1 = require("./omni.service");
let BikesController = class BikesController {
    constructor(omni) {
        this.omni = omni;
    }
    async list() {
        const rows = await this.omni.listBikes();
        const nowSec = Math.floor(Date.now() / 1000);
        const data = rows.map((r) => ({
            ...r,
            isOnline: (r.isOnline === true) || (r.heartTime ? (nowSec - Number(r.heartTime) < 30 * 60) : false),
        }));
        return { ok: true, data };
    }
    async sync() {
        const res = await this.omni.syncBikesFromOmni();
        return { ok: true, ...res };
    }
    async meta(body) {
        const row = await this.omni.setBikeMeta({ imei: body?.imei, ebikeNumber: body?.ebikeNumber, displayName: body?.displayName, photoUrl: body?.photoUrl });
        return { ok: true, data: row };
    }
};
exports.BikesController = BikesController;
__decorate([
    (0, common_1.Get)('bikes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BikesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('bikes/sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BikesController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)('bikes/meta'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BikesController.prototype, "meta", null);
exports.BikesController = BikesController = __decorate([
    (0, common_1.Controller)('iot/omni'),
    __metadata("design:paramtypes", [omni_service_1.OmniService])
], BikesController);
//# sourceMappingURL=bikes.controller.js.map