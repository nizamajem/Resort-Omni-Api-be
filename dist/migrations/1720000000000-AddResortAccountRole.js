"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddResortAccountRole1720000000000 = void 0;
class AddResortAccountRole1720000000000 {
    constructor() {
        this.name = 'AddResortAccountRole1720000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "resort_accounts" ADD COLUMN "role" character varying(30) NOT NULL DEFAULT 'resort'`);
        await queryRunner.query(`UPDATE "resort_accounts" SET "role" = 'resort' WHERE "role" IS NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "resort_accounts" DROP COLUMN "role"`);
    }
}
exports.AddResortAccountRole1720000000000 = AddResortAccountRole1720000000000;
//# sourceMappingURL=1720000000000-AddResortAccountRole.js.map