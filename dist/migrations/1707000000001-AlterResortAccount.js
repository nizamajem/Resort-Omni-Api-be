"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterResortAccount1707000000001 = void 0;
class AlterResortAccount1707000000001 {
    constructor() {
        this.name = 'AlterResortAccount1707000000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "resort_accounts" ADD COLUMN IF NOT EXISTS "location" varchar(200)`);
        await queryRunner.query(`ALTER TABLE "resort_accounts" ADD COLUMN IF NOT EXISTS "contactPhone" varchar(50)`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_resort_accounts_resortName" ON "resort_accounts" ("resortName")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resort_accounts_resortName"`);
        await queryRunner.query(`ALTER TABLE "resort_accounts" DROP COLUMN IF EXISTS "contactPhone"`);
        await queryRunner.query(`ALTER TABLE "resort_accounts" DROP COLUMN IF EXISTS "location"`);
    }
}
exports.AlterResortAccount1707000000001 = AlterResortAccount1707000000001;
//# sourceMappingURL=1707000000001-AlterResortAccount.js.map