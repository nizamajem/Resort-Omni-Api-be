"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDeviceAliases1700000000001 = void 0;
class AddDeviceAliases1700000000001 {
    constructor() {
        this.name = 'AddDeviceAliases1700000000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_aliases" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "imei" varchar(32) NOT NULL,
        "ebikeNumber" varchar(50) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_device_aliases_imei" ON "device_aliases" ("imei")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_device_aliases_ebikeNumber" ON "device_aliases" ("ebikeNumber")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_device_aliases_ebikeNumber"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_device_aliases_imei"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "device_aliases"`);
    }
}
exports.AddDeviceAliases1700000000001 = AddDeviceAliases1700000000001;
//# sourceMappingURL=1700000000001-AddDeviceAliases.js.map