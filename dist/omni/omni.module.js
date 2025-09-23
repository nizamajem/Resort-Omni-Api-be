"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmniModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const omni_controller_1 = require("./omni.controller");
const omni_webhook_controller_1 = require("./omni-webhook.controller");
const omni_service_1 = require("./omni.service");
const omni_alias_entity_1 = require("../entities/omni-alias.entity");
const omni_log_entity_1 = require("../entities/omni-log.entity");
let OmniModule = class OmniModule {
};
exports.OmniModule = OmniModule;
exports.OmniModule = OmniModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([omni_alias_entity_1.OmniAlias, omni_log_entity_1.OmniLog])],
        controllers: [omni_controller_1.OmniController, omni_webhook_controller_1.OmniWebhookController],
        providers: [omni_service_1.OmniService],
        exports: [omni_service_1.OmniService],
    })
], OmniModule);
//# sourceMappingURL=omni.module.js.map