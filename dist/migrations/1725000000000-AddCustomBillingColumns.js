"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomBillingColumns1725000000000 = void 0;
class AddCustomBillingColumns1725000000000 {
    constructor() {
        this.name = "AddCustomBillingColumns1725000000000";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rentals" ADD "billingMode" character varying(20) NOT NULL DEFAULT 'standard'`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "customPackageId" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlockMinutes" integer`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlockRate" integer`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "customBlocksUsed" integer`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "customElapsedMinutes" integer`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customElapsedMinutes"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlocksUsed"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlockRate"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customBlockMinutes"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "customPackageId"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "billingMode"`);
    }
}
exports.AddCustomBillingColumns1725000000000 = AddCustomBillingColumns1725000000000;
//# sourceMappingURL=1725000000000-AddCustomBillingColumns.js.map