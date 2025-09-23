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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmniLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const omni_service_1 = require("./omni.service");
let OmniLoggerMiddleware = class OmniLoggerMiddleware {
    constructor(omni) {
        this.omni = omni;
    }
    use(req, res, next) {
        try {
            this.omni.addLog({
                src: 'mw',
                path: (req.originalUrl || req.url || ''),
                method: req.method,
                ip: req.headers['x-forwarded-for'] || req.ip || '',
                query: req.query || {},
                headers: req.headers,
                body: req.body,
            });
        }
        catch { }
        next();
    }
};
exports.OmniLoggerMiddleware = OmniLoggerMiddleware;
exports.OmniLoggerMiddleware = OmniLoggerMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [omni_service_1.OmniService])
], OmniLoggerMiddleware);
//# sourceMappingURL=omni.logger.middleware.js.map