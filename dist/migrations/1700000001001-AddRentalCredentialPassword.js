"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRentalCredentialPassword1700000001001 = void 0;
class AddRentalCredentialPassword1700000001001 {
    constructor() {
        this.name = 'AddRentalCredentialPassword1700000001001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "rentals"
      ADD COLUMN IF NOT EXISTS "credentialPassword" varchar(200)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "rentals"
      DROP COLUMN IF EXISTS "credentialPassword"
    `);
    }
}
exports.AddRentalCredentialPassword1700000001001 = AddRentalCredentialPassword1700000001001;
//# sourceMappingURL=1700000001001-AddRentalCredentialPassword.js.map