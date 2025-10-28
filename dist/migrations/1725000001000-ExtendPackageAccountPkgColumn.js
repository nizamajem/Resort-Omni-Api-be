"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendPackageAccountPkgColumn1725000001000 = void 0;
class ExtendPackageAccountPkgColumn1725000001000 {
    constructor() {
        this.name = "ExtendPackageAccountPkgColumn1725000001000";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "package_accounts" ALTER COLUMN "pkg" TYPE character varying(64)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "package_accounts" ALTER COLUMN "pkg" TYPE character varying(20)`);
    }
}
exports.ExtendPackageAccountPkgColumn1725000001000 = ExtendPackageAccountPkgColumn1725000001000;
//# sourceMappingURL=1725000001000-ExtendPackageAccountPkgColumn.js.map