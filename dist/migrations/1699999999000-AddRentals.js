"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRentals1699999999000 = void 0;
class AddRentals1699999999000 {
    constructor() {
        this.name = 'AddRentals1699999999000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rentals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "resortName" varchar(200) NOT NULL,
        "guestName" varchar(200) NOT NULL,
        "roomNumber" varchar(50) NOT NULL,
        "pkg" varchar(10) NOT NULL,
        "packageName" varchar(200) NOT NULL,
        "basePrice" integer NOT NULL,
        "baseMinutes" integer NOT NULL,
        "startedAt" bigint NOT NULL,
        "endedAt" bigint,
        "status" varchar(20) NOT NULL,
        "amountDue" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rentals_resortName" ON "rentals" ("resortName")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rentals_resortName"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "rentals"`);
    }
}
exports.AddRentals1699999999000 = AddRentals1699999999000;
//# sourceMappingURL=1699999999000-AddRentals.js.map