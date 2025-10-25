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
exports.CyclingController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rental_entity_1 = require("../entities/rental.entity");
const credential_code_entity_1 = require("../entities/credential-code.entity");
let CyclingController = class CyclingController {
    constructor(rentals, credentials) {
        this.rentals = rentals;
        this.credentials = credentials;
    }
    async history(req, resortFilter) {
        const role = req?.user?.role;
        const resortName = req?.user?.resortName;
        const where = {};
        if ((role === 'resort' || role === 'partnership') && resortName) {
            where.resortName = resortName;
        }
        else if (role === 'superadmin' && resortFilter) {
            where.resortName = resortFilter;
        }
        const rentals = await this.rentals.find({ where, order: { startedAt: 'DESC' } });
        const rentalIds = rentals.map((r) => r.id);
        const credentialByRental = new Map();
        if (rentalIds.length) {
            const rows = await this.credentials.find({ where: { rentalId: (0, typeorm_2.In)(rentalIds) } });
            rows
                .sort((a, b) => {
                const stampA = a.updatedAt ?? a.createdAt;
                const stampB = b.updatedAt ?? b.createdAt;
                const tsA = stampA ? stampA.getTime() : 0;
                const tsB = stampB ? stampB.getTime() : 0;
                return tsB - tsA;
            })
                .forEach((row) => {
                if (row.rentalId) {
                    if (!credentialByRental.has(row.rentalId)) {
                        credentialByRental.set(row.rentalId, row);
                    }
                }
            });
        }
        const mapRental = (rental) => {
            const credential = credentialByRental.get(rental.id);
            const status = rental.status === 'active' ? 'active' : 'completed';
            const telemetry = {
                estimatedRemainingCyclingMiles: null,
                currentElectricQuantity: null,
                currentSpeed: null,
                mileagePerRide: null,
                totalMileageRidden: null,
            };
            const payload = {
                id: rental.id,
                rentalId: rental.id,
                status,
                state: rental.status,
                startedAt: rental.startedAt,
                endedAt: rental.endedAt ?? null,
                guestName: rental.guestName,
                resortName: rental.resortName,
                roomNumber: rental.roomNumber,
                pkg: rental.pkg,
                packageName: rental.packageName,
                amountDue: rental.amountDue ?? null,
                source: 'rental',
                telemetry,
                rental: {
                    id: rental.id,
                    status: rental.status,
                    pkg: rental.pkg,
                    packageName: rental.packageName,
                    amountDue: rental.amountDue ?? null,
                    startedAt: rental.startedAt,
                    endedAt: rental.endedAt ?? null,
                },
            };
            if (credential) {
                payload.credential = {
                    code: credential.code,
                    userId: credential.userId,
                    status: credential.status,
                };
            }
            return payload;
        };
        const active = rentals.filter((r) => r.status === 'active').map(mapRental);
        const history = rentals.filter((r) => r.status !== 'active').map(mapRental);
        return { ok: true, active, history };
    }
};
exports.CyclingController = CyclingController;
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('resortName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CyclingController.prototype, "history", null);
exports.CyclingController = CyclingController = __decorate([
    (0, common_1.Controller)('omni/cycling'),
    __param(0, (0, typeorm_1.InjectRepository)(rental_entity_1.Rental)),
    __param(1, (0, typeorm_1.InjectRepository)(credential_code_entity_1.CredentialCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CyclingController);
//# sourceMappingURL=cycling.controller.js.map
