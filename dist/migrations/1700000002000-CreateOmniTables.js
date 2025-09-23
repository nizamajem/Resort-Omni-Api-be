"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOmniTables1700000002000 = void 0;
class CreateOmniTables1700000002000 {
    constructor() {
        this.name = 'CreateOmniTables1700000002000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "omni_aliases" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ebikeNumber" varchar(64) NOT NULL UNIQUE,
        "imei" varchar(64) NOT NULL UNIQUE,
        "displayName" varchar(200),
        "photoUrl" varchar(500),
        "metadata" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "omni_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ebikeNumber" varchar(64),
        "imei" varchar(64),
        "action" varchar(50) NOT NULL,
        "status" varchar(30),
        "ok" boolean NOT NULL DEFAULT false,
        "note" varchar(300),
        "requestPayload" jsonb,
        "responsePayload" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_omni_logs_ebike" ON "omni_logs" ("ebikeNumber")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_omni_logs_imei" ON "omni_logs" ("imei")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_omni_logs_imei"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_omni_logs_ebike"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "omni_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "omni_aliases"`);
    }
}
exports.CreateOmniTables1700000002000 = CreateOmniTables1700000002000;
//# sourceMappingURL=1700000002000-CreateOmniTables.js.map