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
exports.RootOmniController = void 0;
const common_1 = require("@nestjs/common");
const omni_service_1 = require("./omni.service");
let RootOmniController = class RootOmniController {
    constructor(omni) {
        this.omni = omni;
    }
    async root(req, query, headers, body) {
        this.omni.addLog({ src: 'controller', path: req?.url || '/', method: req?.method, ip: (req?.headers?.['x-forwarded-for'] || req?.ip || ''), query, headers, body });
        return '1';
    }
};
exports.RootOmniController = RootOmniController;
__decorate([
    (0, common_1.All)(),
    (0, common_1.Header)('Content-Type', 'text/plain'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RootOmniController.prototype, "root", null);
exports.RootOmniController = RootOmniController = __decorate([
    (0, common_1.Controller)('/'),
    __metadata("design:paramtypes", [omni_service_1.OmniService])
], RootOmniController);
//# sourceMappingURL=root-omni.controller.js.map