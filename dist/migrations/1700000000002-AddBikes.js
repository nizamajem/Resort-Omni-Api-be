"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBikes1700000000002 = void 0;
class AddBikes1700000000002 {
    constructor() {
        this.name = 'AddBikes1700000000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bikes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "imei" varchar(32) NOT NULL,
        "ebikeNumber" varchar(50) NOT NULL,
        "displayName" varchar(200),
        "photoUrl" varchar(500),
        "iotPowerPercent" integer,
        "equipmentPower" varchar(50),
        "isOnline" boolean,
        "heartTime" bigint,
        "positionTime" bigint,
        "gsm" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_bikes_imei" ON "bikes" ("imei")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_bikes_ebikeNumber" ON "bikes" ("ebikeNumber")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_bikes_ebikeNumber"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_bikes_imei"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "bikes"`);
    }
}
exports.AddBikes1700000000002 = AddBikes1700000000002;
//# sourceMappingURL=1700000000002-AddBikes.js.map