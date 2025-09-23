"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCredentialCodes1707000000000 = void 0;
class AddCredentialCodes1707000000000 {
    constructor() {
        this.name = 'AddCredentialCodes1707000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "credential_codes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" varchar(32) NOT NULL,
        "userId" varchar(64) NOT NULL,
        "resortName" varchar(200) NOT NULL,
        "rentalId" uuid,
        "status" varchar(10) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_credential_codes_code" ON "credential_codes" ("code")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_credential_codes_status" ON "credential_codes" ("status")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_credential_codes_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_credential_codes_code"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "credential_codes"`);
    }
}
exports.AddCredentialCodes1707000000000 = AddCredentialCodes1707000000000;
//# sourceMappingURL=1707000000000-AddCredentialCodes.js.map