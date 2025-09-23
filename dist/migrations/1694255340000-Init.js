"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1694255340000 = void 0;
class Init1694255340000 {
    constructor() {
        this.name = 'Init1694255340000';
    }
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resort_accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "resortName" varchar(200) NOT NULL,
        "email" varchar(200) NOT NULL,
        "password" varchar(200) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_resort_accounts_email" ON "resort_accounts" ("email")
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "package_accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "pkg" varchar(20) NOT NULL,
        "email" varchar(200) NOT NULL,
        "password" varchar(200) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_package_accounts_email" ON "package_accounts" ("email")
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "history_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "resortName" varchar(200) NOT NULL,
        "userEmail" varchar(200) NOT NULL,
        "userPassword" varchar(200) NOT NULL,
        "packageName" varchar(200) NOT NULL,
        "price" integer NOT NULL,
        "duration" varchar(50) NOT NULL,
        "purchasedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "status" varchar(20) NOT NULL DEFAULT 'success',
        "paymentMethod" varchar(20) NOT NULL,
        "orderId" varchar(200)
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_history_items_userEmail" ON "history_items" ("userEmail")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_history_items_userEmail"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "history_items"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_package_accounts_email"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "package_accounts"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resort_accounts_email"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "resort_accounts"`);
    }
}
exports.Init1694255340000 = Init1694255340000;
//# sourceMappingURL=1694255340000-Init.js.map