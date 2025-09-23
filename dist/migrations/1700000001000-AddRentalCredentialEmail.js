"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRentalCredentialEmail1700000001000 = void 0;
class AddRentalCredentialEmail1700000001000 {
    constructor() {
        this.name = 'AddRentalCredentialEmail1700000001000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "rentals"
      ADD COLUMN IF NOT EXISTS "credentialEmail" varchar(200)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "rentals"
      DROP COLUMN IF EXISTS "credentialEmail"
    `);
    }
}
exports.AddRentalCredentialEmail1700000001000 = AddRentalCredentialEmail1700000001000;
//# sourceMappingURL=1700000001000-AddRentalCredentialEmail.js.map