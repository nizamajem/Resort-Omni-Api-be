"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
exports.uid = uid;
exports.nowISO = nowISO;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = require("path");
const dataDir = path.join(process.cwd(), 'resort-be', 'storage');
const dbPath = path.join(dataDir, 'db.json');
let StorageService = class StorageService {
    async ensure() {
        try {
            await fs_1.promises.mkdir(dataDir, { recursive: true });
        }
        catch { }
        try {
            await fs_1.promises.access(dbPath);
        }
        catch {
            const seed = { resorts: [], packageAccounts: [], history: [] };
            await fs_1.promises.writeFile(dbPath, JSON.stringify(seed, null, 2), 'utf8');
        }
    }
    async load() {
        await this.ensure();
        const raw = await fs_1.promises.readFile(dbPath, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            resorts: Array.isArray(data.resorts) ? data.resorts : [],
            packageAccounts: Array.isArray(data.packageAccounts) ? data.packageAccounts : [],
            history: Array.isArray(data.history) ? data.history : [],
        };
    }
    async save(db) {
        await this.ensure();
        await fs_1.promises.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
function uid() {
    return Math.random().toString(36).slice(2, 10);
}
function nowISO() {
    return new Date().toISOString();
}
//# sourceMappingURL=storage.service.js.map